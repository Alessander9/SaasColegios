import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '@cole/database';
import { AuditLogFilterDto } from './dto/audit.dto';
import { StructuredLogger } from '@cole/logger';

@Injectable()
export class AuditService {
  private logger = new StructuredLogger('audit-service');

  // --------------------------------------------------
  // AUDIT LOG QUERIES (Read-only)
  // --------------------------------------------------

  async getAuditLogs(
    tenantId: string,
    filters?: AuditLogFilterDto,
    options?: { page?: number; limit?: number },
  ): Promise<any> {
    const page = options?.page || 1;
    const limit = Math.min(options?.limit || 50, 200);
    const skip = (page - 1) * limit;

    const where: any = { tenantId };
    if (filters?.resource) where.resource = filters.resource;
    if (filters?.actorId) where.actorId = filters.actorId;
    if (filters?.action) where.action = { contains: filters.action, mode: 'insensitive' };
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAuditLogById(tenantId: string, id: string): Promise<any> {
    const log = await db.auditLog.findFirst({
      where: { id, tenantId },
    });
    if (!log) throw new NotFoundException('Audit log entry not found');
    return log;
  }

  async getResourceHistory(
    tenantId: string,
    resource: string,
    resourceId: string,
  ): Promise<any[]> {
    return db.auditLog.findMany({
      where: {
        tenantId,
        resource,
        resourceId,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getActorActivity(
    tenantId: string,
    actorId: string,
    options?: { startDate?: string; endDate?: string },
  ): Promise<any[]> {
    const where: any = { tenantId, actorId };
    if (options?.startDate || options?.endDate) {
      where.createdAt = {};
      if (options.startDate) where.createdAt.gte = new Date(options.startDate);
      if (options.endDate) where.createdAt.lte = new Date(options.endDate);
    }

    return db.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  async getAuditStats(tenantId: string, startDate?: string, endDate?: string): Promise<any> {
    const where: any = { tenantId };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const byResource = await db.auditLog.groupBy({
      by: ['resource'],
      where,
      _count: true,
    });

    const byAction = await db.auditLog.groupBy({
      by: ['action'],
      where,
      _count: true,
      orderBy: { _count: { action: 'desc' } },
    });

    const totalLogs = await db.auditLog.count({ where });

    // Top actors
    const actorCounts = await db.auditLog.groupBy({
      by: ['actorId'],
      where,
      _count: true,
      orderBy: { _count: { actorId: 'desc' } },
      take: 10,
    });

    return {
      totalLogs,
      byResource: byResource.map((r) => ({ resource: r.resource, count: r._count })),
      topActions: byAction.slice(0, 20).map((a) => ({ action: a.action, count: a._count })),
      topActors: actorCounts.map((a) => ({ actorId: a.actorId, count: a._count })),
    };
  }

  // --------------------------------------------------
  // AUDIT LOG CREATION (Used internally by other services)
  // --------------------------------------------------

  async createAuditLog(data: {
    tenantId: string;
    actorId: string;
    actorEmail?: string;
    action: string;
    resource: string;
    resourceId: string;
    ipAddress?: string;
    userAgent?: string;
    correlationId?: string;
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  }): Promise<void> {
    await db.auditLog.create({
      data: {
        tenantId: data.tenantId,
        actorId: data.actorId,
        actorEmail: data.actorEmail,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        correlationId: data.correlationId,
        before: data.before ? (data.before as any) : undefined,
        after: data.after ? (data.after as any) : undefined,
      },
    });

    this.logger.info(`Audit log created`, {
      tenantId: data.tenantId,
      actorId: data.actorId,
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId,
    });
  }
}
