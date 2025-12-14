import { Injectable, OnModuleInit } from '@nestjs/common';
import { KafkaService } from '../kafka/kafka.service';
import { UserReplicaService } from './user-replica.service';

@Injectable()
export class UserReplicaConsumer implements OnModuleInit {
  constructor(
    private readonly kafka: KafkaService,
    private readonly userReplicaService: UserReplicaService,
  ) { }

  async onModuleInit() {
    const topics = ['user.created', 'user.updated', 'user.username.changed'];

    for (const topic of topics) {
      await this.kafka.subscribe(topic, async (data) => {
        if (!data) return;

        switch (topic) {
          case 'user.created':
            await this.userReplicaService.onUserCreated(data);
            break;

          case 'user.updated':
            await this.userReplicaService.onUserUpdated(data);
            break;

          case 'user.username.changed':
            await this.userReplicaService.onUsernameChanged(data);
            break;
        }
      });
    }
  }
}
