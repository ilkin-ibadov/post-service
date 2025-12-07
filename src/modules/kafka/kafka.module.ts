import { Module, Global } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { KafkaProducerService } from "./kafka.service"

@Global()
@Module({
    providers: [
        {
            provide: 'KAFKA',
            useFactory: () => {
                const brokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
                const clientId = process.env.KAFKA_CLIENT_ID || 'auth-service';
                return new Kafka({ clientId, brokers })
            }
        },
        KafkaProducerService
    ],
    exports: ['KAFKA', KafkaProducerService],
})

export class KafkaModule { }