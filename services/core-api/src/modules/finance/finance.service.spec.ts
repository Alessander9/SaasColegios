import { FinanceService } from './finance.service';
import { db, ChargeStatus, PaymentStatus, PaymentMethod } from '@cole/database';

jest.mock('@cole/database', () => ({
  db: {
    feeConcept: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
       charge: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    payment: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    receipt: {
      create: jest.fn(),
    },
    creditNote: {
      create: jest.fn(),
    },
    cashBoxSession: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    cashBoxMovement: {
      create: jest.fn(),
    },
  },
  withTransactionAndOutbox: jest.fn(async (_db, _tenantId, _events, callback) => {
    return await callback(db);
  }),
  ChargeStatus: {
    PENDING: 'PENDING',
    PARTIALLY_PAID: 'PARTIALLY_PAID',
    PAID: 'PAID',
  },
  PaymentStatus: {
    COMPLETED: 'COMPLETED',
    REVERSED: 'REVERSED',
  },
  PaymentMethod: {
    CASH: 'CASH',
  },
}));

describe('FinanceService', () => {
  let service: FinanceService;

  beforeEach(() => {
    jest.clearAllMocks();
    (db.payment.findFirst as jest.Mock).mockReset();
    (db.payment.findUnique as jest.Mock).mockReset();
    service = new FinanceService();
  });

  it('should process payment idempotently when key is already registered', async () => {
    const existing = {
      id: 'pay-1',
      idempotencyKey: 'idemp-key-1',
      amount: 350,
      status: PaymentStatus.COMPLETED,
    };
    (db.payment.findFirst as jest.Mock).mockResolvedValue(existing);

    const result = await service.recordPayment('tenant-1', {
      chargeId: 'chg-1',
      idempotencyKey: 'idemp-key-1',
      amount: 350,
      method: PaymentMethod.CASH,
    });

    expect(result).toEqual(existing);
    expect(db.payment.create).not.toHaveBeenCalled();
  });

  it('should record payment, issue receipt, update charge status and emit event', async () => {
    (db.payment.findFirst as jest.Mock)
      .mockResolvedValueOnce(null) // first check
      .mockResolvedValueOnce({
        id: 'pay-new',
        idempotencyKey: 'idemp-key-new',
        amount: 350,
        status: PaymentStatus.COMPLETED,
      });

    (db.charge.findFirst as jest.Mock).mockResolvedValue({
      id: 'chg-1',
      tenantId: 'tenant-1',
      studentId: 'stud-1',
      totalAmount: 350,
      paidAmount: 0,
      status: ChargeStatus.PENDING,
      student: { firstName: 'Mateo', lastName: 'García', documentNumber: '72819203' },
    });

    (db.payment.create as jest.Mock).mockResolvedValue({
      id: 'pay-new',
    });
    (db.payment.findUnique as jest.Mock).mockResolvedValue({ id: 'pay-new' });

    const result = await service.recordPayment('tenant-1', {
      chargeId: 'chg-1',
      idempotencyKey: 'idemp-key-new',
      amount: 350,
      method: PaymentMethod.CASH,
    });

    expect(db.charge.update).toHaveBeenCalledWith({
      where: { id: 'chg-1' },
      data: {
        paidAmount: 350,
        status: ChargeStatus.PAID,
      },
    });
    expect(result.id).toBe('pay-new');
  });

  it('should inmutably reverse payment and issue credit note', async () => {
    (db.payment.findFirst as jest.Mock).mockResolvedValue({
      id: 'pay-1',
      tenantId: 'tenant-1',
      chargeId: 'chg-1',
      amount: 350,
      status: PaymentStatus.COMPLETED,
      charge: {
        id: 'chg-1',
        totalAmount: 350,
        paidAmount: 350,
      },
    });
    (db.payment.update as jest.Mock).mockResolvedValue({});

    (db.creditNote.create as jest.Mock).mockResolvedValue({
      id: 'cn-1',
      noteNumber: 'NC01-0001',
      amount: 350,
      reason: 'Error de cobro',
    });
    (db.charge.update as jest.Mock).mockResolvedValue({});
    (db.charge.findFirst as jest.Mock).mockResolvedValue({
      id: 'chg-1',
      totalAmount: 350,
      paidAmount: 350,
    });

    const creditNote = await service.reversePayment('tenant-1', 'pay-1', {
      noteNumber: 'NC01-0001',
      reason: 'Error de cobro',
    });

    expect(creditNote.noteNumber).toBe('NC01-0001');
    expect(db.payment.update).toHaveBeenCalledWith({
      where: { id: 'pay-1' },
      data: { status: PaymentStatus.REVERSED },
    });
  });
});
