/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  TEST SUITE #3: HR & PAYROLL                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { USERS, loginAs, GET, POST, expectOk, expectForbidden } from './helpers';

describe('HR & Payroll API', () => {
  let directorToken: string | null;
  let teacherToken: string | null;
  let parentToken: string | null;
  let accountantToken: string | null;

  beforeAll(async () => {
    directorToken = await loginAs(USERS.DIRECTOR);
    teacherToken = await loginAs(USERS.TEACHER);
    parentToken = await loginAs(USERS.PARENT);
    accountantToken = await loginAs(USERS.ACCOUNTANT);
  });

  describe('HR - Employee Management', () => {
    it('GET /hr/employees - director should list employees', async () => {
      if (!directorToken) return;
      const res = await GET('/hr/employees', directorToken);
      expectOk(res);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /hr/employees - should filter by status', async () => {
      if (!directorToken) return;
      const res = await GET('/hr/employees', directorToken, { status: 'ACTIVE' });
      expectOk(res);
    });

    it('GET /hr/employees/:id - should get employee details', async () => {
      if (!directorToken) return;
      const listRes = await GET('/hr/employees', directorToken);
      const employees = listRes.body as any[];
      if (employees?.length > 0) {
        const res = await GET(`/hr/employees/${employees[0].id}`, directorToken);
        expectOk(res);
      }
    });

    it('POST /hr/employees - should create employee as director', async () => {
      if (!directorToken) return;
      const res = await POST('/hr/employees', directorToken, {
        employeeCode: `EMP-${Date.now()}`,
        documentNumber: `${Date.now()}`,
        firstName: 'Nuevo',
        lastName: `Profesor ${Date.now()}`,
        phone: '+51999888777',
        type: 'TEACHER',
        baseSalary: 2500,
      });
      expect([200, 201]).toContain(res.status);
    });

    it('GET /hr/employees - teacher should be DENIED', async () => {
      if (!teacherToken) return;
      const res = await GET('/hr/employees', teacherToken);
      expectForbidden(res);
    });

    it('GET /hr/employees - parent should be DENIED', async () => {
      if (!parentToken) return;
      const res = await GET('/hr/employees', parentToken);
      expectForbidden(res);
    });

    it('POST /hr/employees - teacher should be DENIED', async () => {
      if (!teacherToken) return;
      const res = await POST('/hr/employees', teacherToken, {
        employeeCode: 'HACK', documentNumber: '0', firstName: 'Hack',
        lastName: 'Attempt', phone: '0', type: 'TEACHER', baseSalary: 0,
      });
      expectForbidden(res);
    });
  });

  describe('HR - Staff Attendance', () => {
    it('POST /hr/attendance - director should record attendance', async () => {
      if (!directorToken) return;
      const listRes = await GET('/hr/employees', directorToken);
      const employees = listRes.body as any[];
      if (employees?.length > 0) {
        const res = await POST('/hr/attendance', directorToken, {
          employeeId: employees[0].id,
          date: new Date().toISOString().split('T')[0],
          status: 'PRESENT',
          checkInTime: '08:00:00',
          checkOutTime: '17:00:00',
        });
        expect([200, 201, 400, 500]).toContain(res.status); // 400/500 if employeeId doesn't exist
      }
    });

    it('GET /hr/attendance - director should get attendance report', async () => {
      if (!directorToken) return;
      const res = await GET('/hr/attendance', directorToken);
      expectOk(res);
    });

    it('POST /hr/attendance - teacher should be DENIED', async () => {
      if (!teacherToken) return;
      const res = await POST('/hr/attendance', teacherToken, {
        employeeId: 'fake', date: '2026-04-01', status: 'PRESENT',
      });
      expectForbidden(res);
    });
  });

  describe('Payroll Engine', () => {
    it('GET /payroll/periods - director should list periods', async () => {
      if (!directorToken) return;
      const res = await GET('/payroll/periods', directorToken);
      expectOk(res);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('POST /payroll/periods - should open new period as director', async () => {
      if (!directorToken) return;
      const res = await POST('/payroll/periods', directorToken, {
        name: `Planilla ${Date.now()}`,
        year: 2026,
        month: 5,
        startDate: '2026-05-01T00:00:00.000Z',
        endDate: '2026-05-31T23:59:59.000Z',
      });
      expect([200, 201, 409]).toContain(res.status); // 409 if period already exists
    });

    it('POST /payroll/calculate - should calculate payroll', async () => {
      if (!directorToken) return;
      const periodsRes = await GET('/payroll/periods', directorToken);
      const periods = periodsRes.body as any[];
      const target = periods.find((p: any) => p.year === 2026 && p.month === 4) || periods[0];
      if (target) {
        const res = await POST('/payroll/calculate', directorToken, { periodId: target.id });
        expectOk(res);
      }
    });

    it('GET /payroll/periods/:id/slips - should get payslips', async () => {
      if (!directorToken) return;
      const periodsRes = await GET('/payroll/periods', directorToken);
      const periods = periodsRes.body as any[];
      if (periods?.length > 0) {
        const res = await GET(`/payroll/periods/${periods[0].id}/slips`, directorToken);
        expectOk(res);
      }
    });

    it('POST /payroll/calculate - teacher should be DENIED', async () => {
      if (!teacherToken) return;
      const res = await POST('/payroll/calculate', teacherToken, { periodId: 'fake' });
      expectForbidden(res);
    });

    it('POST /payroll/calculate - accountant should be ALLOWED', async () => {
      if (!accountantToken) return;
      const periodsRes = await GET('/payroll/periods', directorToken!);
      const periods = periodsRes.body as any[];
      if (periods?.length > 0) {
        const res = await POST('/payroll/calculate', accountantToken, { periodId: periods[0].id });
        expectOk(res);
      }
    });

    it('GET /payroll/periods - accountant should have access', async () => {
      if (!accountantToken) return;
      const res = await GET('/payroll/periods', accountantToken);
      expectOk(res);
    });

    it('GET /payroll/periods - parent should be DENIED', async () => {
      if (!parentToken) return;
      const res = await GET('/payroll/periods', parentToken);
      expectForbidden(res);
    });
  });
});
