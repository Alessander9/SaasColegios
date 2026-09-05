import { EntitlementService } from './entitlement.service';
import { db, TenantStatus } from '@cole/database';

jest.mock('@cole/database', () => ({
  db: {
    tenant: {
      findUnique: jest.fn(),
    },
    tenantUsage: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  },
  TenantStatus: {
    ACTIVE: 'ACTIVE',
    SUSPENDED: 'SUSPENDED',
    TRIAL: 'TRIAL',
    ARCHIVED: 'ARCHIVED',
  },
  SubscriptionStatus: {
    ACTIVE: 'ACTIVE',
    TRIALING: 'TRIALING',
  },
}));

describe('EntitlementService', () => {
  let service: EntitlementService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EntitlementService();
  });

  it('should allow access to included features in plan', async () => {
    (db.tenant.findUnique as jest.Mock).mockResolvedValue({
      id: 'tenant-1',
      status: TenantStatus.ACTIVE,
      plan: {
        maxStudents: 500,
        maxTeachers: 50,
        maxStorageGb: 50,
        features: ['academic', 'enrollment', 'finance'],
      },
      subscriptions: [],
      overrides: [],
    });

    const resultAcademic = await service.canAccess('tenant-1', 'academic');
    expect(resultAcademic.allowed).toBe(true);

    const resultPayroll = await service.canAccess('tenant-1', 'payroll');
    expect(resultPayroll.allowed).toBe(false);
    expect(resultPayroll.reason).toBe('FEATURE_NOT_INCLUDED');
  });

  it('should reject access if tenant is suspended', async () => {
    (db.tenant.findUnique as jest.Mock).mockResolvedValue({
      id: 'tenant-suspended',
      status: TenantStatus.SUSPENDED,
      plan: {
        maxStudents: 500,
        maxTeachers: 50,
        maxStorageGb: 50,
        features: ['academic'],
      },
      subscriptions: [],
      overrides: [],
    });

    const result = await service.canAccess('tenant-suspended', 'academic');
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('TENANT_SUSPENDED');
  });

  it('should prioritize explicit feature overrides', async () => {
    (db.tenant.findUnique as jest.Mock).mockResolvedValue({
      id: 'tenant-1',
      status: TenantStatus.ACTIVE,
      plan: {
        maxStudents: 100,
        maxTeachers: 10,
        maxStorageGb: 10,
        features: ['academic'],
      },
      subscriptions: [],
      overrides: [
        {
          featureKey: 'payroll',
          enabled: true,
          expiresAt: null,
        },
      ],
    });

    const result = await service.canAccess('tenant-1', 'payroll');
    expect(result.allowed).toBe(true);
  });

  it('should enforce quotas with checkUsage and limits', async () => {
    (db.tenant.findUnique as jest.Mock).mockResolvedValue({
      id: 'tenant-1',
      status: TenantStatus.ACTIVE,
      plan: {
        maxStudents: 500,
        maxTeachers: 50,
        maxStorageGb: 50,
        features: ['academic'],
      },
      subscriptions: [],
      overrides: [],
    });

    (db.tenantUsage.findUnique as jest.Mock).mockResolvedValue({
      value: 499,
    });

    const check1 = await service.checkUsage('tenant-1', 'students', 1);
    expect(check1.allowed).toBe(true);
    expect(check1.current).toBe(499);
    expect(check1.limit).toBe(500);

    const checkExceeded = await service.checkUsage('tenant-1', 'students', 2);
    expect(checkExceeded.allowed).toBe(false);
    expect(checkExceeded.reason).toBe('LIMIT_REACHED');
  });
});
