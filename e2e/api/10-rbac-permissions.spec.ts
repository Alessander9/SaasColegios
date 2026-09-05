/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  TEST SUITE #10: RBAC PERMISSION MATRIX                                   ║
 * ║  Tests role-based access control for protected endpoints                   ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * Key insight: SUPER_ADMIN doesn't have a tenantId in JWT, so school-scoped
 * endpoints that call extractTenantId() return 403 "Tenant context required".
 * This is correct behavior - SUPER_ADMIN must impersonate to access tenant data.
 *
 * Director is the main role that should access all school-scoped endpoints.
 * Teacher and Parent should be denied on write/admin endpoints.
 */

import { USERS, loginAs, GET, POST } from './helpers';

// Endpoints that ALL school roles (teacher, parent, director) can access
const READ_SCHOOL_ENDPOINTS = [
  { path: '/students', desc: 'Students' },
  { path: '/academic/areas', desc: 'Areas' },
  { path: '/academic/courses', desc: 'Courses' },
  { path: '/academic/sections', desc: 'Sections' },
  { path: '/academic/evaluations', desc: 'Evaluations' },
  { path: '/activities', desc: 'Activities' },
];

// Endpoints that require school.config.view (only director/admin, not teacher/parent)
const CONFIG_VIEW_ENDPOINTS = [
  { path: '/school/profile', desc: 'School profile' },
  { path: '/school/campuses', desc: 'Campuses' },
  { path: '/school/levels', desc: 'Levels' },
  { path: '/school/sections', desc: 'School sections' },
];

const WRITE_ENDPOINTS = [
  { path: '/hr/employees', body: { employeeCode: 'T', documentNumber: '0', firstName: 'T', lastName: 'T', phone: '0', type: 'TEACHER', baseSalary: 1000 }, desc: 'HR create employee' },
  { path: '/academic/areas', body: { levelId: 'x', name: 'T', code: 'T' }, desc: 'Academic create area' },
  { path: '/finance/concepts', body: { code: 'T', name: 'T', category: 'TUITION_PENSION', defaultAmount: 100 }, desc: 'Finance create concept' },
  { path: '/commerce/categories', body: { name: 'T', code: 'T' }, desc: 'Commerce create category' },
];

const ADMIN_ONLY_ENDPOINTS = [
  { path: '/documents', desc: 'Documents' },
  { path: '/audit/logs', desc: 'Audit logs' },
  { path: '/hr/employees', desc: 'HR employees' },
  { path: '/payroll/periods', desc: 'Payroll periods' },
  { path: '/enrollment/admissions', desc: 'Admissions' },
];

const REPORTING_ENDPOINTS = [
  { path: '/reporting/school/overview', desc: 'School overview' },
  { path: '/reporting/school/financial', desc: 'Financial report' },
  { path: '/reporting/school/academic', desc: 'Academic report' },
];

const FINANCE_READ_ENDPOINTS = [
  { path: '/finance/charges', desc: 'Charges' },
];

