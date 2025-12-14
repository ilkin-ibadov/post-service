import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Unique } from "typeorm";

export type MediaItemType = Array<{
    mediaId: string;
    url: string;
    type: 'image' | 'video';
}>

@Entity('post_replies')
export class PostReply {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    postId: string;

    @Column('uuid')
    userId: string;

    @Column('text')
    content: string

    @Column({ type: 'jsonb', nullable: true })
    mediaItems: MediaItemType;

    @Column('uuid', { array: true, default: [] })
    mentions: string[];

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @DeleteDateColumn()
    deletedAt: Date
}
