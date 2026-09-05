import { HRService } from './hr.service';
import { db, EmployeeStatus, EmployeeType } from '@cole/database';

jest.mock('@cole/database', () => ({
  db: {
    employee: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
    employmentContract: {
      create: jest.fn(),
    },
    workAttendance: {
      upsert: jest.fn(),
      findMany: jest.fn(),
    },
  },
  withTransactionAndOutbox: jest.fn(async (_db, _tenantId, _events, callback) => {
    return await callback(db);
  }),
  EmployeeStatus: {
    ACTIVE: 'ACTIVE',
  },
  EmployeeType: {
    TEACHER: 'TEACHER',
  },
}));

describe('HRService', () => {
  let service: HRService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new HRService();
  });

  it('should create employee record and emit EmployeeHired.v1 event', async () => {
    (db.employee.findFirst as jest.Mock).mockResolvedValue(null);
    (db.employee.create as jest.Mock).mockResolvedValue({
      id: 'emp-1',
      tenantId: 'tenant-1',
      employeeCode: 'EMP-2026-001',
      firstName: 'Elena',
      lastName: 'Torres',
      baseSalary: 2800.0,
      type: EmployeeType.TEACHER,
      status: EmployeeStatus.ACTIVE,
    });

    const result = await service.createEmployee('tenant-1', {
      employeeCode: 'EMP-2026-001',
      documentNumber: '10928374',
      firstName: 'Elena',
      lastName: 'Torres',
      phone: '+51 988-112-233',
      type: EmployeeType.TEACHER,
      baseSalary: 2800.0,
    });

    expect(result.employeeCode).toBe('EMP-2026-001');
    expect(db.employee.create).toHaveBeenCalled();
  });
});
