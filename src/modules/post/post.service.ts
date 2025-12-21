import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { Post } from './post.entity';
import { PostLike } from './like.entity';
import { PostReply } from './reply.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { extractMentions } from '../../utils/mention.util';
import { KafkaService } from '../kafka/kafka.service';
import { MongoService } from '../mongo/mongo.service';
import { RedisService } from '../redis/redis.service';
import { CreateReplyDto } from './dto/create-reply.dto';
import { UserReplicaService } from '../user-replica/user-replica.service';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,

    @InjectRepository(PostLike)
    private readonly likeRepo: Repository<PostLike>,

    @InjectRepository(PostReply)
    private readonly replyRepo: Repository<PostReply>,

    private readonly kafka: KafkaService,
    private readonly mongoService: MongoService,
    private readonly redisService: RedisService,
    private readonly userReplicaService: UserReplicaService,
    private readonly dataSource: DataSource, // needed for transactions
  ) { }

  async resolveMentionsLocally(usernames: string[]) {
    const users = await this.userReplicaService.findManyByUsername(usernames);
    return users.map((user) => user.id);
  }

  async create(userId: string, dto: CreatePostDto) {
    const usernames = extractMentions(dto.content);
    const mentionUserIds = await this.userReplicaService.resolveMentionsLocally(usernames);

    const post = this.postRepo.create({
      userId,
      content: dto.content,
      mediaItems: dto.media || [],
      mentions: mentionUserIds,
    });
    const saved = await this.postRepo.save(post);

    await this.redisService.set(`post:${saved.id}`, saved, 3600);

    await this.kafka.produce('post.created', {
      postId: saved.id,
      userId: saved.userId,
    });

    await this.mongoService.log('info', 'Post created', {
      postId: saved.id,
      userId: saved.userId,
    });

    for (const mentionedUserId of mentionUserIds) {
      await this.kafka.produce('post.mention.created', {
        postId: saved.id,
        mentionedUserId,
        byUserId: saved.userId,
      });
    }

    return saved;
  }

  async findById(id: string) {
    const cached = await this.redisService.get(`post:${id}`);
    if (cached) return cached;

    const post = await this.postRepo.findOne({ where: { id } });
    if (post) await this.redisService.set(`post:${id}`, post, 3600);
    return post;
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    // Fetch posts from DB
    const [posts, total] = await this.postRepo.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    // Preload likeCount and replyCount from Redis
    const postsWithCounts = await Promise.all(posts.map(async (post) => {
      const likeCount = await this.redisService.get(`post:${post.id}:likeCount`);
      const replyCount = await this.redisService.get(`post:${post.id}:replyCount`);

      return {
        ...post,
        likeCount: likeCount !== null ? Number(likeCount) : post.likeCount,
        replyCount: replyCount !== null ? Number(replyCount) : post.replyCount,
      };
    }));

    return {
      data: postsWithCounts,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }


  async update(id: string, userId: string, dto: UpdatePostDto) {
    const post = await this.findById(id);
    if (!post) throw new NotFoundException('Post not found');
    if (post.userId !== userId) throw new ForbiddenException('Cannot edit others post');

    Object.assign(post, dto);
    const updated = await this.postRepo.save(post);

    await this.redisService.set(`post:${id}`, updated, 3600);
    await this.mongoService.log('info', 'Post updated', { postId: updated.id, userId });
    return updated;
  }

  async delete(postId: string, userId: string) {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    if (post.userId !== userId) throw new ForbiddenException('You cannot delete this post');

    await this.postRepo.softDelete(postId);
    await this.redisService.del(`post:${postId}`);
    await this.kafka.produce('post.deleted', { postId, userId });
    await this.mongoService.log('info', 'Post deleted', { postId, userId });

    return { deleted: true };
  }

  // --- Atomic like/unlike using transaction ---
  async likePost(postId: string, userId: string) {
    return this.dataSource.transaction(async (manager) => {
      const post = await manager.findOne(Post, { where: { id: postId } });
      if (!post) throw new NotFoundException('Post not found');

      const exists = await manager.findOne(PostLike, { where: { postId, userId } });
      if (exists) throw new BadRequestException('Already liked');

      await manager.insert(PostLike, { postId, userId });
      await manager.increment(Post, { id: postId }, 'likeCount', 1);

      // Update Redis atomically after DB transaction
      await this.redisService.set(`post:${postId}:likeCount`, post.likeCount + 1);

      await this.kafka.produce('post.liked', { postId, userId });
      return { liked: true };
    });
  }

  async unlikePost(postId: string, userId: string) {
    return this.dataSource.transaction(async (manager) => {
      const post = await manager.findOne(Post, { where: { id: postId } });
      if (!post) throw new NotFoundException('Post not found');

      const deleted = await manager.delete(PostLike, { postId, userId });
      if (deleted.affected) {
        await manager.decrement(Post, { id: postId }, 'likeCount', 1);

        await this.redisService.set(`post:${postId}:likeCount`, post.likeCount - 1);

        await this.kafka.produce('post.unliked', { postId, userId });
      }
      return { unliked: true };
    });
  }

  async getLikes(postId: string) {
    const exists = await this.postRepo.exists({ where: { id: postId } });
    if (!exists) throw new NotFoundException('Post not found');

    return this.likeRepo.find({ where: { postId }, order: { createdAt: 'ASC' } });
  }

  async reply(postId: string, userId: string, dto: CreateReplyDto) {
    return this.dataSource.transaction(async (manager) => {
      const post = await manager.findOne(Post, { where: { id: postId } });
      if (!post) throw new NotFoundException('Post not found');

      const usernames = extractMentions(dto.content);
      const mentionUserIds = await this.userReplicaService.resolveMentionsLocally(usernames);

      const reply = manager.create(PostReply, { postId, userId, content: dto.content, mediaItems: dto.media || [], mentions: mentionUserIds });
      const saved = await manager.save(reply);

      await manager.increment(Post, { id: postId }, 'replyCount', 1);
      await this.redisService.set(`post:${postId}:replyCount`, post.replyCount + 1);

      await this.kafka.produce('post.reply.created', { postId, replyId: saved.id, userId });
      return saved;
    });
  }

  async deleteReply(replyId: string, userId: string) {
    const reply = await this.replyRepo.findOne({ where: { id: replyId } });
    if (!reply) throw new NotFoundException('Reply not found');
    if (reply.userId !== userId) throw new ForbiddenException('Cannot delete others reply');

    return this.dataSource.transaction(async (manager) => {
      await manager.delete(PostReply, { id: replyId });
      await manager.decrement(Post, { id: reply.postId }, 'replyCount', 1);

      const post = await manager.findOne(Post, { where: { id: reply.postId } });
      if (post) {
        // ensure we don't set Redis for a null post
        await this.redisService.set(`post:${reply.postId}:replyCount`, post.replyCount);
      }

      await this.kafka.produce('post.reply.deleted', { postId: reply.postId, replyId, userId });
      return { replyDeleted: true };
    });
  }

  async getReplies(postId: string) {
    const exists = await this.postRepo.exists({ where: { id: postId } });
    if (!exists) throw new NotFoundException('Post not found');

    return this.replyRepo.find({ where: { postId }, order: { createdAt: 'ASC' } });
  }
}
