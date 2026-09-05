/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  TEST SUITE #7: COMMERCE & SCHOOL STORE                                   ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { USERS, loginAs, GET, POST, PATCH, expectOk, expectForbidden } from './helpers';

describe('Commerce & School Store API', () => {
  let directorToken: string | null;
  let teacherToken: string | null;
  let parentToken: string | null;

  beforeAll(async () => {
    directorToken = await loginAs(USERS.DIRECTOR);
    teacherToken = await loginAs(USERS.TEACHER);
    parentToken = await loginAs(USERS.PARENT);
  });

  describe('Product Categories', () => {
    it('POST /commerce/categories - director should create', async () => {
      if (!directorToken) return;
      const res = await POST('/commerce/categories', directorToken, { name: `Cat ${Date.now()}`, code: `CAT-${Date.now()}` });
      expect([200, 201]).toContain(res.status);
    });

    it('GET /commerce/categories - should list', async () => {
      if (!directorToken) return;
      const res = await GET('/commerce/categories', directorToken);
      expectOk(res);
    });

    it('GET /commerce/categories - parent should have read access', async () => {
      if (!parentToken) return;
      const res = await GET('/commerce/categories', parentToken);
      expectOk(res);
    });

    it('POST /commerce/categories - teacher DENIED', async () => {
      if (!teacherToken) return;
      const res = await POST('/commerce/categories', teacherToken, { name: 'Hack' });
      expectForbidden(res);
    });
  });

  describe('Products', () => {
    it('GET /commerce/products - should list', async () => {
      if (!directorToken) return;
      const res = await GET('/commerce/products', directorToken);
      expectOk(res);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /commerce/products - parent should have read access', async () => {
      if (!parentToken) return;
      const res = await GET('/commerce/products', parentToken);
      expectOk(res);
    });

    it('POST /commerce/products - parent DENIED', async () => {
      if (!parentToken) return;
      const res = await POST('/commerce/products', parentToken, { name: 'Hack' });
      expectForbidden(res);
    });

    it('POST /commerce/products - teacher DENIED', async () => {
      if (!teacherToken) return;
      const res = await POST('/commerce/products', teacherToken, { name: 'Hack' });
      expectForbidden(res);
    });
  });

  describe('Inventory', () => {
    it('POST /commerce/inventory/adjust - director should adjust', async () => {
      if (!directorToken) return;
      const res = await POST('/commerce/inventory/adjust', directorToken, {
        variantId: 'some-variant', quantity: 10, reason: 'RESTOCK',
      });
      expect([200, 201, 400]).toContain(res.status);
    });

    it('POST /commerce/inventory/adjust - parent DENIED', async () => {
      if (!parentToken) return;
      const res = await POST('/commerce/inventory/adjust', parentToken, { variantId: 'x', quantity: 999 });
      expectForbidden(res);
    });
  });

  describe('Orders', () => {
    it('GET /commerce/orders - should list', async () => {
      if (!directorToken) return;
      const res = await GET('/commerce/orders', directorToken);
      expectOk(res);
    });

    it('GET /commerce/orders - parent should have read access', async () => {
      if (!parentToken) return;
      const res = await GET('/commerce/orders', parentToken);
      expectOk(res);
    });

    it('PATCH /commerce/orders/:id/status - director should update', async () => {
      if (!directorToken) return;
      const listRes = await GET('/commerce/orders', directorToken);
      const orders = listRes.body as any[];
      if (orders?.length > 0) {
        const res = await PATCH(`/commerce/orders/${orders[0].id}/status`, directorToken, { status: 'PREPARING' });
        expect([200, 204]).toContain(res.status);
      }
    });

    it('PATCH /commerce/orders/:id/status - parent DENIED', async () => {
      if (!parentToken) return;
      const res = await PATCH('/commerce/orders/fake/status', parentToken, { status: 'DELIVERED' });
      expectForbidden(res);
    });

    it('PATCH /commerce/orders/:id/status - teacher DENIED', async () => {
      if (!teacherToken) return;
      const res = await PATCH('/commerce/orders/fake/status', teacherToken, { status: 'DELIVERED' });
      expectForbidden(res);
    });
  });
});
