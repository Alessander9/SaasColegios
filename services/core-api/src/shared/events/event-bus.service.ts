import { Injectable } from '@nestjs/common';
import { DomainEvent } from '@cole/domain-types';
import { StructuredLogger } from '@cole/logger';

export interface EventHandler<T = any> {
  handle(event: DomainEvent<T>): Promise<void>;
}

@Injectable()
export class EventBus {
  private handlers = new Map<string, EventHandler[]>();
  private logger = new StructuredLogger('event-bus');

  public subscribe<T>(eventType: string, handler: EventHandler<T>): void {
    const existing = this.handlers.get(eventType) || [];
    existing.push(handler);
    this.handlers.set(eventType, existing);
  }

  public async publish(event: DomainEvent): Promise<void> {
    this.logger.info(`Dispatching domain event: ${event.eventType}`, {
      eventId: event.eventId,
      eventType: event.eventType,
      tenantId: event.tenantId,
      aggregateId: event.aggregateId,
      correlationId: event.correlationId,
    });

    const handlers = this.handlers.get(event.eventType) || [];
    const promises = handlers.map((h) =>
      h.handle(event).catch((err) => {
        this.logger.error(`Handler failed for event ${event.eventType}`, err, {
          eventId: event.eventId,
          tenantId: event.tenantId,
        });
      })
    );

    await Promise.all(promises);
  }
}
