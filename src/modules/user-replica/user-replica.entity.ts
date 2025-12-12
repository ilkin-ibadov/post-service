import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('user_replicas')
export class UserReplica {
    @PrimaryColumn('uuid')
    id: string; // original userId from auth-service

    @Column()
    username: string;

    //   @Column({ nullable: true })
    //   avatarUrl: string;

    @Column({ default: true })
    active: boolean;
}
