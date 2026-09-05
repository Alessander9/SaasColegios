import { SchoolCoreService } from './school-core.service';
import { db } from '@cole/database';

jest.mock('@cole/database', () => ({
  db: {
    schoolProfile: {
      findUnique: jest.fn(),
      create: jest.fn(),
      upsert: jest.fn(),
    },
    tenant: {
      findUnique: jest.fn(),
    },
    campus: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
    academicYear: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
    educationalLevel: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
    section: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

describe('SchoolCoreService', () => {
  let service: SchoolCoreService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SchoolCoreService();
  });

  it('should get or initialize school profile', async () => {
    (db.schoolProfile.findUnique as jest.Mock).mockResolvedValue({
      id: 'prof-1',
      tenantId: 'tenant-1',
      legalName: 'Colegio San José S.A.C.',
      currency: 'USD',
      timezone: 'America/Lima',
    });

    const profile = await service.getProfile('tenant-1');
    expect(profile.legalName).toBe('Colegio San José S.A.C.');
    expect(db.schoolProfile.findUnique).toHaveBeenCalledWith({
      where: { tenantId: 'tenant-1' },
      include: { tenant: true },
    });
  });

  it('should create campus ensuring code uniqueness per tenant', async () => {
    (db.campus.findUnique as jest.Mock).mockResolvedValue(null);
    (db.campus.create as jest.Mock).mockResolvedValue({
      id: 'camp-1',
      tenantId: 'tenant-1',
      name: 'Sede Principal',
      code: 'SEDE-01',
      isMain: true,
    });

    const campus = await service.createCampus('tenant-1', {
      name: 'Sede Principal',
      code: 'SEDE-01',
      isMain: true,
    });

    expect(campus.code).toBe('SEDE-01');
    expect(db.campus.create).toHaveBeenCalled();
  });

  it('should throw ConflictException on duplicate academic year', async () => {
    (db.academicYear.findUnique as jest.Mock).mockResolvedValue({
      id: 'ay-2026',
      year: 2026,
    });

    await expect(
      service.createAcademicYear('tenant-1', {
        year: 2026,
        name: 'Año 2026',
        startDate: '2026-03-01T00:00:00.000Z',
        endDate: '2026-12-20T23:59:59.000Z',
      })
    ).rejects.toThrow('Academic year 2026 already exists in this school');
  });
});
