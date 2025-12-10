import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Unique } from 'typeorm';

@Entity('post_likes')
@Unique(['postId', 'userId']) // a user can like only once
export class PostLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  postId: string;

  @Column('uuid')
  userId: string;

  @CreateDateColumn()
  createdAt: Date;
}

// FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE