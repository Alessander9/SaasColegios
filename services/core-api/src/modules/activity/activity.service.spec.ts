import { ActivityService } from './activity.service';
import { db, ActivityRegistrationStatus } from '@cole/database';

jest.mock('@cole/database', () => ({
  db: {
    activity: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
    student: {
      findFirst: jest.fn(),
    },
    guardian: {
      findFirst: jest.fn(),
    },
    feeConcept: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    charge: {
      create: jest.fn(),
    },
    payment: {
      create: jest.fn(),
    },
    receipt: {
      create: jest.fn(),
    },
    activityRegistration: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    parentConsent: {
      create: jest.fn(),
    },
    activityAttendance: {
      upsert: jest.fn(),
    },
  },
  withTransactionAndOutbox: jest.fn(async (_db, _tenantId, _events, callback) => {
    return await callback(db);
  }),
  ActivityType: {
    WORKSHOP: 'WORKSHOP',
    TRIP: 'TRIP',
  },
  ActivityStatus: {
    OPEN_REGISTRATION: 'OPEN_REGISTRATION',
  },
  ActivityRegistrationStatus: {
    CONFIRMED: 'CONFIRMED',
    CANCELLED: 'CANCELLED',
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

describe('ActivityService', () => {
  let service: ActivityService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ActivityService();
  });

  it('should register student to activity with parental digital consent', async () => {
    (db.activity.findFirst as jest.Mock).mockResolvedValue({
      id: 'act-1',
      tenantId: 'tenant-1',
      title: 'Taller de Robótica',
      price: 80.0,
      maxCapacity: 25,
      requiresConsent: true,
      _count: { registrations: 10 },
    });

    (db.student.findFirst as jest.Mock).mockResolvedValue({
      id: 'stud-1',
      tenantId: 'tenant-1',
      firstName: 'Mateo',
      lastName: 'García',
    });

    (db.guardian.findFirst as jest.Mock).mockResolvedValue({
      id: 'guard-1',
      tenantId: 'tenant-1',
      firstName: 'Roberto',
      lastName: 'García',
      documentNumber: '10928374',
    });

    (db.feeConcept.findFirst as jest.Mock).mockResolvedValue({ id: 'concept-act-1' });

    (db.activityRegistration.create as jest.Mock).mockResolvedValue({
      id: 'reg-1',
      code: 'REG-ACT-2026-0001',
      status: ActivityRegistrationStatus.CONFIRMED,
    });

    (db.activityRegistration.findUnique as jest.Mock).mockResolvedValue({
      id: 'reg-1',
      code: 'REG-ACT-2026-0001',
      status: ActivityRegistrationStatus.CONFIRMED,
    });

    const result = await service.registerToActivity('tenant-1', {
      activityId: 'act-1',
      studentId: 'stud-1',
      guardianId: 'guard-1',
      isAuthorized: true,
      idempotencyKey: 'idemp-act-1',
    });

    expect(db.charge.create).toHaveBeenCalled();
    expect(db.parentConsent.create).toHaveBeenCalled();
    expect(result.id).toBe('reg-1');
  });

  it('should reject registration if parent did not authorize', async () => {
    (db.activity.findFirst as jest.Mock).mockResolvedValue({
      id: 'act-1',
      title: 'Paseo a Granja Villa',
      maxCapacity: 30,
      requiresConsent: true,
      _count: { registrations: 5 },
    });

    (db.student.findFirst as jest.Mock).mockResolvedValue({ id: 'stud-1' });
    (db.guardian.findFirst as jest.Mock).mockResolvedValue({ id: 'guard-1' });

    await expect(
      service.registerToActivity('tenant-1', {
        activityId: 'act-1',
        studentId: 'stud-1',
        guardianId: 'guard-1',
        isAuthorized: false,
      })
    ).rejects.toThrow('Parental authorization consent is required');
  });
});
