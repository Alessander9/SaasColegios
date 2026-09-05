import { Injectable, OnModuleDestroy, OnApplicationShutdown } from '@nestjs/common';
import { StructuredLogger } from '@cole/logger';
import { disconnectDatabase } from '@cole/database';

@Injectable()
export class GracefulShutdownService implements OnApplicationShutdown, OnModuleDestroy {
  private logger = new StructuredLogger('graceful-shutdown');
  private isShuttingDown = false;

  async onApplicationShutdown(signal?: string): Promise<void> {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;

    this.logger.info(`Application shutdown initiated`, {
      signal: signal || 'unknown',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });

    await disconnectDatabase();

    this.logger.info(`Shutdown complete`, {
      signal: signal || 'unknown',
      timestamp: new Date().toISOString(),
    });
  }

  onModuleDestroy(): void {
    this.logger.info('Module destroy lifecycle hook fired', {
      timestamp: new Date().toISOString(),
    });
  }

  getIsShuttingDown(): boolean {
    return this.isShuttingDown;
  }
}
