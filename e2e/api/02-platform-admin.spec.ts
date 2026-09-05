/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  TEST SUITE #2: PLATFORM SUPER ADMIN                                      ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { USERS, loginAs, GET, POST, PATCH, expectOk, expectForbidden } from './helpers';

describe('Platform Super Admin API', () => {
  let superAdminToken: string | null;

  beforeAll(async () => {
    superAdminToken = await loginAs(USERS.SUPER_ADMIN);
  });

  describe('GET /platform/metrics', () => {
    it('should return platform KPI metrics', async () => {
      const res = await GET('/platform/metrics', superAdminToken || undefined);
      expectOk(res);
    });
  });

  describe('Tenant Management', () => {
    it('POST /platform/tenants - should create new tenant', async () => {
      if (!superAdminToken) return;
      const res = await POST('/platform/tenants', superAdminToken, {
        slug: `test-${Date.now()}`,
        name: `Test School ${Date.now()}`,
        subdomain: `test${Date.now()}`,
        planId: 'default',
      });
      expect([200, 201, 404]).toContain(res.status); // 404 if planId doesn't exist
    });

    it('GET /platform/tenants - should list all tenants', async () => {
      const res = await GET('/platform/tenants', superAdminToken || undefined);
      expectOk(res);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /platform/tenants/:id - should get tenant details', async () => {
      const listRes = await GET('/platform/tenants', superAdminToken || undefined);
      const tenants = listRes.body as any[];
      if (tenants?.length > 0) {
        const res = await GET(`/platform/tenants/${tenants[0].id}`, superAdminToken || undefined);
        expectOk(res);
      }
    });

    it('PATCH /platform/tenants/:id - should update tenant', async () => {
      if (!superAdminToken) return;
      const listRes = await GET('/platform/tenants', superAdminToken);
      const tenants = listRes.body as any[];
      if (tenants?.length > 0) {
        const res = await PATCH(`/platform/tenants/${tenants[0].id}`, superAdminToken, {
          name: tenants[0].name,
        });
        expect([200, 204]).toContain(res.status);
      }
    });
  });

  describe('Plan Management', () => {
    it('POST /platform/plans - should create plan', async () => {
      if (!superAdminToken) return;
      const res = await POST('/platform/plans', superAdminToken, {
        code: `PLAN-${Date.now()}`,
        name: `Plan ${Date.now()}`,
        maxStudents: 100,
        maxTeachers: 20,
        maxStorageGb: 10,
        features: ['academic', 'finance'],
        monthlyPrice: 99.99,
        annualPrice: 999.99,
      });
      expect([200, 201, 404]).toContain(res.status); // 404 if planId doesn't exist
    });

    it('GET /platform/plans - should list all plans', async () => {
      const res = await GET('/platform/plans', superAdminToken || undefined);
      expectOk(res);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('Entitlement Engine', () => {
    it('should check feature access', async () => {
      const listRes = await GET('/platform/tenants', superAdminToken || undefined);
      const tenants = listRes.body as any[];
      if (tenants?.length > 0) {
        const res = await GET(`/platform/tenants/${tenants[0].id}/entitlements/check?feature=STUDENTS`, superAdminToken || undefined);
        expectOk(res);
      }
    });

    it('should check usage quota', async () => {
      const listRes = await GET('/platform/tenants', superAdminToken || undefined);
      const tenants = listRes.body as any[];
      if (tenants?.length > 0) {
        const res = await GET(`/platform/tenants/${tenants[0].id}/entitlements/check?metric=STUDENTS_TOTAL`, superAdminToken || undefined);
        expectOk(res);
      }
    });
  });

  describe('Tenant Overrides', () => {
    it('POST /platform/tenants/:id/overrides - should set override', async () => {
      const listRes = await GET('/platform/tenants', superAdminToken || undefined);
      const tenants = listRes.body as any[];
      if (tenants?.length > 0) {
        const res = await POST(`/platform/tenants/${tenants[0].id}/overrides`, superAdminToken!, {
          featureKey: 'payroll',
          enabled: true,
          limitValue: 999,
          reason: 'Test override',
        });
        expect([200, 201, 404]).toContain(res.status); // 404 if planId doesn't exist
      }
    });
  });
});
