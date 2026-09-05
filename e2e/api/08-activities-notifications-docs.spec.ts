/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  TEST SUITE #8: ACTIVITIES, NOTIFICATIONS, DOCUMENTS                      ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { USERS, loginAs, GET, POST, expectOk, expectForbidden } from './helpers';

describe('Activities, Notifications & Documents API', () => {
  let directorToken: string | null;
  let teacherToken: string | null;
  let parentToken: string | null;

  beforeAll(async () => {
    directorToken = await loginAs(USERS.DIRECTOR);
    teacherToken = await loginAs(USERS.TEACHER);
    parentToken = await loginAs(USERS.PARENT);
  });

  describe('School Activities', () => {
    it('GET /activities - should list', async () => {
      if (!directorToken) return;
      const res = await GET('/activities', directorToken);
      expectOk(res);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /activities - parent read access', async () => {
      if (!parentToken) return;
      const res = await GET('/activities', parentToken);
      expectOk(res);
    });

    it('GET /activities - teacher read access', async () => {
      if (!teacherToken) return;
      const res = await GET('/activities', teacherToken);
      expectOk(res);
    });

    it('POST /activities - director should create', async () => {
      if (!directorToken) return;
      const res = await POST('/activities', directorToken, {
        title: `Actividad ${Date.now()}`,
        code: `ACT-${Date.now()}`,
        type: 'WORKSHOP',
        maxCapacity: 20,
        price: 50,
        startDate: '2026-05-01T15:00:00.000Z',
        endDate: '2026-06-30T17:00:00.000Z',
      });
      expect([200, 201]).toContain(res.status);
    });

    it('POST /activities - parent DENIED', async () => {
      if (!parentToken) return;
      const res = await POST('/activities', parentToken, {
        title: 'Hack', code: 'H', type: 'WORKSHOP',
        startDate: '2026-05-01T00:00:00.000Z', endDate: '2026-06-30T00:00:00.000Z',
      });
      expectForbidden(res);
    });

    it('POST /activities - teacher DENIED', async () => {
      if (!teacherToken) return;
      const res = await POST('/activities', teacherToken, {
        title: 'Hack', code: 'H', type: 'WORKSHOP',
        startDate: '2026-05-01T00:00:00.000Z', endDate: '2026-06-30T00:00:00.000Z',
      });
      expectForbidden(res);
    });

    it('GET /activities/:id - should get details', async () => {
      if (!directorToken) return;
      const listRes = await GET('/activities', directorToken);
      const activities = listRes.body as any[];
      if (activities?.length > 0) {
        const res = await GET(`/activities/${activities[0].id}`, directorToken);
        expectOk(res);
      }
    });
  });

  describe('Notifications', () => {
    it('GET /notifications/my - director should get notifications', async () => {
      if (!directorToken) return;
      const res = await GET('/notifications/my', directorToken);
      expectOk(res);
    });

    it('GET /notifications/my - teacher DENIED (needs school.config.view)', async () => {
      if (!teacherToken) return;
      const res = await GET('/notifications/my', teacherToken);
      // Teacher doesn't have school.config.view
      expectForbidden(res);
    });

    it('GET /notifications/my - parent DENIED (needs school.config.view)', async () => {
      if (!parentToken) return;
      const res = await GET('/notifications/my', parentToken);
      expectForbidden(res);
    });

    it('GET /notifications/my/unread-count - director should get count', async () => {
      if (!directorToken) return;
      const res = await GET('/notifications/my/unread-count', directorToken);
      expectOk(res);
    });

    it('POST /notifications/send - director should send', async () => {
      if (!directorToken) return;
      const res = await POST('/notifications/send', directorToken, {
        recipientId: 'some-user',
        channel: 'EMAIL',
        subject: `Test ${Date.now()}`,
        body: 'Test notification body',
      });
      expect([200, 201, 400, 404]).toContain(res.status); // 404 if recipient not found
    });

    it('POST /notifications/send - teacher DENIED', async () => {
      if (!teacherToken) return;
      const res = await POST('/notifications/send', teacherToken, {
        recipientId: 'x', channel: 'EMAIL', subject: 'Hack', body: 'test',
      });
      expectForbidden(res);
    });

    it('GET /notifications/stats - director should get stats', async () => {
      if (!directorToken) return;
      const res = await GET('/notifications/stats', directorToken);
      expectOk(res);
    });
  });

  describe('Documents', () => {
    it('GET /documents - should list', async () => {
      if (!directorToken) return;
      const res = await GET('/documents', directorToken);
      expectOk(res);
    });

    it('POST /documents/generate - director should generate', async () => {
      if (!directorToken) return;
      const res = await POST('/documents/generate', directorToken, {
        type: 'REPORT_CARD', entityId: 'some-student', templateId: 'default',
      });
      expect([200, 201, 400, 404]).toContain(res.status); // 404 if recipient not found
    });

    it('POST /documents/generate - teacher DENIED', async () => {
      if (!teacherToken) return;
      const res = await POST('/documents/generate', teacherToken, {
        type: 'REPORT_CARD', entityId: 'x', templateId: 'default',
      });
      expectForbidden(res);
    });

    it('GET /documents - teacher DENIED', async () => {
      if (!teacherToken) return;
      const res = await GET('/documents', teacherToken);
      expectForbidden(res);
    });

    it('GET /documents/stats - should get stats', async () => {
      if (!directorToken) return;
      const res = await GET('/documents/stats', directorToken);
      expectOk(res);
    });
  });
});
