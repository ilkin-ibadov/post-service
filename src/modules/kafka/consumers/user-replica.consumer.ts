import { Injectable, OnModuleInit } from '@nestjs/common';
import { KafkaService } from '../../kafka/kafka.service';
import { IdempotencyService } from '../../kafka/idempotency/idempotency.service';
import { UserReplicaService } from '../../user-replica/user-replica.service';

@Injectable()
export class UserReplicaConsumer implements OnModuleInit {
  constructor(
    private readonly kafka: KafkaService,
    private readonly idempotency: IdempotencyService,
    private readonly userReplicaService: UserReplicaService,
  ) {}

  onModuleInit() {
    const topics = [
      'auth.user.created',
      'auth.user.updated',
      'auth.user.username.changed',
    ];

    for (const topic of topics) {
      this.kafka.registerHandler(topic, async (event) => {
        if (!event) return;

        const alreadyProcessed = await this.idempotency.isProcessed(
          event.eventId,
          topic,
        );

        if (alreadyProcessed) return;

        switch (topic) {
          case 'auth.user.created':
            await this.userReplicaService.onUserCreated(event.payload);
            break;

          case 'auth.user.updated':
            await this.userReplicaService.onUserUpdated(event.payload);
            break;

          case 'auth.user.username.changed':
            await this.userReplicaService.onUsernameChanged(event.payload);
            break;
        }

        await this.idempotency.markProcessed(event.eventId, topic);
      });
    }
  }
}
