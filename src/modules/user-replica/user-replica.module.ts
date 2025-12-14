import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserReplica } from './user-replica.entity';
import { UserReplicaService } from './user-replica.service';
import { UserReplicaConsumer } from './user-replica.consumer';

@Module({
  imports: [TypeOrmModule.forFeature([UserReplica])],
  providers: [UserReplicaService, UserReplicaConsumer],
  exports: [UserReplicaService],
})
export class UserReplicaModule {}
