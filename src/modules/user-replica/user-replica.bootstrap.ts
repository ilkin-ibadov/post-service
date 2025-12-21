import axios from 'axios';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { UserReplicaService } from './user-replica.service';

@Injectable()
export class UserReplicaBootstrap implements OnModuleInit {
  constructor(private readonly userReplicaService: UserReplicaService) {}

  async onModuleInit() {
    const empty = await this.userReplicaService.isEmpty();
    if (!empty) return;

    console.log('[UserReplica] Backfilling from auth-service...');

    const { data } = await axios.get(
      `${process.env.AUTH_SERVICE_URL}/internal/users/replica`,
      {
        headers: {
          'x-internal-key': process.env.INTERNAL_API_KEY,
        },
      },
    );

    await this.userReplicaService.bulkInsert(data);

    console.log(`[UserReplica] Backfilled ${data.length} users`);
  }
}
