import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Unique } from 'typeorm';

@Entity('processed_events')
@Unique(['eventId', 'topic'])
export class ProcessedEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  eventId: string;

  @Column()
  topic: string;

  @CreateDateColumn()
  processedAt: Date;
}
