import { StudentService } from './student.service';
import { EntitlementService } from '../entitlement/entitlement.service';
import { db, StudentStatus } from '@cole/database';

jest.mock('@cole/database', () => ({
  db: {
    student: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
    guardian: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    studentGuardian: {
      upsert: jest.fn(),
    },
  },
  withTransactionAndOutbox: jest.fn(async (_db, _tenantId, _events, callback) => {
    return await callback(db);
  }),
  StudentStatus: {
    ACTIVE: 'ACTIVE',
    PRE_REGISTERED: 'PRE_REGISTERED',
  },
  RelationshipType: {
    FATHER: 'FATHER',
    MOTHER: 'MOTHER',
  },
}));

describe('StudentService', () => {
  let service: StudentService;
  let entitlementService: EntitlementService;

  beforeEach(() => {
    jest.clearAllMocks();
    entitlementService = new EntitlementService();
    service = new StudentService(entitlementService);
  });

  it('should create student when quota is available', async () => {
    jest.spyOn(entitlementService, 'checkUsage').mockResolvedValue({
      allowed: true,
      current: 40,
      limit: 100,
    });
    jest.spyOn(entitlementService, 'recordUsage').mockResolvedValue(41);

    (db.student.findFirst as jest.Mock).mockResolvedValue(null);
    (db.student.create as jest.Mock).mockResolvedValue({
      id: 'stud-1',
      tenantId: 'tenant-1',
      studentCode: 'ALU-2026-001',
      documentNumber: '72819203',
      firstName: 'Mateo',
      lastName: 'García',
      status: StudentStatus.ACTIVE,
    });

    const student = await service.createStudent('tenant-1', {
      studentCode: 'ALU-2026-001',
      documentNumber: '72819203',
      firstName: 'Mateo',
      lastName: 'García',
    });

    expect(student.studentCode).toBe('ALU-2026-001');
    expect(entitlementService.recordUsage).toHaveBeenCalledWith('tenant-1', 'students', 1);
  });

  it('should block student creation when quota is exceeded', async () => {
    jest.spyOn(entitlementService, 'checkUsage').mockResolvedValue({
      allowed: false,
      reason: 'LIMIT_REACHED',
      current: 100,
      limit: 100,
    });

    await expect(
      service.createStudent('tenant-1', {
        studentCode: 'ALU-2026-101',
        documentNumber: '72819204',
        firstName: 'Lucas',
        lastName: 'Pérez',
      })
    ).rejects.toThrow('Student enrollment limit reached for your plan');
  });
});
