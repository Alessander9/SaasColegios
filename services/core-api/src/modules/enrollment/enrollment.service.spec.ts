import { EnrollmentService } from './enrollment.service';
import { db, EnrollmentStatus } from '@cole/database';

jest.mock('@cole/database', () => ({
  db: {
    student: {
      findFirst: jest.fn(),
    },
    section: {
      findFirst: jest.fn(),
    },
    enrollment: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
    admissionApplication: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
  withTransactionAndOutbox: jest.fn(async (_db, _tenantId, _events, callback) => {
    return await callback(db);
  }),
  EnrollmentStatus: {
    CONFIRMED: 'CONFIRMED',
    CANCELLED: 'CANCELLED',
    PENDING_PAYMENT: 'PENDING_PAYMENT',
  },
  AdmissionStatus: {
    SUBMITTED: 'SUBMITTED',
    APPROVED: 'APPROVED',
  },
}));

describe('EnrollmentService', () => {
  let service: EnrollmentService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EnrollmentService();
  });

  it('should enroll student into matching section when vacancies are available', async () => {
    (db.student.findFirst as jest.Mock).mockResolvedValue({
      id: 'stud-1',
      tenantId: 'tenant-1',
      firstName: 'Mateo',
    });

    (db.enrollment.findUnique as jest.Mock).mockResolvedValue(null);

    (db.section.findFirst as jest.Mock).mockResolvedValue({
      id: 'sec-1',
      tenantId: 'tenant-1',
      name: 'A',
      maxCapacity: 30,
      _count: { enrollments: 25 },
    });

    (db.enrollment.create as jest.Mock).mockResolvedValue({
      id: 'enr-1',
      code: 'MAT-2026-1001',
      studentId: 'stud-1',
      status: EnrollmentStatus.CONFIRMED,
    });

    const result = await service.enrollStudent('tenant-1', {
      studentId: 'stud-1',
      academicYearId: 'ay-2026',
      gradeId: 'grade-1',
      sectionId: 'sec-1',
    });

    expect(result.id).toBe('enr-1');
    expect(db.enrollment.create).toHaveBeenCalled();
  });

  it('should reject enrollment if section capacity is exceeded', async () => {
    (db.student.findFirst as jest.Mock).mockResolvedValue({
      id: 'stud-1',
      tenantId: 'tenant-1',
    });
    (db.enrollment.findUnique as jest.Mock).mockResolvedValue(null);

    (db.section.findFirst as jest.Mock).mockResolvedValue({
      id: 'sec-full',
      name: 'A',
      maxCapacity: 30,
      _count: { enrollments: 30 },
    });

    await expect(
      service.enrollStudent('tenant-1', {
        studentId: 'stud-1',
        academicYearId: 'ay-2026',
        gradeId: 'grade-1',
        sectionId: 'sec-full',
      })
    ).rejects.toThrow("Section 'A' has reached its maximum capacity (30 students)");
  });
});
