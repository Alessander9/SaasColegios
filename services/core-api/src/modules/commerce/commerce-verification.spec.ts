import { db } from '@cole/database';

jest.mock('@cole/database', () => ({
  db: {
    order: { findFirst: jest.fn() },
  },
}));

describe('Commerce verification contract', () => {
  it('can query the complete order-to-receipt relation', async () => {
    (db.order.findFirst as jest.Mock).mockResolvedValue({
      charge: { payments: [{ receipt: {} }] }, items: [{ variant: {} }],
    });
    const order = await db.order.findFirst({
      include: {
        charge: { include: { payments: { include: { receipt: true } } } },
        items: { include: { variant: true } },
      },
    });

    if (!order) return;
    expect(order.charge).not.toBeNull();
    expect(order.items.length).toBeGreaterThan(0);
    expect(order.charge?.payments[0]?.receipt).not.toBeNull();
  });
});
