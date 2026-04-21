import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class EventPublisher implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventPublisher.name);
  private connection: any;
  private channel: any;
  private readonly exchange = 'deliunal.events';
  private readonly amqpUrl = process.env.AMQP_URL || 'amqp://guest:guest@event-broker:5672';

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
    } catch (e) {
      this.logger.error(`Error closing AMQP connection: ${e.message}`);
    }
  }

  private async connect() {
    try {
      this.connection = await amqp.connect(this.amqpUrl);
      this.channel = await this.connection.createChannel();
      
      // Asegurar que el exchange tipo topic exista (Biblia Pág. 5)
      await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
      
      this.logger.log(`[Event Broker A1] Connected to RabbitMQ at ${this.amqpUrl}`);
    } catch (error) {
      this.logger.error(`[Event Broker A1] Failed to connect: ${error.message}`);
      // Reintentar en 5 segundos si falla (resiliencia)
      setTimeout(() => this.connect(), 5000);
    }
  }

  async publish(eventType: string, data: any) {
    if (!this.channel) {
      this.logger.warn(`[Event Broker A1] Cannot publish event, channel not ready: ${eventType}`);
      return;
    }

    const event = {
      eventType,
      timestamp: new Date().toISOString(),
      ...data,
    };

    const routingKey = eventType.toLowerCase().replace(/_/g, '.');
    const buffer = Buffer.from(JSON.stringify(event));

    try {
      this.channel.publish(this.exchange, routingKey, buffer, { persistent: true });
      this.logger.log(`[Event Broker A1 Publisher] Published: ${eventType} -> Key: ${routingKey}`);
    } catch (error) {
      this.logger.error(`[Event Broker A1] Error publishing: ${error.message}`);
    }
  }
}
