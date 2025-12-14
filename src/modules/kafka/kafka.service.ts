import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { Kafka, Producer, Consumer } from "kafkajs";

@Injectable()
export class KafkaService implements OnModuleInit {
    private producer: Producer;
    private consumer: Consumer;

    constructor(@Inject('KAFKA') private readonly kafka: Kafka) {}

    async onModuleInit() {
        // Initialize producer
        this.producer = this.kafka.producer();
        await this.producer.connect();
        console.log('Kafka producer connected');

        // Initialize consumer (but don't subscribe yet)
        this.consumer = this.kafka.consumer({ groupId: 'posts-service-group' });
        await this.consumer.connect();
        console.log('Kafka consumer connected');
    }

    /** PRODUCER: Send message */
    async produce(topic: string, message: Record<string, any>) {
        try {
            await this.producer.send({
                topic,
                messages: [{ value: JSON.stringify(message) }],
            });
        } catch (error) {
            console.error('Kafka produce error', error);
        }
    }

    /** CONSUMER: Subscribe to a topic */
    async subscribe(topic: string, callback: (payload: any) => Promise<void>) {
        try {
            await this.consumer.subscribe({ topic, fromBeginning: false });

            await this.consumer.run({
                eachMessage: async ({ message }) => {
                    try {
                        const parsed = message.value
                            ? JSON.parse(message.value.toString())
                            : null;

                        await callback(parsed);
                    } catch (err) {
                        console.error(`Kafka message processing error`, err);
                    }
                },
            });

            console.log(`Kafka subscribed to topic: ${topic}`);

        } catch (error) {
            console.error('Kafka subscribe error:', error);
        }
    }
}
