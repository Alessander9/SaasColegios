/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  TEST SUITE #9: AUDIT, SCHOOL CORE, REPORTING                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { USERS, loginAs, GET, POST, PUT, expectOk, expectForbidden } from './helpers';

describe('Audit, School Core & Reporting API', () => {
  let superAdminToken: string | null;
  let directorToken: string | null;
  let teacherToken: string | null;
  let parentToken: string | null;

  beforeAll(async () => {
    superAdminToken = await loginAs(USERS.SUPER_ADMIN);
    directorToken = await loginAs(USERS.DIRECTOR);
    teacherToken = await loginAs(USERS.TEACHER);
    parentToken = await loginAs(USERS.PARENT);
  });

  // ═══ AUDIT ═══
  describe('Audit Logs', () => {
    it('GET /audit/logs - director should query', async () => {
      if (!directorToken) return;
      const res = await GET('/audit/logs', directorToken);
      expectOk(res);
    });

    it('GET /audit/logs - should filter by resource', async () => {
      if (!directorToken) return;
      const res = await GET('/audit/logs', directorToken, { resource: 'student' });
      expectOk(res);
    });

    it('GET /audit/logs - should filter by action', async () => {
      if (!directorToken) return;
      const res = await GET('/audit/logs', directorToken, { action: 'CREATE' });
      expectOk(res);
    });

    it('GET /audit/logs - should support pagination', async () => {
      if (!directorToken) return;
      const res = await GET('/audit/logs', directorToken, { page: '1', limit: '10' });
      expectOk(res);
    });

    it('GET /audit/logs - teacher DENIED', async () => {
      if (!teacherToken) return;
      const res = await GET('/audit/logs', teacherToken);
      expectForbidden(res);
    });

    it('GET /audit/logs - parent DENIED', async () => {
      if (!parentToken) return;
      const res = await GET('/audit/logs', parentToken);
      expectForbidden(res);
    });

    it('GET /audit/stats - director should get stats', async () => {
      if (!directorToken) return;
      const res = await GET('/audit/stats', directorToken);
      expectOk(res);
    });

    it('GET /audit/resource/:resource/:resourceId - should get history', async () => {
      if (!directorToken) return;
      const res = await GET('/audit/resource/student/some-id', directorToken);
      expectOk(res);
    });

    it('GET /audit/actor/:actorId - should get actor activity', async () => {
      if (!directorToken) return;
      const res = await GET('/audit/actor/some-actor', directorToken);
      expectOk(res);
    });
  });

  // ═══ SCHOOL CORE ═══
  describe('School Core', () => {
    it('GET /school/profile - should get profile', async () => {
      if (!directorToken) return;
      const res = await GET('/school/profile', directorToken);
      expectOk(res);
    });

    it('PUT /school/profile - director should update', async () => {
      if (!directorToken) return;
      const res = await PUT('/school/profile', directorToken, { legalName: 'Colegio San José S.A.C.' });
      expect([200, 204]).toContain(res.status);
    });

    it('PUT /school/profile - teacher DENIED', async () => {
      if (!teacherToken) return;
      const res = await PUT('/school/profile', teacherToken, { legalName: 'Hack' });
      expectForbidden(res);
    });

    it('GET /school/campuses - should list', async () => {
      if (!directorToken) return;
      const res = await GET('/school/campuses', directorToken);
      expectOk(res);
    });

    it('POST /school/campuses - director should create', async () => {
      if (!directorToken) return;
      const res = await POST('/school/campuses', directorToken, { name: `Sede ${Date.now()}`, code: `SEDE-${Date.now()}`, address: 'Av. Test 123' });
      expect([200, 201]).toContain(res.status);
    });

    it('GET /school/academic-years - should list', async () => {
      if (!directorToken) return;
      const res = await GET('/school/academic-years', directorToken);
      expectOk(res);
    });

    it('GET /school/levels - should list', async () => {
      if (!directorToken) return;
      const res = await GET('/school/levels', directorToken);
      expectOk(res);
    });

    it('GET /school/sections - should list', async () => {
      if (!directorToken) return;
      const res = await GET('/school/sections', directorToken);
      expectOk(res);
    });

    it('POST /school/campuses - teacher DENIED', async () => {
      if (!teacherToken) return;
      const res = await POST('/school/campuses', teacherToken, { name: 'Hack' });
      expectForbidden(res);
    });
  });

  // ═══ REPORTING ═══
  describe('Reporting & BI', () => {
    it('GET /reporting/platform/overview - super admin', async () => {
      if (!superAdminToken) return;
      const res = await GET('/reporting/platform/overview', superAdminToken);
      expectOk(res);
    });

    it('GET /reporting/platform/overview - director DENIED', async () => {
      if (!directorToken) return;
      const res = await GET('/reporting/platform/overview', directorToken);
      expectForbidden(res);
    });

    it('GET /reporting/school/overview - director should get', async () => {
      if (!directorToken) return;
      const res = await GET('/reporting/school/overview', directorToken);
      expectOk(res);
    });

    it('GET /reporting/school/financial - director should get', async () => {
      if (!directorToken) return;
      const res = await GET('/reporting/school/financial', directorToken);
      expectOk(res);
    });

    it('GET /reporting/school/academic - director should get', async () => {
      if (!directorToken) return;
      const res = await GET('/reporting/school/academic', directorToken);
      expectOk(res);
    });

    it('GET /reporting/school/attendance - director should get', async () => {
      if (!directorToken) return;
      const res = await GET('/reporting/school/attendance', directorToken);
      expectOk(res);
    });

    it('GET /reporting/school/commerce - director should get', async () => {
      if (!directorToken) return;
      const res = await GET('/reporting/school/commerce', directorToken);
      expectOk(res);
    });

    it('GET /reporting/school/activities - director should get', async () => {
      if (!directorToken) return;
      const res = await GET('/reporting/school/activities', directorToken);
      expectOk(res);
    });

    it('GET /reporting/school/staff - director should get', async () => {
      if (!directorToken) return;
      const res = await GET('/reporting/school/staff', directorToken);
      expectOk(res);
    });

    it('GET /reporting/school/overview - teacher DENIED', async () => {
      if (!teacherToken) return;
      const res = await GET('/reporting/school/overview', teacherToken);
      expectForbidden(res);
    });

    it('GET /reporting/export/students - director should export', async () => {
      if (!directorToken) return;
      const res = await GET('/reporting/export/students', directorToken);
      expectOk(res);
    });

    it('GET /reporting/export/payments - director should export', async () => {
      if (!directorToken) return;
      const res = await GET('/reporting/export/payments', directorToken);
      expectOk(res);
    });

    it('GET /reporting/export/grades - director should export', async () => {
      if (!directorToken) return;
      const res = await GET('/reporting/export/grades', directorToken);
      expectOk(res);
    });

    it('GET /reporting/export/attendance - director should export', async () => {
      if (!directorToken) return;
      const res = await GET('/reporting/export/attendance', directorToken);
      expectOk(res);
    });

    it('GET /reporting/export/students - teacher DENIED', async () => {
      if (!teacherToken) return;
      const res = await GET('/reporting/export/students', teacherToken);
      expectForbidden(res);
    });
  });
});
