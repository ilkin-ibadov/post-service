import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer, Consumer } from 'kafkajs';
import * as crypto from 'crypto';

interface KafkaHandler {
  topic: string;
  callback: (payload: any) => Promise<void>;
}

@Injectable()
export class KafkaService implements OnModuleInit {
  private producer: Producer;
  private consumer: Consumer;
  private handlers: KafkaHandler[] = [];

  constructor(@Inject('KAFKA') private readonly kafka: Kafka) {}

  /** Initialize producer and consumer */
  async onModuleInit() {
    // Producer
    this.producer = this.kafka.producer();
    await this.producer.connect();
    console.log('Post: Kafka producer connected');

    // Consumer
    this.consumer = this.kafka.consumer({ groupId: 'posts-service-group' });
    await this.consumer.connect();
    console.log('Post: Kafka consumer connected');

    // Subscribe all registered handlers
    for (const { topic } of this.handlers) {
      await this.consumer.subscribe({ topic, fromBeginning: false });
      console.log(`Post: Kafka subscribed to topic: ${topic}`);
    }

    // Run consumer
    await this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        if (!message.value) return;

        const handlerObj = this.handlers.find(h => h.topic === topic);
        if (!handlerObj) return;

        try {
          const parsed = JSON.parse(message.value.toString());
          await handlerObj.callback(parsed);
        } catch (err) {
          console.error(`Post: Kafka message processing error on topic ${topic}`, err);
        }
      },
    });
  }

  /** Register a topic handler before consumer runs */
  registerHandler(topic: string, callback: (payload: any) => Promise<void>) {
    this.handlers.push({ topic, callback });
  }

  /** PRODUCER: Send message */
  async produce(topic: string, message: Record<string, any>) {
    try {
      await this.producer.send({
        topic,
        messages: [
          {
            value: JSON.stringify({
              ...message,
              eventId: crypto.randomUUID(),
              occurredAt: new Date(),
            }),
          },
        ],
      });
    } catch (error) {
      console.error('Post: Kafka produce error', error);
    }
  }
}
