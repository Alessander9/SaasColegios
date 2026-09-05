import { Injectable, OnModuleInit } from '@nestjs/common';
import { db, OutboxStatus } from '@cole/database';
import { StructuredLogger } from '@cole/logger';

@Injectable()
export class OutboxService implements OnModuleInit {
  private logger = new StructuredLogger('outbox-worker');
  private isProcessing = false;

  onModuleInit() {
    this.logger.info('Outbox background event processor initialized.');
    // Run interval every 5 seconds
    setInterval(() => this.processOutboxEvents(), 5000);
  }

  async processOutboxEvents(): Promise<number> {
    if (this.isProcessing) return 0;
    this.isProcessing = true;

    try {
      // Find up to 20 pending domain events
      const pendingEvents = await db.outbox.findMany({
        where: { status: OutboxStatus.PENDING },
        take: 20,
        orderBy: { createdAt: 'asc' },
      });

      if (pendingEvents.length === 0) {
        this.isProcessing = false;
        return 0;
      }

      this.logger.info(`Processing ${pendingEvents.length} transactional outbox events...`);

      for (const event of pendingEvents) {
        try {
          // Dispatch domain event to listeners / email / notifications
          this.dispatchDomainEvent(event);

          // Mark event as PUBLISHED in PostgreSQL
          await db.outbox.update({
            where: { id: event.id },
            data: {
              status: OutboxStatus.PUBLISHED,
              publishedAt: new Date(),
            },
          });
        } catch (err: any) {
          this.logger.error(`Failed to publish outbox event ${event.id}: ${err.message}`);
          await db.outbox.update({
            where: { id: event.id },
            data: {
              retryCount: event.retryCount + 1,
              lastError: err.message || 'Unknown processing error',
              status: event.retryCount >= 5 ? OutboxStatus.FAILED : OutboxStatus.PENDING,
            },
          });
        }
      }

      this.logger.info(`Successfully dispatched ${pendingEvents.length} domain events.`);
      return pendingEvents.length;
    } catch (err: any) {
      this.logger.error(`Error in outbox processing loop: ${err.message}`);
      return 0;
    } finally {
      this.isProcessing = false;
    }
  }

  private dispatchDomainEvent(event: any) {
    const payload = event.payload ? JSON.parse(JSON.stringify(event.payload)) : {};
    this.logger.info(`📡 [EVENT DISPATCHED] ${event.eventType}`, {
      eventId: event.id,
      tenantId: event.tenantId,
      aggregateId: event.aggregateId,
      eventType: event.eventType,
      payloadSummary: payload,
    });
  }
}
