import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserReplica } from './user-replica.entity';
import { UserReplicaService } from './user-replica.service';
import { UserReplicaConsumer } from '../kafka/consumers/user-replica.consumer';
import { UserReplicaBootstrap } from './user-replica.bootstrap';
import { IdempotencyModule } from '../kafka/idempotency/idempotency.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserReplica]), IdempotencyModule],
  providers: [UserReplicaService, UserReplicaConsumer, UserReplicaBootstrap],
  exports: [UserReplicaService],
})

export class UserReplicaModule {}
