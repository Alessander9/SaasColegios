import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { db } from '@cole/database';
import {
  UpdateSchoolProfileDto,
  CreateCampusDto,
  CreateAcademicYearDto,
  CreateAcademicPeriodDto,
  CreateEducationalLevelDto,
  CreateGradeLevelDto,
  CreateSectionDto,
  CreateClassroomDto,
} from './dto/school-core.dto';

@Injectable()
export class SchoolCoreService {
  // --------------------------------------------------
  // INSTITUTIONAL PROFILE
  // --------------------------------------------------

  async getProfile(tenantId: string): Promise<any> {
    const profile = await db.schoolProfile.findUnique({
      where: { tenantId },
      include: { tenant: true },
    });

    if (!profile) {
      // Auto-initialize if not exists for the tenant
      const tenant = await db.tenant.findUnique({ where: { id: tenantId } });
      if (!tenant) throw new NotFoundException('Tenant not found');

      return await db.schoolProfile.create({
        data: {
          tenantId,
          legalName: tenant.name,
          currency: 'USD',
          timezone: 'America/Lima',
        },
        include: { tenant: true },
      });
    }

    return profile;
  }

  async updateProfile(tenantId: string, dto: UpdateSchoolProfileDto): Promise<any> {
    return await db.schoolProfile.upsert({
      where: { tenantId },
      update: {
        legalName: dto.legalName,
        taxId: dto.taxId,
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
        logoUrl: dto.logoUrl,
        currency: dto.currency || 'USD',
        timezone: dto.timezone || 'America/Lima',
        gradingScale: dto.gradingScale || 'NUMERIC_0_20',
      },
      create: {
        tenantId,
        legalName: dto.legalName,
        taxId: dto.taxId,
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
        logoUrl: dto.logoUrl,
        currency: dto.currency || 'USD',
        timezone: dto.timezone || 'America/Lima',
        gradingScale: dto.gradingScale || 'NUMERIC_0_20',
      },
      include: { tenant: true },
    });
  }

  // --------------------------------------------------
  // CAMPUSES & CAMPUS MANAGEMENT
  // --------------------------------------------------

  async createCampus(tenantId: string, dto: CreateCampusDto): Promise<any> {
    const existing = await db.campus.findUnique({
      where: { tenantId_code: { tenantId, code: dto.code } },
    });
    if (existing) {
      throw new ConflictException(`Campus with code ${dto.code} already exists in this school`);
    }

    return await db.campus.create({
      data: {
        tenantId,
        name: dto.name,
        code: dto.code,
        address: dto.address,
        phone: dto.phone,
        isMain: dto.isMain ?? false,
      },
    });
  }

  async getCampuses(tenantId: string): Promise<any[]> {
    return await db.campus.findMany({
      where: { tenantId, isActive: true },
      include: { classrooms: true },
      orderBy: { isMain: 'desc' },
    });
  }

  // --------------------------------------------------
  // ACADEMIC YEARS & PERIODS
  // --------------------------------------------------

  async createAcademicYear(tenantId: string, dto: CreateAcademicYearDto): Promise<any> {
    const existing = await db.academicYear.findUnique({
      where: { tenantId_year: { tenantId, year: dto.year } },
    });
    if (existing) {
      throw new ConflictException(`Academic year ${dto.year} already exists in this school`);
    }

    return await db.academicYear.create({
      data: {
        tenantId,
        year: dto.year,
        name: dto.name,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        isActive: dto.isActive ?? true,
      },
    });
  }

  async getAcademicYears(tenantId: string): Promise<any[]> {
    return await db.academicYear.findMany({
      where: { tenantId },
      include: { periods: { orderBy: { order: 'asc' } } },
      orderBy: { year: 'desc' },
    });
  }

  async createAcademicPeriod(tenantId: string, dto: CreateAcademicPeriodDto): Promise<any> {
    return await db.academicPeriod.create({
      data: {
        tenantId,
        academicYearId: dto.academicYearId,
        name: dto.name,
        code: dto.code,
        order: dto.order,
        type: dto.type,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
      },
    });
  }

  // --------------------------------------------------
  // EDUCATIONAL LEVELS & GRADES
  // --------------------------------------------------

  async createEducationalLevel(tenantId: string, dto: CreateEducationalLevelDto): Promise<any> {
    const existing = await db.educationalLevel.findUnique({
      where: { tenantId_code: { tenantId, code: dto.code } },
    });
    if (existing) {
      throw new ConflictException(`Level with code ${dto.code} already exists`);
    }

    return await db.educationalLevel.create({
      data: {
        tenantId,
        name: dto.name,
        code: dto.code,
        order: dto.order,
      },
    });
  }

  async getEducationalLevels(tenantId: string): Promise<any[]> {
    return await db.educationalLevel.findMany({
      where: { tenantId, isActive: true },
      include: {
        grades: {
          orderBy: { order: 'asc' },
          include: { sections: true },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  async createGradeLevel(tenantId: string, dto: CreateGradeLevelDto): Promise<any> {
    const existing = await db.gradeLevel.findUnique({
      where: { tenantId_code: { tenantId, code: dto.code } },
    });
    if (existing) {
      throw new ConflictException(`Grade with code ${dto.code} already exists`);
    }

    return await db.gradeLevel.create({
      data: {
        tenantId,
        levelId: dto.levelId,
        name: dto.name,
        code: dto.code,
        order: dto.order,
      },
    });
  }

  // --------------------------------------------------
  // SECTIONS & CLASSROOMS
  // --------------------------------------------------

  async createSection(tenantId: string, dto: CreateSectionDto): Promise<any> {
    return await db.section.create({
      data: {
        tenantId,
        academicYearId: dto.academicYearId,
        gradeId: dto.gradeId,
        campusId: dto.campusId,
        classroomId: dto.classroomId,
        name: dto.name,
        code: dto.code,
        maxCapacity: dto.maxCapacity || 30,
      },
      include: {
        grade: { include: { level: true } },
        academicYear: true,
        campus: true,
      },
    });
  }

  async getSections(tenantId: string, academicYearId?: string): Promise<any[]> {
    return await db.section.findMany({
      where: {
        tenantId,
        ...(academicYearId ? { academicYearId } : {}),
        isActive: true,
      },
      include: {
        grade: { include: { level: true } },
        academicYear: true,
        campus: true,
        classroom: true,
      },
      orderBy: [{ grade: { order: 'asc' } }, { name: 'asc' }],
    });
  }

  async createClassroom(tenantId: string, dto: CreateClassroomDto): Promise<any> {
    return await db.classroom.create({
      data: {
        tenantId,
        campusId: dto.campusId,
        name: dto.name,
        code: dto.code,
        capacity: dto.capacity || 30,
        location: dto.location,
      },
      include: { campus: true },
    });
  }
}
