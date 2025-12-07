import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { Kafka, Producer } from "kafkajs";

@Injectable()
export class KafkaProducerService implements OnModuleInit {
    private producer: Producer;

    constructor(@Inject('KAFKA') private readonly kafka: Kafka) { }

    async onModuleInit() {
        this.producer = this.kafka.producer()
        await this.producer.connect()
        console.log('Kafka producer connected')
    }

    async produce(topic: string, message: Record<string, any>) {
        try {
            await this.producer.send({
                topic,
                messages: [{ value: JSON.stringify(message) }]
            })
        } catch (error) {
            console.error('Kafka produce error', error)
        }
    }

}