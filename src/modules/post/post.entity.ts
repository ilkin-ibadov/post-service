import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'jsonb', nullable: true })
  mediaItems: Array<{
    mediaId: string;
    url: string;
    type: 'image' | 'video';
  }>;

  @Column('uuid', { array: true, default: [] })
  mentions: string[];

  @Column({ type: "integer", default: 0 })
  likeCount: number

  @Column({ type: "integer", default: 0 })
  replyCount: number

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
