import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer, Consumer } from 'kafkajs';
import * as crypto from 'crypto';

interface KafkaHandler {
  topic: string;
  callback: (payload: any) => Promise<void>;
}

const topic = 'auth.user.created'

@Injectable()
export class KafkaService implements OnModuleInit {
  private producer: Producer;
  private consumer: Consumer;
  private handlers: KafkaHandler[] = [];

  constructor(@Inject('KAFKA') private readonly kafka: Kafka) { }

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
  }

  async startConsumer() {
    for (const { topic } of this.handlers) {
      await this.consumer.subscribe({ topic, fromBeginning: true });
      console.log(`Post: Kafka subscribed to topic: ${topic}`);
    }

    await this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        console.log('Post: Kafka message received', {
          topic,
          value: message.value?.toString(),
        });

        if (!message.value) return;

        const handlerObj = this.handlers.find(h => h.topic === topic);
        if (!handlerObj) {
          console.warn(`No handler for topic ${topic}`);
          return;
        }

        const parsed = JSON.parse(message.value.toString());
        await handlerObj.callback(parsed);
      },
    });
  }

  /** Register a topic handler before consumer runs */
  registerHandler(topic: string, callback: (payload: any) => Promise<void>) {
    console.log("Post: Kafka register handler called", topic, callback)
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
