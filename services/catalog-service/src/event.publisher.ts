import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EventPublisher {
  private readonly logger = new Logger(EventPublisher.name);

  async publish(eventType: string, payload: any) {
    const event = {
      eventType,
      timestamp: new Date().toISOString(),
      payload,
    };
    
    // Log como abstracción del A1 Event Broker requerido en Biblia Pág. 5
    // Listo para integrarse con RabbitMQ, Kafka o Valkey Streams.
    this.logger.log(`[Event Broker A1 Publisher] Publishing event: ${JSON.stringify(event)}`);
  }
}
