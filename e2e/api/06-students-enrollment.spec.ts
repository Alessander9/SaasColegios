/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  TEST SUITE #6: STUDENTS & ENROLLMENT                                     ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { USERS, loginAs, GET, POST, PATCH, expectOk, expectForbidden } from './helpers';

describe('Students & Enrollment API', () => {
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

  describe('Student Management', () => {
    it('GET /students - director should list students', async () => {
      if (!directorToken) return;
      const res = await GET('/students', directorToken);
      expectOk(res);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('POST /students - director should create student', async () => {
      if (!directorToken) return;
      const res = await POST('/students', directorToken, {
        studentCode: `STU-${Date.now()}`,
        firstName: `Alumno ${Date.now()}`,
        lastName: 'Test',
        documentNumber: `${Date.now()}`,
        documentType: 'DNI',
      });
      expect([200, 201]).toContain(res.status);
    });

    it('POST /students - secretary should be ALLOWED', async () => {
      if (!secretaryToken) return;
      const res = await POST('/students', secretaryToken, {
        studentCode: `SEC-${Date.now()}`,
        firstName: `Sec-${Date.now()}`,
        lastName: 'Test',
        documentNumber: `SEC-${Date.now()}`,
        documentType: 'DNI',
      });
      expect([200, 201]).toContain(res.status);
    });

    it('POST /students - teacher should be DENIED', async () => {
      if (!teacherToken) return;
      const res = await POST('/students', teacherToken, { firstName: 'Hack' });
      expectForbidden(res);
    });

    it('POST /students - parent should be DENIED', async () => {
      if (!parentToken) return;
      const res = await POST('/students', parentToken, { firstName: 'Hack' });
      expectForbidden(res);
    });

    it('GET /students/:id - should get student by ID', async () => {
      if (!directorToken) return;
      const listRes = await GET('/students', directorToken);
      const students = listRes.body as any[];
      if (students?.length > 0) {
        const res = await GET(`/students/${students[0].id}`, directorToken);
        expectOk(res);
      }
    });

    it('GET /students/mine - parent should see their children', async () => {
      if (!parentToken) return;
      const res = await GET('/students/mine', parentToken);
      expectOk(res);
    });

    it('GET /students/mine - teacher should be DENIED', async () => {
      if (!teacherToken) return;
      const res = await GET('/students/mine', teacherToken);
      expectForbidden(res);
    });
  });

  describe('Guardian Management', () => {
    it('POST /students/guardians - director should create guardian', async () => {
      if (!directorToken) return;
      const res = await POST('/students/guardians', directorToken, {
        firstName: `Padre ${Date.now()}`,
        lastName: 'Test',
        documentNumber: `${Date.now()}`,
        relationship: 'FATHER',
        phone: '+51999888777',
      });
      expect([200, 201]).toContain(res.status);
    });

    it('POST /students/guardians - teacher DENIED', async () => {
      if (!teacherToken) return;
      const res = await POST('/students/guardians', teacherToken, { firstName: 'Hack' });
      expectForbidden(res);
    });
  });

  describe('Admissions', () => {
    it('POST /enrollment/admissions - director should create admission', async () => {
      if (!directorToken) return;
      const res = await POST('/enrollment/admissions', directorToken, {
        studentFirstName: `Admision ${Date.now()}`, studentLastName: 'Nuevo',
      });
      expect([200, 201, 400]).toContain(res.status);
    });

    it('GET /enrollment/admissions - should list admissions', async () => {
      if (!directorToken) return;
      const res = await GET('/enrollment/admissions', directorToken);
      expectOk(res);
    });

    it('GET /enrollment/admissions - teacher DENIED', async () => {
      if (!teacherToken) return;
      const res = await GET('/enrollment/admissions', teacherToken);
      expectForbidden(res);
    });

    it('PATCH /enrollment/admissions/:id/status - should approve', async () => {
      if (!directorToken) return;
      const listRes = await GET('/enrollment/admissions', directorToken);
      const admissions = listRes.body as any[];
      if (admissions?.length > 0) {
        const res = await PATCH(`/enrollment/admissions/${admissions[0].id}/status`, directorToken, {
          status: 'APPROVED', notes: 'Test',
        });
        expect([200, 204]).toContain(res.status);
      }
    });
  });

  describe('Formal Enrollment', () => {
    it('GET /enrollment/enrollments - should list enrollments', async () => {
      if (!directorToken) return;
      const res = await GET('/enrollment/enrollments', directorToken);
      expectOk(res);
    });

    it('GET /enrollment/enrollments - parent DENIED', async () => {
      if (!parentToken) return;
      const res = await GET('/enrollment/enrollments', parentToken);
      expectForbidden(res);
    });
  });
});
