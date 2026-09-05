import { PlatformService } from './platform.service';
import { EntitlementService } from '../entitlement/entitlement.service';
import { db } from '@cole/database';

jest.mock('@cole/database', () => ({
  db: {
    tenant: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    plan: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    tenantOverride: {
      create: jest.fn(),
    },
    tenantUsage: {
      aggregate: jest.fn(),
    },
  },
  withTransactionAndOutbox: jest.fn(async (_db, _tenantId, _events, callback) => {
    return await callback(db);
  }),
  TenantStatus: {
    ACTIVE: 'ACTIVE',
    SUSPENDED: 'SUSPENDED',
    TRIAL: 'TRIAL',
  },
}));

describe('PlatformService', () => {
  let service: PlatformService;
  let entitlementService: EntitlementService;

  beforeEach(() => {
    jest.clearAllMocks();
    entitlementService = new EntitlementService();
    service = new PlatformService(entitlementService);
  });

  it('should list plans', async () => {
    const mockPlans = [
      { id: 'p1', code: 'PLAN_BASIC', name: 'Plan Básico', monthlyPrice: 99 },
      { id: 'p2', code: 'PLAN_PRO', name: 'Plan Profesional', monthlyPrice: 199 },
    ];
    (db.plan.findMany as jest.Mock).mockResolvedValue(mockPlans);

    const result = await service.getPlans();
    expect(result).toEqual(mockPlans);
    expect(db.plan.findMany).toHaveBeenCalled();
  });

  it('should return aggregated platform metrics', async () => {
    (db.tenant.count as jest.Mock)
      .mockResolvedValueOnce(10) // total
      .mockResolvedValueOnce(8)  // active
      .mockResolvedValueOnce(2)  // trial
      .mockResolvedValueOnce(0); // suspended

    (db.tenantUsage.aggregate as jest.Mock).mockResolvedValue({
      _sum: { value: 3450 },
    });

    (db.plan.count as jest.Mock).mockResolvedValue(3);

    const metrics = await service.getPlatformMetrics();
    expect(metrics.tenants.total).toBe(10);
    expect(metrics.tenants.active).toBe(8);
    expect(metrics.usage.totalStudentsActive).toBe(3450);
    expect(metrics.catalog.activePlans).toBe(3);
  });
});
