import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { db, withTransactionAndOutbox, StudentStatus } from '@cole/database';
import { DomainEvent } from '@cole/domain-types';
import { v4 as uuidv4 } from 'uuid';
import { CreateStudentDto, CreateGuardianDto, LinkGuardianDto } from './dto/student.dto';
import { EntitlementService } from '../entitlement/entitlement.service';

@Injectable()
export class StudentService {
  constructor(private entitlementService: EntitlementService) {}

  async createStudent(tenantId: string, dto: CreateStudentDto): Promise<any> {
    // 1. Verify Entitlement & Quota for Students
    const quotaCheck = await this.entitlementService.checkUsage(tenantId, 'students', 1);
    if (!quotaCheck.allowed) {
      throw new ForbiddenException(
        `Student enrollment limit reached for your plan (${quotaCheck.current}/${quotaCheck.limit}). Please upgrade your plan or purchase an add-on.`
      );
    }

    // 2. Check for unique constraints
    const existing = await db.student.findFirst({
      where: {
        tenantId,
        OR: [
          { studentCode: dto.studentCode },
          {
            documentType: dto.documentType || 'DNI',
            documentNumber: dto.documentNumber,
          },
        ],
      },
    });

    if (existing) {
      throw new ConflictException('Student code or Document Number already registered in this school');
    }

    const studentId = uuidv4();
    const studentCreatedEvent: DomainEvent = {
      eventId: uuidv4(),
      eventType: 'StudentCreated.v1',
      occurredAt: new Date().toISOString(),
      tenantId,
      aggregateId: studentId,
      version: 1,
      payload: {
        studentCode: dto.studentCode,
        documentType: dto.documentType || 'DNI',
        documentNumber: dto.documentNumber,
        firstName: dto.firstName,
        lastName: dto.lastName,
        status: dto.status || StudentStatus.ACTIVE,
      },
    };

    return await withTransactionAndOutbox(db, tenantId, [studentCreatedEvent], async (tx) => {
      const student = await (tx as typeof db).student.create({
        data: {
          id: studentId,
          tenantId,
          studentCode: dto.studentCode,
          documentType: dto.documentType || 'DNI',
          documentNumber: dto.documentNumber,
          firstName: dto.firstName,
          lastName: dto.lastName,
          birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
          gender: dto.gender,
          email: dto.email,
          phone: dto.phone,
          address: dto.address,
          status: dto.status || StudentStatus.ACTIVE,
        },
      });

      // Increment student usage in metering table
      await this.entitlementService.recordUsage(tenantId, 'students', 1);

      return student;
    });
  }

  async getStudents(tenantId: string): Promise<any[]> {
    return await db.student.findMany({
      where: { tenantId },
      include: {
        guardians: { include: { guardian: true } },
        enrollments: {
          include: {
            academicYear: true,
            grade: { include: { level: true } },
            section: true,
          },
          orderBy: { enrolledAt: 'desc' },
        },
      },
      orderBy: { lastName: 'asc' },
    });
  }

  async getStudentsForGuardian(tenantId: string, userId: string): Promise<any[]> {
    return db.student.findMany({
      where: {
        tenantId,
        guardians: { some: { guardian: { userId } } },
      },
      include: {
        enrollments: { include: { grade: true, section: true }, orderBy: { enrolledAt: 'desc' } },
      },
      orderBy: { lastName: 'asc' },
    });
  }

  async getStudentById(tenantId: string, id: string): Promise<any> {
    const student = await db.student.findFirst({
      where: { id, tenantId },
      include: {
        guardians: { include: { guardian: true } },
        enrollments: {
          include: {
            academicYear: true,
            grade: { include: { level: true } },
            section: true,
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found in this school`);
    }

    return student;
  }

  // --------------------------------------------------
  // GUARDIANS & FAMILIES
  // --------------------------------------------------

  async createGuardian(tenantId: string, dto: CreateGuardianDto): Promise<any> {
    const existing = await db.guardian.findUnique({
      where: {
        tenantId_documentType_documentNumber: {
          tenantId,
          documentType: dto.documentType || 'DNI',
          documentNumber: dto.documentNumber,
        },
      },
    });

    if (existing) {
      return existing; // Idempotent reuse of parent profile across siblings
    }

    return await db.guardian.create({
      data: {
        tenantId,
        documentType: dto.documentType || 'DNI',
        documentNumber: dto.documentNumber,
        firstName: dto.firstName,
        lastName: dto.lastName,
        relationship: dto.relationship,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        isEmergencyContact: dto.isEmergencyContact ?? true,
        isFinancialResponsible: dto.isFinancialResponsible ?? true,
      },
    });
  }

  async linkGuardian(tenantId: string, studentId: string, dto: LinkGuardianDto): Promise<any> {
    await this.getStudentById(tenantId, studentId);

    const guardian = await db.guardian.findFirst({
      where: { id: dto.guardianId, tenantId },
    });
    if (!guardian) {
      throw new NotFoundException(`Guardian with ID ${dto.guardianId} not found`);
    }

    return await db.studentGuardian.upsert({
      where: {
        tenantId_studentId_guardianId: {
          tenantId,
          studentId,
          guardianId: dto.guardianId,
        },
      },
      update: {
        isPrimary: dto.isPrimary ?? false,
      },
      create: {
        tenantId,
        studentId,
        guardianId: dto.guardianId,
        isPrimary: dto.isPrimary ?? false,
      },
    });
  }
}
