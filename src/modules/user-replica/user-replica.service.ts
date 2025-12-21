import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserReplica } from './user-replica.entity';
import { UserCreatedDto } from './dto/user-created.dto';
import { UserUpdatedDto } from './dto/user-updated.dto';
import { UsernameChangedDto } from './dto/username-changed.dto';

@Injectable()
export class UserReplicaService {
  constructor(
    @InjectRepository(UserReplica)
    private readonly repo: Repository<UserReplica>,
  ) { }

  async onUserCreated(data: UserCreatedDto) {
    const exists = await this.repo.exists({ where: { id: data.id } });
    if (exists) return;
    await this.repo.insert(data);
  }

  async onUserUpdated(data: UserUpdatedDto) {
    await this.repo.update(data.id, data);
  }

  async onUsernameChanged({ id, newUsername }: UsernameChangedDto) {
    await this.repo.update(id, { username: newUsername });
  }

  async findByUsername(username: string) {
    return this.repo.findOne({ where: { username } });
  }

  async findManyByUsername(usernames: string[]) {
    return this.repo
      .createQueryBuilder('u')
      .where('u.username = ANY(:usernames)', { usernames })
      .getMany();
  }

  async resolveMentionsLocally(usernames: string[]) {
    const users = await this.findManyByUsername(usernames);
    return users.map((user) => user.id);
  }

  async isEmpty(): Promise<boolean> {
    const count = await this.repo.count();
    return count === 0;
  }

  async bulkInsert(users: UserReplica[]) {
    await this.repo.save(users);
  }
}
