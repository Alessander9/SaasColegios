import { AuditService } from './audit.service';
import { db } from '@cole/database';

jest.mock('@cole/database', () => ({
  db: {
    auditLog: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      groupBy: jest.fn(),
    },
  },
}));

describe('AuditService', () => {
  let service: AuditService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuditService();
  });

  describe('getAuditLogs', () => {
    it('should return paginated audit logs with filters', async () => {
      (db.auditLog.findMany as jest.Mock).mockResolvedValue([
        { id: 'log-1', action: 'STUDENT_CREATED', resource: 'students' },
      ]);
      (db.auditLog.count as jest.Mock).mockResolvedValue(1);

      const result = await service.getAuditLogs('tenant-1', {
        resource: 'students',
      });

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.page).toBe(1);
    });

    it('should apply date range filters', async () => {
      (db.auditLog.findMany as jest.Mock).mockResolvedValue([]);
      (db.auditLog.count as jest.Mock).mockResolvedValue(0);

      await service.getAuditLogs('tenant-1', {
        startDate: '2026-01-01',
        endDate: '2026-06-30',
      });

      expect(db.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        }),
      );
    });

    it('should respect page and limit options', async () => {
      (db.auditLog.findMany as jest.Mock).mockResolvedValue([]);
      (db.auditLog.count as jest.Mock).mockResolvedValue(100);

      const result = await service.getAuditLogs('tenant-1', {}, { page: 2, limit: 10 });

      expect(result.pagination.page).toBe(2);
      expect(result.pagination.totalPages).toBe(10);
    });
  });

  describe('getAuditLogById', () => {
    it('should return audit log by ID', async () => {
      (db.auditLog.findFirst as jest.Mock).mockResolvedValue({ id: 'log-1', action: 'TEST' });

      const result = await service.getAuditLogById('tenant-1', 'log-1');
      expect(result.id).toBe('log-1');
    });

    it('should throw when not found', async () => {
      (db.auditLog.findFirst as jest.Mock).mockResolvedValue(null);
      await expect(service.getAuditLogById('tenant-1', 'nonexistent')).rejects.toThrow('Audit log entry not found');
    });
  });

  describe('getResourceHistory', () => {
    it('should return history for a specific resource', async () => {
      (db.auditLog.findMany as jest.Mock).mockResolvedValue([
        { id: 'log-1', action: 'UPDATED', resource: 'students', resourceId: 'stu-1' },
        { id: 'log-2', action: 'CREATED', resource: 'students', resourceId: 'stu-1' },
      ]);

      const result = await service.getResourceHistory('tenant-1', 'students', 'stu-1');
      expect(result).toHaveLength(2);
    });
  });

  describe('getActorActivity', () => {
    it('should return activity for a specific actor', async () => {
      (db.auditLog.findMany as jest.Mock).mockResolvedValue([
        { id: 'log-1', actorId: 'user-1', action: 'LOGIN' },
      ]);

      const result = await service.getActorActivity('tenant-1', 'user-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('getAuditStats', () => {
    it('should return audit statistics', async () => {
      (db.auditLog.groupBy as jest.Mock)
        .mockResolvedValueOnce([
          { resource: 'students', _count: 50 },
          { resource: 'payments', _count: 30 },
        ])
        .mockResolvedValueOnce([
          { action: 'STUDENT_CREATED', _count: 25 },
          { action: 'PAYMENT_COMPLETED', _count: 20 },
        ])
        .mockResolvedValueOnce([
          { actorId: 'user-1', _count: 40 },
          { actorId: 'user-2', _count: 20 },
        ]);
      (db.auditLog.count as jest.Mock).mockResolvedValue(80);

      const result = await service.getAuditStats('tenant-1');

      expect(result.totalLogs).toBe(80);
      expect(result.byResource).toHaveLength(2);
      expect(result.topActions).toHaveLength(2);
      expect(result.topActors).toHaveLength(2);
    });
  });

  describe('createAuditLog', () => {
    it('should create an audit log entry', async () => {
      (db.auditLog.create as jest.Mock).mockResolvedValue({});

      await service.createAuditLog({
        tenantId: 'tenant-1',
        actorId: 'user-1',
        actorEmail: 'admin@example.com',
        action: 'STUDENT_CREATED',
        resource: 'students',
        resourceId: 'stu-1',
        ipAddress: '192.168.1.1',
        after: { firstName: 'Mateo' },
      });

      expect(db.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId: 'tenant-1',
            action: 'STUDENT_CREATED',
            resource: 'students',
          }),
        }),
      );
    });
  });
});
