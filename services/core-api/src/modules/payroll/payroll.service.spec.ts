import { PayrollService } from './payroll.service';
import { db, PayrollPeriodStatus, EmployeeStatus } from '@cole/database';

jest.mock('@cole/database', () => ({
  db: {
    payrollPeriod: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    employee: {
      findMany: jest.fn(),
    },
    payrollSlip: {
      deleteMany: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
    payrollItem: {
      createMany: jest.fn(),
    },
  },
  withTransactionAndOutbox: jest.fn(async (_db, _tenantId, _events, callback) => {
    return await callback(db);
  }),
  PayrollPeriodStatus: {
    OPEN: 'OPEN',
    APPROVED: 'APPROVED',
    CLOSED: 'CLOSED',
  },
  PayslipStatus: {
    DRAFT: 'DRAFT',
    APPROVED: 'APPROVED',
  },
  EmployeeStatus: {
    ACTIVE: 'ACTIVE',
  },
}));

describe('PayrollService', () => {
  let service: PayrollService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PayrollService();
  });

  it('should calculate monthly payroll slips with earnings and deductions', async () => {
    (db.payrollPeriod.findFirst as jest.Mock).mockResolvedValue({
      id: 'period-1',
      tenantId: 'tenant-1',
      status: PayrollPeriodStatus.OPEN,
    });

    (db.employee.findMany as jest.Mock).mockResolvedValue([
      {
        id: 'emp-1',
        baseSalary: 2800.0,
        pensionSystem: 'AFP_INTEGRA',
        status: EmployeeStatus.ACTIVE,
      },
    ]);

    (db.payrollSlip.create as jest.Mock).mockResolvedValue({
      id: 'slip-1',
      grossEarnings: 2902.5,
      totalDeductions: 358.4,
      netPay: 2544.1,
    });

    const result = await service.calculatePayroll('tenant-1', {
      periodId: 'period-1',
    });

    expect(result.status).toBe('APPROVED');
    expect(result.employeesProcessed).toBe(1);
    expect(db.payrollSlip.create).toHaveBeenCalled();
    expect(db.payrollItem.createMany).toHaveBeenCalled();
  });
});
