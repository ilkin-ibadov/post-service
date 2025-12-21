import { Module, Global } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { KafkaService } from "./kafka.service"

@Global()
@Module({
    providers: [
        KafkaService,
        {
            provide: 'KAFKA',
            useFactory: () => new Kafka({ clientId: 'post-service', brokers: ['kafka:9092'] }),
        }
    ],
    exports: ['KAFKA', KafkaService],
})

export class KafkaModule { }