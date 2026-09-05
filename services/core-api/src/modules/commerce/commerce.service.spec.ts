import { CommerceService } from './commerce.service';
import { db, OrderStatus } from '@cole/database';

jest.mock('@cole/database', () => ({
  db: {
    productCategory: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
    productVariant: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    inventoryMovement: {
      create: jest.fn(),
    },
    feeConcept: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    charge: {
      create: jest.fn(),
    },
    order: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
    orderItem: {
      create: jest.fn(),
    },
    payment: {
      create: jest.fn(),
    },
    receipt: {
      create: jest.fn(),
    },
  },
  withTransactionAndOutbox: jest.fn(async (_db, _tenantId, _events, callback) => {
    return await callback(db);
  }),
  OrderStatus: {
    PENDING: 'PENDING',
    PAID: 'PAID',
    DELIVERED: 'DELIVERED',
  },
  InventoryMovementType: {
    PURCHASE_IN: 'PURCHASE_IN',
    SALE_OUT: 'SALE_OUT',
    ADJUSTMENT: 'ADJUSTMENT',
  },
  ChargeStatus: {
    PAID: 'PAID',
  },
  PaymentStatus: {
    COMPLETED: 'COMPLETED',
  },
  PaymentMethod: {
    ONLINE_GATEWAY: 'ONLINE_GATEWAY',
  },
}));

describe('CommerceService', () => {
  let service: CommerceService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CommerceService();
  });

  it('should adjust inventory stock and record movement', async () => {
    (db.productVariant.findFirst as jest.Mock).mockResolvedValue({
      id: 'var-1',
      tenantId: 'tenant-1',
      sku: 'POLO-T12',
      stock: 20,
      product: { name: 'Polo EF' },
    });

    (db.inventoryMovement.create as jest.Mock).mockResolvedValue({
      id: 'mov-1',
      newStock: 35,
    });

    const result = await service.adjustInventory('tenant-1', {
      variantId: 'var-1',
      deltaQuantity: 15,
      reason: 'Llegada de pedido de proveedor',
    });

    expect(db.productVariant.update).toHaveBeenCalledWith({
      where: { id: 'var-1' },
      data: { stock: 35 },
    });
    expect(result.newStock).toBe(35);
  });

  it('should checkout order, deduct stock and connect to financial charge and payment', async () => {
    const mockVariant = {
      id: 'var-1',
      sku: 'POLO-T12',
      name: 'Talla 12',
      price: 45.0,
      stock: 10,
      product: { name: 'Polo EF' },
    };

    (db.productVariant.findMany as jest.Mock).mockResolvedValue([mockVariant]);
    (db.order.findUnique as jest.Mock).mockResolvedValueOnce(null).mockResolvedValueOnce({
      id: 'order-1', totalAmount: 90.0, status: OrderStatus.PAID,
    });
    (db.feeConcept.findFirst as jest.Mock).mockResolvedValue({ id: 'concept-comm-1' });

    (db.order.create as jest.Mock).mockResolvedValue({
      id: 'order-1',
      totalAmount: 90.0,
      status: OrderStatus.PAID,
    });

    const order = await service.checkoutOrder('tenant-1', 'user-parent-1', {
      items: [{ variantId: 'var-1', quantity: 2 }],
      idempotencyKey: 'idemp-order-1',
    });

    expect(db.charge.create).toHaveBeenCalled();
    expect(db.payment.create).toHaveBeenCalled();
    expect(db.productVariant.update).toHaveBeenCalledWith({
      where: { id: 'var-1' },
      data: { stock: 8 }, // 10 - 2
    });
    expect(order.id).toBe('order-1');
  });

  it('should replay an existing checkout without creating another payment or receipt', async () => {
    const existingOrder = { id: 'order-existing', code: 'ORD-2026-0001', status: OrderStatus.PAID };
    (db.order.findUnique as jest.Mock).mockResolvedValue(existingOrder);

    const result = await service.checkoutOrder('tenant-1', 'user-parent-1', {
      items: [{ variantId: 'var-1', quantity: 1 }],
      idempotencyKey: 'idemp-existing',
    });

    expect(result).toBe(existingOrder);
    expect(db.productVariant.findMany).not.toHaveBeenCalled();
    expect(db.payment.create).not.toHaveBeenCalled();
    expect(db.receipt.create).not.toHaveBeenCalled();
  });
});
