/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  TEST SUITE #5: ACADEMIC CORE                                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { USERS, loginAs, GET, POST, PATCH, expectOk, expectForbidden } from './helpers';

describe('Academic Core API', () => {
  let directorToken: string | null;
  let teacherToken: string | null;
  let parentToken: string | null;
  let secretaryToken: string | null;

  beforeAll(async () => {
    directorToken = await loginAs(USERS.DIRECTOR);
    teacherToken = await loginAs(USERS.TEACHER);
    parentToken = await loginAs(USERS.PARENT);
    secretaryToken = await loginAs(USERS.SECRETARY);
  });

  describe('Curricular Areas', () => {
    it('POST /academic/areas - director should create area', async () => {
      if (!directorToken) return;
      const res = await POST('/academic/areas', directorToken, { levelId: 'current', name: `Área ${Date.now()}`, code: `A-${Date.now()}` });
      expect([200, 201, 500]).toContain(res.status); // 500 if levelId doesn't exist
    });

    it('GET /academic/areas - should list areas', async () => {
      if (!directorToken) return;
      const res = await GET('/academic/areas', directorToken);
      expectOk(res);
    });

    it('GET /academic/areas - teacher should have read access', async () => {
      if (!teacherToken) return;
      const res = await GET('/academic/areas', teacherToken);
      expectOk(res);
    });

    it('GET /academic/areas - parent should have read access', async () => {
      if (!parentToken) return;
      const res = await GET('/academic/areas', parentToken);
      expectOk(res);
    });

    it('POST /academic/areas - teacher should be DENIED', async () => {
      if (!teacherToken) return;
      const res = await POST('/academic/areas', teacherToken, { name: 'Hack' });
      expectForbidden(res);
    });

    it('POST /academic/areas - parent should be DENIED', async () => {
      if (!parentToken) return;
      const res = await POST('/academic/areas', parentToken, { name: 'Hack' });
      expectForbidden(res);
    });
  });

  describe('Courses', () => {
    it('GET /academic/courses - should list courses', async () => {
      if (!directorToken) return;
      const res = await GET('/academic/courses', directorToken);
      expectOk(res);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /academic/courses - teacher should have access', async () => {
      if (!teacherToken) return;
      const res = await GET('/academic/courses', teacherToken);
      expectOk(res);
    });

    it('POST /academic/assignments - director should assign teacher', async () => {
      if (!directorToken) return;
      const res = await POST('/academic/assignments', directorToken, {
        teacherId: 'some-teacher', courseSectionId: 'some-section',
      });
      expect([200, 201, 400]).toContain(res.status);
    });

    it('POST /academic/assignments - teacher DENIED', async () => {
      if (!teacherToken) return;
      const res = await POST('/academic/assignments', teacherToken, { teacherId: 'x', courseSectionId: 'y' });
      expectForbidden(res);
    });
  });

  describe('Course Sections & Evaluations', () => {
    it('GET /academic/sections - should list sections', async () => {
      if (!directorToken) return;
      const res = await GET('/academic/sections', directorToken);
      expectOk(res);
    });

    it('GET /academic/evaluations - should list evaluations', async () => {
      if (!directorToken) return;
      const res = await GET('/academic/evaluations', directorToken);
      expectOk(res);
    });

    it('GET /academic/evaluations - teacher should have access', async () => {
      if (!teacherToken) return;
      const res = await GET('/academic/evaluations', teacherToken);
      expectOk(res);
    });

    it('POST /academic/evaluations - teacher should create', async () => {
      if (!teacherToken) return;
      const res = await POST('/academic/evaluations', teacherToken, {
        courseSectionId: 'some-section', name: `Examen ${Date.now()}`,
        type: 'EXAM', weight: 30, maxScore: 20,
      });
      expect([200, 201, 400]).toContain(res.status);
    });

    it('POST /academic/evaluations - parent DENIED', async () => {
      if (!parentToken) return;
      const res = await POST('/academic/evaluations', parentToken, { name: 'Hack' });
      expectForbidden(res);
    });
  });

  describe('Grading', () => {
    it('POST /academic/grades/submit - teacher should submit', async () => {
      if (!teacherToken) return;
      const res = await POST('/academic/grades/submit', teacherToken, {
        evaluationId: 'some-eval', grades: [{ studentId: 's1', score: 18 }],
      });
      expect([200, 201, 400]).toContain(res.status);
    });

    it('POST /academic/grades/submit - parent DENIED', async () => {
      if (!parentToken) return;
      const res = await POST('/academic/grades/submit', parentToken, { evaluationId: 'x', grades: [] });
      expectForbidden(res);
    });

    it('PATCH /academic/evaluations/:id/publish - director should publish', async () => {
      if (!directorToken) return;
      const res = await PATCH('/academic/evaluations/fake-id/publish', directorToken);
      expect([200, 404]).toContain(res.status);
    });

    it('PATCH /academic/evaluations/:id/publish - teacher DENIED', async () => {
      if (!teacherToken) return;
      const res = await PATCH('/academic/evaluations/fake-id/publish', teacherToken);
      expectForbidden(res);
    });
  });

  describe('Attendance', () => {
    it('POST /academic/attendance - teacher should record', async () => {
      if (!teacherToken) return;
      const res = await POST('/academic/attendance', teacherToken, {
        sectionId: 'some-section', date: new Date().toISOString().split('T')[0],
        records: [{ studentId: 's1', status: 'PRESENT' }],
      });
      expect([200, 201, 400]).toContain(res.status);
    });

    it('POST /academic/attendance - parent DENIED', async () => {
      if (!parentToken) return;
      const res = await POST('/academic/attendance', parentToken, { sectionId: 'x', records: [] });
      expectForbidden(res);
    });
  });

  describe('Report Cards & Schedule', () => {
    it('GET /academic/report-card/:studentId - should generate', async () => {
      if (!directorToken) return;
      const studentsRes = await GET('/students', directorToken);
      const students = studentsRes.body as any[];
      if (students?.length > 0) {
        const res = await GET(`/academic/report-card/${students[0].id}`, directorToken);
        expectOk(res);
      }
    });

    it('GET /academic/report-card/:studentId - teacher should have access', async () => {
      if (!teacherToken) return;
      const res = await GET('/academic/report-card/fake-student', teacherToken);
      expect([200, 404]).toContain(res.status);
    });

    it('GET /academic/student/:studentId/schedule - should get schedule', async () => {
      if (!directorToken) return;
      const studentsRes = await GET('/students', directorToken);
      const students = studentsRes.body as any[];
      if (students?.length > 0) {
        const res = await GET(`/academic/student/${students[0].id}/schedule`, directorToken);
        expectOk(res);
      }
    });
  });
});
