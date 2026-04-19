import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EventPublisher {
  private readonly logger = new Logger(EventPublisher.name);

  async publish(eventType: string, data: any) {
    const event = {
      eventType,
      timestamp: new Date().toISOString(),
      ...data,
    };
    
    // Log como abstracción del A1 Event Broker (Pág. 5)
    this.logger.log(`[Event Broker A1 Publisher] Publishing event: ${JSON.stringify(event)}`);
  }
}
