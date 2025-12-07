import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoModule } from "./modules/mongo/mongo.module"
import { PostModule } from './modules/post/post.module';
import { RedisModule } from "./modules/redis/redis.module"
import { KafkaModule } from "./modules/kafka/kafka.module"
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from "@nestjs/typeorm";
import { typeOrmConfig } from "./ormconfig"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI!),
    PostModule,
    MongoModule,
    RedisModule,
    KafkaModule,
    TypeOrmModule.forRoot(typeOrmConfig),
  ],
})
export class AppModule { }
