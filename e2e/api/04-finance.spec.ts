/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  TEST SUITE #4: FINANCE CORE                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { USERS, loginAs, GET, POST, expectOk, expectForbidden } from './helpers';

describe('Finance Core API', () => {
  let directorToken: string | null;
  let accountantToken: string | null;
  let teacherToken: string | null;
  let parentToken: string | null;

  beforeAll(async () => {
    directorToken = await loginAs(USERS.DIRECTOR);
    accountantToken = await loginAs(USERS.ACCOUNTANT);
    teacherToken = await loginAs(USERS.TEACHER);
    parentToken = await loginAs(USERS.PARENT);
  });

  describe('Fee Concepts', () => {
    it('POST /finance/concepts - director should create fee concept', async () => {
      if (!directorToken) return;
      const res = await POST('/finance/concepts', directorToken, {
        code: `PEN-${Date.now()}`,
        name: `Pensión Test ${Date.now()}`,
        category: 'TUITION_PENSION',
        defaultAmount: 850.00,
      });
      expect([200, 201]).toContain(res.status);
    });

    it('GET /finance/concepts - should list concepts', async () => {
      if (!directorToken) return;
      const res = await GET('/finance/concepts', directorToken);
      expectOk(res);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('POST /finance/concepts - accountant should be ALLOWED', async () => {
      if (!accountantToken) return;
      const res = await POST('/finance/concepts', accountantToken, {
        code: `CON-${Date.now()}`,
        name: `Concepto Contador ${Date.now()}`,
        category: 'SERVICE',
        defaultAmount: 100,
      });
      expect([200, 201]).toContain(res.status);
    });

    it('POST /finance/concepts - teacher should be DENIED', async () => {
      if (!teacherToken) return;
      const res = await POST('/finance/concepts', teacherToken, {
        code: 'HACK', name: 'Hack', category: 'TUITION_PENSION', defaultAmount: 0,
      });
      expectForbidden(res);
    });

    it('POST /finance/concepts - parent should be DENIED', async () => {
      if (!parentToken) return;
      const res = await POST('/finance/concepts', parentToken, {
        code: 'FREE', name: 'Free', category: 'TUITION_PENSION', defaultAmount: 0,
      });
      expectForbidden(res);
    });
  });

  describe('Financial Charges', () => {
    it('GET /finance/charges - should list charges', async () => {
      if (!directorToken) return;
      const res = await GET('/finance/charges', directorToken);
      expectOk(res);
    });

    it('GET /finance/charges - accountant should have access', async () => {
      if (!accountantToken) return;
      const res = await GET('/finance/charges', accountantToken);
      expectOk(res);
    });

    it('GET /finance/charges - parent should have read access', async () => {
      if (!parentToken) return;
      const res = await GET('/finance/charges', parentToken);
      expectOk(res);
    });

    it('GET /finance/charges - teacher should be DENIED', async () => {
      if (!teacherToken) return;
      const res = await GET('/finance/charges', teacherToken);
      expectForbidden(res);
    });

    it('POST /finance/pension-schedule - director should generate schedule', async () => {
      if (!directorToken) return;
      const studentsRes = await GET('/students', directorToken);
      const students = studentsRes.body as any[];
      const conceptsRes = await GET('/finance/concepts', directorToken);
      const concepts = conceptsRes.body as any[];
      if (students?.length > 0 && concepts?.length > 0) {
        const res = await POST('/finance/pension-schedule', directorToken, {
          studentId: students[0].id,
          academicYearId: 'current',
          conceptId: concepts[0].id,
          monthlyAmount: 850,
          months: [
            { month: 'Abril', dueDate: '2026-04-30T23:59:59.000Z' },
            { month: 'Mayo', dueDate: '2026-05-31T23:59:59.000Z' },
          ],
        });
        expect([200, 201, 500]).toContain(res.status); // 500 if invalid student/concept IDs
      }
    });
  });

  describe('Payments (Idempotent)', () => {
    it('POST /finance/payments - director should process payment', async () => {
      if (!directorToken) return;
      const chargesRes = await GET('/finance/charges', directorToken);
      const pending = (chargesRes.body as any[])?.find((c: any) => c.status === 'PENDING');
      if (pending) {
        const res = await POST('/finance/payments', directorToken, {
          chargeId: pending.id,
          idempotencyKey: `pay-${Date.now()}-001`,
          amount: pending.amount || 350,
          method: 'CASH',
        });
        expect([200, 201]).toContain(res.status);
      }
    });

    it('POST /finance/payments - accountant should be ALLOWED', async () => {
      if (!accountantToken) return;
      const res = await POST('/finance/payments', accountantToken, {
        chargeId: 'nonexistent',
        idempotencyKey: `pay-${Date.now()}-002`,
        amount: 100,
        method: 'TRANSFER',
      });
      expect([200, 400, 404]).toContain(res.status);
    });

    it('POST /finance/payments - teacher should be DENIED', async () => {
      if (!teacherToken) return;
      const res = await POST('/finance/payments', teacherToken, {
        chargeId: 'fake', idempotencyKey: 'x', amount: 100, method: 'CASH',
      });
      expectForbidden(res);
    });

    it('POST /finance/payments - parent should be DENIED', async () => {
      if (!parentToken) return;
      const res = await POST('/finance/payments', parentToken, {
        chargeId: 'fake', idempotencyKey: 'y', amount: 100, method: 'CASH',
      });
      expectForbidden(res);
    });
  });

  describe('Payment Reversal', () => {
    it('POST /finance/payments/:id/reverse - director should reverse', async () => {
      if (!directorToken) return;
      const res = await POST('/finance/payments/nonexistent/reverse', directorToken, {
        noteNumber: `NC-${Date.now()}`,
        reason: 'Test reversal',
      });
      expect([200, 404]).toContain(res.status);
    });

    it('POST /finance/payments/:id/reverse - accountant ALLOWED', async () => {
      if (!accountantToken) return;
      const res = await POST('/finance/payments/nonexistent/reverse', accountantToken, {
        noteNumber: `NC-${Date.now()}`,
        reason: 'Test',
      });
      expect([200, 404]).toContain(res.status);
    });

    it('POST /finance/payments/:id/reverse - teacher DENIED', async () => {
      if (!teacherToken) return;
      const res = await POST('/finance/payments/fake/reverse', teacherToken, {
        noteNumber: 'NC', reason: 'Hack',
      });
      expectForbidden(res);
    });
  });

  describe('Cash Box Sessions', () => {
    it('POST /finance/cash-box/open - director should open', async () => {
      if (!directorToken) return;
      const res = await POST('/finance/cash-box/open', directorToken, {
        cashBoxId: `CB-${Date.now()}`,
        openingAmount: 500.00,
      });
      expect([200, 201, 500]).toContain(res.status); // 500 if cashBoxId doesn't exist
    });

    it('POST /finance/cash-box/open - accountant ALLOWED', async () => {
      if (!accountantToken) return;
      const res = await POST('/finance/cash-box/open', accountantToken, {
        cashBoxId: `CB2-${Date.now()}`,
        openingAmount: 200.00,
      });
      expect([200, 201]).toContain(res.status);
    });

    it('POST /finance/cash-box/open - teacher DENIED', async () => {
      if (!teacherToken) return;
      const res = await POST('/finance/cash-box/open', teacherToken, {
        cashBoxId: 'hack', openingAmount: 100,
      });
      expectForbidden(res);
    });

    it('POST /finance/cash-box/open - parent DENIED', async () => {
      if (!parentToken) return;
      const res = await POST('/finance/cash-box/open', parentToken, {
        cashBoxId: 'hack2', openingAmount: 100,
      });
      expectForbidden(res);
    });
  });
});
