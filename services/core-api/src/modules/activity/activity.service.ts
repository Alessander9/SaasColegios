import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import {
  db,
  withTransactionAndOutbox,
  ActivityRegistrationStatus,
  ChargeStatus,
  PaymentStatus,
  PaymentMethod,
} from '@cole/database';
import { DomainEvent } from '@cole/domain-types';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateActivityDto,
  RegisterToActivityDto,
  RecordActivityAttendanceDto,
} from './dto/activity.dto';

@Injectable()
export class ActivityService {
  // --------------------------------------------------
  // ACTIVITIES CATALOG
  // --------------------------------------------------

  async createActivity(tenantId: string, dto: CreateActivityDto): Promise<any> {
    const existing = await db.activity.findUnique({
      where: { tenantId_code: { tenantId, code: dto.code } },
    });
    if (existing) {
      throw new ConflictException(`Activity with code ${dto.code} already exists`);
    }

    const activityId = uuidv4();
    const activityCreatedEvent: DomainEvent = {
      eventId: uuidv4(),
      eventType: 'ActivityCreated.v1',
      occurredAt: new Date().toISOString(),
      tenantId,
      aggregateId: activityId,
      version: 1,
      payload: {
        code: dto.code,
        title: dto.title,
        type: dto.type,
        price: dto.price || 0,
        maxCapacity: dto.maxCapacity || 30,
        startDate: dto.startDate,
      },
    };

    return await withTransactionAndOutbox(db, tenantId, [activityCreatedEvent], async (tx) => {
      return await (tx as typeof db).activity.create({
        data: {
          id: activityId,
          tenantId,
          title: dto.title,
          code: dto.code,
          type: dto.type,
          description: dto.description,
          location: dto.location,
          startDate: new Date(dto.startDate),
          endDate: new Date(dto.endDate),
          price: dto.price || 0,
          maxCapacity: dto.maxCapacity || 30,
          requiresConsent: dto.requiresConsent ?? true,
          teacherInChargeId: dto.teacherInChargeId,
          status: dto.status,
        },
        include: { teacherInCharge: true },
      });
    });
  }

  async getActivities(tenantId: string): Promise<any[]> {
    return await db.activity.findMany({
      where: { tenantId },
      include: {
        teacherInCharge: true,
        _count: { select: { registrations: true } },
      },
      orderBy: { startDate: 'asc' },
    });
  }

  async getActivityById(tenantId: string, id: string): Promise<any> {
    const activity = await db.activity.findFirst({
      where: { id, tenantId },
      include: {
        teacherInCharge: true,
        registrations: {
          include: {
            student: true,
            consent: { include: { guardian: true } },
            attendance: true,
          },
        },
      },
    });
    if (!activity) throw new NotFoundException('Activity not found');
    return activity;
  }

  // --------------------------------------------------
  // REGISTRATION & PARENTAL DIGITAL CONSENT
  // --------------------------------------------------