describe('RBAC Permission Matrix', () => {
  const tokens: Record<string, string> = {};

  beforeAll(async () => {
    for (const role of ['SUPER_ADMIN', 'DIRECTOR', 'TEACHER', 'PARENT'] as const) {
      const userKey = role as keyof typeof USERS;
      if (USERS[userKey]) {
        const token = await loginAs(USERS[userKey]);
        if (token) tokens[role] = token;
      }
    }
  });

  // ═══════════════════════════════════════════════════════════════════════
  // School-scoped READ endpoints: Director has access, others may be denied
  // ═══════════════════════════════════════════════════════════════════════
  describe('School-scoped READ endpoints', () => {
    describe.each(READ_SCHOOL_ENDPOINTS)('$desc ($path)', ({ path }) => {
      it('DIRECTOR should have access', async () => {
        const token = tokens.DIRECTOR;
        if (!token) return;
        const res = await GET(path, token);
        expect(res.status).not.toBe(403);
      });

      it('TEACHER should have read access', async () => {
        const token = tokens.TEACHER;
        if (!token) return;
        const res = await GET(path, token);
        expect(res.status).not.toBe(403);
      });

      it('PARENT should have read access', async () => {
        const token = tokens.PARENT;
        if (!token) return;
        const res = await GET(path, token);
        expect(res.status).not.toBe(403);
      });
    });
  });

  describe('Config view endpoints (school.config.view required)', () => {
    describe.each(CONFIG_VIEW_ENDPOINTS)('$desc ($path)', ({ path }) => {
      it('DIRECTOR should have access', async () => {
        const token = tokens.DIRECTOR;
        if (!token) return;
        const res = await GET(path, token);
        expect(res.status).not.toBe(403);
      });

      it('TEACHER should be denied (no school.config.view)', async () => {
        const token = tokens.TEACHER;
        if (!token) return;
        const res = await GET(path, token);
        expect([401, 403]).toContain(res.status);
      });

      it('PARENT should be denied (no school.config.view)', async () => {
        const token = tokens.PARENT;
        if (!token) return;
        const res = await GET(path, token);
        expect([401, 403]).toContain(res.status);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // WRITE endpoints: Director has access, Teacher/Parent denied
  // ═══════════════════════════════════════════════════════════════════════
  describe('WRITE endpoints - role restrictions', () => {
    describe.each(WRITE_ENDPOINTS)('$desc ($path)', ({ path, body }) => {
      it('DIRECTOR should have write access', async () => {
        const token = tokens.DIRECTOR;
        if (!token) return;
        const res = await POST(path, token, body);
        expect(res.status).not.toBe(403);
      });

      it('TEACHER should be denied', async () => {
        const token = tokens.TEACHER;
        if (!token) return;
        const res = await POST(path, token, body);
        expect([401, 403]).toContain(res.status);
      });

      it('PARENT should be denied', async () => {
        const token = tokens.PARENT;
        if (!token) return;
        const res = await POST(path, token, body);
        expect([401, 403]).toContain(res.status);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // Admin-only endpoints: Teacher/Parent denied
  // ═══════════════════════════════════════════════════════════════════════
  describe('Admin-only endpoints', () => {
    describe.each(ADMIN_ONLY_ENDPOINTS)('$desc ($path)', ({ path }) => {
      it('DIRECTOR should have access', async () => {
        const token = tokens.DIRECTOR;
        if (!token) return;
        const res = await GET(path, token);
        expect(res.status).not.toBe(403);
      });

      it('TEACHER should be denied', async () => {
        const token = tokens.TEACHER;
        if (!token) return;
        const res = await GET(path, token);
        expect([401, 403]).toContain(res.status);
      });

      it('PARENT should be denied', async () => {
        const token = tokens.PARENT;
        if (!token) return;
        const res = await GET(path, token);
        expect([401, 403]).toContain(res.status);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // Reporting: Teacher/Parent denied
  // ═══════════════════════════════════════════════════════════════════════
  describe('Reporting endpoints', () => {
    describe.each(REPORTING_ENDPOINTS)('$desc ($path)', ({ path }) => {
      it('DIRECTOR should have access', async () => {
        const token = tokens.DIRECTOR;
        if (!token) return;
        const res = await GET(path, token);
        expect(res.status).not.toBe(403);
      });

      it('TEACHER should be denied', async () => {
        const token = tokens.TEACHER;
        if (!token) return;
        const res = await GET(path, token);
        expect([401, 403]).toContain(res.status);
      });

      it('PARENT should be denied', async () => {
        const token = tokens.PARENT;
        if (!token) return;
        const res = await GET(path, token);
        expect([401, 403]).toContain(res.status);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // Finance: Teacher denied from charges/payments
  // ═══════════════════════════════════════════════════════════════════════
  describe('Finance endpoints', () => {
    describe.each(FINANCE_READ_ENDPOINTS)('$desc ($path)', ({ path }) => {
      it('DIRECTOR should have access', async () => {
        const token = tokens.DIRECTOR;
        if (!token) return;
        const res = await GET(path, token);
        expect(res.status).not.toBe(403);
      });

      it('PARENT should have read access', async () => {
        const token = tokens.PARENT;
        if (!token) return;
        const res = await GET(path, token);
        expect(res.status).not.toBe(403);
      });

      it('TEACHER should be denied', async () => {
        const token = tokens.TEACHER;
        if (!token) return;
        const res = await GET(path, token);
        expect([401, 403]).toContain(res.status);
      });
    });

    it('TEACHER should be denied from payments', async () => {
      const token = tokens.TEACHER;
      if (!token) return;
      const res = await POST('/finance/payments', token, {
        chargeId: 'x', idempotencyKey: 'x', amount: 100, method: 'CASH',
      });
      expect([401, 403]).toContain(res.status);
    });

    it('DIRECTOR should access payments', async () => {
      const token = tokens.DIRECTOR;
      if (!token) return;
      const res = await POST('/finance/payments', token, {
        chargeId: 'x', idempotencyKey: 'x', amount: 100, method: 'CASH',
      });
      expect(res.status).not.toBe(403);
    });

    it('PARENT should be denied from payments', async () => {
      const token = tokens.PARENT;
      if (!token) return;
      const res = await POST('/finance/payments', token, {
        chargeId: 'x', idempotencyKey: 'x', amount: 100, method: 'CASH',
      });
      expect([401, 403]).toContain(res.status);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // Notifications: Teacher/Parent denied
  // ═══════════════════════════════════════════════════════════════════════
  describe('Notifications', () => {
    it('DIRECTOR should access notifications', async () => {
      const token = tokens.DIRECTOR;
      if (!token) return;
      const res = await GET('/notifications/my', token);
      expect(res.status).not.toBe(403);
    });

    it('TEACHER should be denied', async () => {
      const token = tokens.TEACHER;
      if (!token) return;
      const res = await GET('/notifications/my', token);
      expect([401, 403]).toContain(res.status);
    });

    it('PARENT should be denied', async () => {
      const token = tokens.PARENT;
      if (!token) return;
      const res = await GET('/notifications/my', token);
      expect([401, 403]).toContain(res.status);
    });
  });
});
