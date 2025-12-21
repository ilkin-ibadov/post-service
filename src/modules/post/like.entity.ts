import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Unique,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Post } from './post.entity';
import { UserReplica } from '../user-replica/user-replica.entity';

@Entity('post_likes')
@Unique(['postId', 'userId'])
export class PostLike {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    postId: string;

    @Column('uuid')
    userId: string;

    @CreateDateColumn()
    createdAt: Date;

    // RELATIONS
    // unidirectional relation
    @ManyToOne(() => Post, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'postId' })
    post: Post;

    // Like => UserReplica
    @ManyToOne(() => UserReplica, {
        eager: false, // IMPORTANT: don't auto-join unless requested
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'userId' })
    user: UserReplica;
}
