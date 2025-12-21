import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcessedEvent } from '../entities/processed-event.entity';

@Injectable()
export class IdempotencyService {
  constructor(
    @InjectRepository(ProcessedEvent)
    private readonly repo: Repository<ProcessedEvent>,
  ) {}

  async isProcessed(eventId: string, topic: string): Promise<boolean> {
    return this.repo.exists({
      where: { eventId, topic },
    });
  }

  async markProcessed(eventId: string, topic: string): Promise<void> {
    const record = this.repo.create({ eventId, topic });
    await this.repo.save(record);
  }
}
