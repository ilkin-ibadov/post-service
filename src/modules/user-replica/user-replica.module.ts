import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserReplica } from './user-replica.entity';
import { UserReplicaService } from './user-replica.service';
import { UserReplicaConsumer } from '../kafka/consumers/user-replica.consumer';
import { UserReplicaBootstrap } from './user-replica.bootstrap';

@Module({
  imports: [TypeOrmModule.forFeature([UserReplica])],
  providers: [UserReplicaService, UserReplicaConsumer, UserReplicaBootstrap],
  exports: [UserReplicaService],
})

export class UserReplicaModule {}
