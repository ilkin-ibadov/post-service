import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    ManyToOne,
    JoinColumn
} from "typeorm";
import { Post } from "./post.entity";
import { UserReplica } from '../user-replica/user-replica.entity';

export type MediaItemType = Array<{
    mediaId: string;
    url: string;
    type: 'image' | 'video';
}>;

@Entity('post_replies')
export class PostReply {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    postId: string;

    @Column('uuid')
    userId: string;

    @Column('text')
    content: string;

    @Column({ type: 'jsonb', nullable: true })
    mediaItems: MediaItemType;

    @Column('uuid', { array: true, default: [] })
    mentions: string[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    // Reply => Post
    @ManyToOne(() => Post, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'postId', referencedColumnName: 'id' })
    post: Post;

    // Reply => UserReplica
    @ManyToOne(() => UserReplica, {
        eager: false, // IMPORTANT: join only when needed
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
    user: UserReplica;
}