  async registerToActivity(
    tenantId: string,
    dto: RegisterToActivityDto,
    ipAddress?: string
  ): Promise<any> {
    if (dto.idempotencyKey) {
      const existingRegistration = await db.activityRegistration.findFirst({
        where: { tenantId, studentId: dto.studentId, code: { contains: `IDEMP-${dto.idempotencyKey}` } },
        include: { activity: true, student: true, consent: true },
      });
      if (existingRegistration) return existingRegistration;
    }

    // 1. Verify Activity and Capacity
    const activity = await db.activity.findFirst({
      where: { id: dto.activityId, tenantId },
      include: {
        _count: {
          select: {
            registrations: {
              where: { status: { not: ActivityRegistrationStatus.CANCELLED } },
            },
          },
        },
      },
    });
    if (!activity) throw new NotFoundException('Activity not found');

    if (activity._count.registrations >= activity.maxCapacity) {
      throw new ForbiddenException(
        `Activity '${activity.title}' has reached its maximum capacity (${activity.maxCapacity} students)`
      );
    }

    // 2. Verify Student & Guardian
    const student = await db.student.findFirst({
      where: { id: dto.studentId, tenantId },
    });
    if (!student) throw new NotFoundException('Student not found in this school');

    const guardian = await db.guardian.findFirst({
      where: { id: dto.guardianId, tenantId },
    });
    if (!guardian) throw new NotFoundException('Parent/Guardian not found in this school');

    if (activity.requiresConsent && !dto.isAuthorized) {
      throw new BadRequestException(
        'Parental authorization consent is required to register for this activity'
      );
    }

    const price = Number(activity.price);
    const registrationId = uuidv4();
    const regCode = `REG-ACT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}${dto.idempotencyKey ? `-IDEMP-${dto.idempotencyKey}` : ''}`;
    const chargeId = price > 0 ? uuidv4() : null;

    const events: DomainEvent[] = [
      {
        eventId: uuidv4(),
        eventType: 'RegistrationCreated.v1',
        occurredAt: new Date().toISOString(),
        tenantId,
        aggregateId: registrationId,
        version: 1,
        payload: {
          regCode,
          activityId: activity.id,
          studentId: student.id,
          price,
        },
      },
      {
        eventId: uuidv4(),
        eventType: 'ConsentSigned.v1',
        occurredAt: new Date().toISOString(),
        tenantId,
        aggregateId: registrationId,
        version: 1,
        payload: {
          registrationId,
          guardianId: guardian.id,
          isAuthorized: dto.isAuthorized,
        },
      },
    ];

    return await withTransactionAndOutbox(db, tenantId, events, async (tx) => {
      // 1. Create Financial Charge if price > 0
      if (price > 0 && chargeId) {
        let feeConcept = await db.feeConcept.findFirst({
          where: { tenantId, code: 'ACT-FEE' },
        });
        if (!feeConcept) {
          feeConcept = await (tx as typeof db).feeConcept.create({
            data: {
              tenantId,
              code: 'ACT-FEE',
              name: 'Inscripción a Actividad / Taller',
              category: 'ACTIVITY_FEE',
              defaultAmount: price,
            },
          });
        }

        await (tx as typeof db).charge.create({
          data: {
            id: chargeId,
            tenantId,
            conceptId: feeConcept.id,
            studentId: student.id,
            guardianId: guardian.id,
            title: `Actividad: ${activity.title} - ${student.firstName} ${student.lastName}`,
            code: `CHG-ACT-${Math.floor(10000 + Math.random() * 90000)}`,
            originalAmount: price,
            totalAmount: price,
            paidAmount: price,
            dueDate: new Date(),
            status: ChargeStatus.PAID,
          },
        });

        if (dto.idempotencyKey) {
          const paymentId = uuidv4();
          await (tx as typeof db).payment.create({
            data: {
              id: paymentId,
              tenantId,
              chargeId,
              idempotencyKey: dto.idempotencyKey,
              code: `PAY-${regCode}`,
              amount: price,
              method: dto.paymentMethod || PaymentMethod.ONLINE_GATEWAY,
              status: PaymentStatus.COMPLETED,
              notes: `Pago automático de inscripción ${activity.title}`,
            },
          });

          await (tx as typeof db).receipt.create({
            data: {
              id: uuidv4(),
              tenantId,
              paymentId,
              receiptNumber: `B003-${Math.floor(100000 + Math.random() * 900000)}`,
              type: 'BOLETA',
              recipientName: `${guardian.firstName} ${guardian.lastName}`,
              recipientDoc: guardian.documentNumber,
              totalAmount: price,
            },
          });
        }
      }

      // 2. Create Activity Registration
      const registration = await (tx as typeof db).activityRegistration.create({
        data: {
          id: registrationId,
          tenantId,
          activityId: activity.id,
          studentId: student.id,
          chargeId,
          code: regCode,
          status: ActivityRegistrationStatus.CONFIRMED,
        },
      });

      // 3. Store Digital Consent
      await (tx as typeof db).parentConsent.create({
        data: {
          id: uuidv4(),
          tenantId,
          registrationId: registration.id,
          guardianId: guardian.id,
          isAuthorized: dto.isAuthorized,
          ipAddress: ipAddress || '127.0.0.1',
        },
      });

      return await (tx as typeof db).activityRegistration.findUnique({
        where: { id: registration.id },
        include: {
          activity: true,
          student: true,
          consent: { include: { guardian: true } },
        },
      });
    });
  }

  // --------------------------------------------------
  // ATTENDANCE CHECK-IN
  // --------------------------------------------------

  async recordAttendance(
    tenantId: string,
    registrationId: string,
    dto: RecordActivityAttendanceDto
  ): Promise<any> {
    const registration = await db.activityRegistration.findFirst({
      where: { id: registrationId, tenantId },
    });
    if (!registration) throw new NotFoundException('Activity registration not found');

    return await db.activityAttendance.upsert({
      where: { registrationId },
      update: {
        attended: dto.attended,
        remarks: dto.remarks,
        checkedAt: new Date(),
      },
      create: {
        id: uuidv4(),
        tenantId,
        registrationId,
        attended: dto.attended,
        remarks: dto.remarks,
      },
    });
  }
}
