import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from "./auth/auth.module"
import { UsersModule } from "./users/users.module"
import { ConfigModule } from '@nestjs/config';
import {TodosModule} from "./todos/todos.module"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI!),
    AuthModule,
    UsersModule,
    TodosModule
  ],
})
export class AppModule { }
