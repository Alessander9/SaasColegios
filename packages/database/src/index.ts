import { PrismaClient } from '@prisma/client';
import { DomainEvent } from '@cole/domain-types';
import * as path from 'path';
import * as fs from 'fs';

export * from '@prisma/client';

function getDatabaseUrl(): string {
  const envPaths = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '../../.env'),
    path.resolve(process.cwd(), '../.env'),
    path.resolve(__dirname, '../.env'),
    path.resolve(__dirname, '../../.env'),
    path.resolve(__dirname, '../../../.env'),
  ];
  for (const p of envPaths) {
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.startsWith('DATABASE_URL=')) {
          const val = trimmed.substring('DATABASE_URL='.length).trim().replace(/^["']|["']$/g, '');
          if (val) return val;
        }
      }
    }
  }
  return process.env['DATABASE_URL'] || 'postgresql://cole_user:cole_password@127.0.0.1:5433/cole_platform?schema=public';
}

process.env['DATABASE_URL'] = getDatabaseUrl();

export class DatabaseClient {
  private static instance: PrismaClient;

  public static getInstance(): PrismaClient {
    if (!DatabaseClient.instance) {
      const dbUrl = getDatabaseUrl();
      DatabaseClient.instance = new PrismaClient({
        datasources: {
          db: {
            url: dbUrl,
          },
        },
        log: process.env['NODE_ENV'] === 'development' ? ['warn', 'error'] : ['error'],
      });
    }
    return DatabaseClient.instance;
  }

  public static async disconnect(): Promise<void> {
    if (DatabaseClient.instance) {
      await DatabaseClient.instance.$disconnect();
    }
  }
}

export const db = DatabaseClient.getInstance();

export async function disconnectDatabase(): Promise<void> {
  await DatabaseClient.disconnect();
}

/**
 * Helper to execute database mutations and store domain events into Outbox atomically
 */
export async function withTransactionAndOutbox<T>(
  prisma: PrismaClient,
  _tenantId: string,
  events: DomainEvent[],
  operation: (tx: Parameters<Parameters<PrismaClient['$transaction']>[0]>[0]) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(async (tx) => {
    // 1. Execute Domain Operation
    const result = await operation(tx);

    // 2. Store Outbox Events in the same SQL Transaction
    for (const event of events) {
      await (tx as unknown as PrismaClient).outbox.create({
        data: {
          id: event.eventId,
          tenantId: event.tenantId,
          eventType: event.eventType,
          aggregateType: event.eventType.split('.')[0] || 'Unknown',
          aggregateId: event.aggregateId,
          correlationId: event.correlationId,
          payload: event.payload as any,
          status: 'PENDING',
        },
      });
    }

    return result;
  });
}
