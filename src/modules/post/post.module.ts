import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './post.entity';
import { PostLike } from './like.entity';
import { PostReply } from './reply.entity';
import { UserReplica } from '../user-replica/user-replica.entity';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { KafkaService } from '../kafka/kafka.service'
import { UserReplicaService } from '../user-replica/user-replica.service';
import { UserReplicaConsumer } from '../user-replica/user-replica.consumer';
import { RedisService } from '../redis/redis.service';
import { MongoService } from '../mongo/mongo.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post, PostLike, PostReply, UserReplica])],
  controllers: [PostController],
  providers: [
    PostService,
    KafkaService,
    UserReplicaService,
    UserReplicaConsumer,
    RedisService,
    MongoService,
  ],
})
export class PostModule { }
