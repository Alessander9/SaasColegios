import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import {
  db,
  withTransactionAndOutbox,
  ChargeStatus,
  PaymentStatus,
  CashBoxSessionStatus,
  MovementType,
} from '@cole/database';
import { DomainEvent } from '@cole/domain-types';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateFeeConceptDto,
  GeneratePensionScheduleDto,
  CreatePaymentDto,
  ReversePaymentDto,
  OpenCashBoxDto,
  CloseCashBoxDto,
  RecordCashMovementDto,
} from './dto/finance.dto';
import { StructuredLogger } from '@cole/logger';

@Injectable()
export class FinanceService {
  private logger = new StructuredLogger('finance-service');

  // --------------------------------------------------
  // FEE CONCEPTS CATALOG
  // --------------------------------------------------

  async createConcept(tenantId: string, dto: CreateFeeConceptDto): Promise<any> {
    const existing = await db.feeConcept.findUnique({
      where: { tenantId_code: { tenantId, code: dto.code } },
    });
    if (existing) {
      throw new ConflictException(`Concept with code ${dto.code} already exists`);
    }

    return await db.feeConcept.create({
      data: {
        tenantId,
        code: dto.code,
        name: dto.name,
        category: dto.category,
        defaultAmount: dto.defaultAmount,
      },
    });
  }

  async getConcepts(tenantId: string): Promise<any[]> {
    return await db.feeConcept.findMany({
      where: { tenantId, isActive: true },
      orderBy: { code: 'asc' },
    });
  }

  // --------------------------------------------------
  // TUITION PENSION SCHEDULE GENERATION
  // --------------------------------------------------

  async generatePensionSchedule(tenantId: string, dto: GeneratePensionScheduleDto): Promise<any[]> {
    const student = await db.student.findFirst({
      where: { id: dto.studentId, tenantId },
      include: { guardians: { where: { isPrimary: true }, include: { guardian: true } } },
    });
    if (!student) throw new NotFoundException('Student not found');

    const primaryGuardianId = student.guardians[0]?.guardianId;
    const netAmount = Math.max(0, dto.monthlyAmount - (dto.discountPerMonth || 0));

    const chargesCreated: any[] = [];
    const events: DomainEvent[] = [];

    for (const [index, m] of dto.months.entries()) {
      const chargeId = uuidv4();
      const chargeCode = `CHG-${new Date().getFullYear()}-${student.studentCode}-${index + 1}`;

      const chargeCreatedEvent: DomainEvent = {
        eventId: uuidv4(),
        eventType: 'ChargeCreated.v1',
        occurredAt: new Date().toISOString(),
        tenantId,
        aggregateId: chargeId,
        version: 1,
        payload: {
          chargeCode,
          studentId: student.id,
          title: `Pensión ${m.month} - ${student.firstName} ${student.lastName}`,
          totalAmount: netAmount,
          dueDate: m.dueDate,
        },
      };
      events.push(chargeCreatedEvent);
    }

    return await withTransactionAndOutbox(db, tenantId, events, async (tx) => {
      for (const [index, m] of dto.months.entries()) {
        const chargeCode = `CHG-${new Date().getFullYear()}-${student.studentCode}-${index + 1}`;
        const charge = await (tx as typeof db).charge.create({
          data: {
            id: events[index]!.aggregateId,
            tenantId,
            conceptId: dto.conceptId,
            studentId: student.id,
            guardianId: primaryGuardianId,
            academicYearId: dto.academicYearId,
            title: `Pensión ${m.month} - ${student.firstName} ${student.lastName}`,
            code: chargeCode,
            originalAmount: dto.monthlyAmount,
            discountAmount: dto.discountPerMonth || 0,
            totalAmount: netAmount,
            paidAmount: 0,
            dueDate: new Date(m.dueDate),
            status: ChargeStatus.PENDING,
          },
        });
        chargesCreated.push(charge);
      }
      return chargesCreated;
    });
  }

  // --------------------------------------------------
  // CHARGES & CUSTOMER ACCOUNT
  // --------------------------------------------------

  async getCharges(tenantId: string, studentId?: string, status?: ChargeStatus): Promise<any[]> {
    return await db.charge.findMany({
      where: {
        tenantId,
        ...(studentId ? { studentId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        student: true,
        concept: true,
        payments: true,
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  // --------------------------------------------------
  // IDEMPOTENT PAYMENT PROCESSING
  // --------------------------------------------------

  async recordPayment(tenantId: string, dto: CreatePaymentDto): Promise<any> {
    // 1. Idempotency check
    const existingPayment = await db.payment.findFirst({
      where: { idempotencyKey: dto.idempotencyKey, tenantId },
      include: { receipt: true, charge: true },
    });
    if (existingPayment) {
      this.logger.info(`Idempotent payment returned: ${dto.idempotencyKey}`, {
        paymentId: existingPayment.id,
      });
      return existingPayment;
    }

    // 2. Charge lookup
    const charge = await db.charge.findFirst({
      where: { id: dto.chargeId, tenantId },
      include: { student: true },
    });
    if (!charge) throw new NotFoundException('Charge record not found in this school');

    if (charge.status === ChargeStatus.PAID) {
      throw new BadRequestException('Charge is already fully paid');
    }

    const currentPaid = Number(charge.paidAmount);
    const newPaidAmount = currentPaid + Number(dto.amount);
    const totalDue = Number(charge.totalAmount);

    if (newPaidAmount > totalDue) {
      throw new BadRequestException(
        `Payment amount (${dto.amount}) exceeds remaining balance (${totalDue - currentPaid})`
      );
    }

    const newChargeStatus =
      newPaidAmount >= totalDue ? ChargeStatus.PAID : ChargeStatus.PARTIALLY_PAID;

    const paymentId = uuidv4();
    const paymentCode = `PAY-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const receiptNumber = `B001-${Math.floor(100000 + Math.random() * 900000)}`;

    const paymentCompletedEvent: DomainEvent = {
      eventId: uuidv4(),
      eventType: 'PaymentCompleted.v1',
      occurredAt: new Date().toISOString(),
      tenantId,
      aggregateId: paymentId,
      version: 1,
      payload: {
        paymentCode,
        chargeId: charge.id,
        amount: dto.amount,
        method: dto.method,
        studentId: charge.studentId,
      },
    };

    return await withTransactionAndOutbox(db, tenantId, [paymentCompletedEvent], async (tx) => {
      // Create Payment
      const payment = await (tx as typeof db).payment.create({
        data: {
          id: paymentId,
          tenantId,
          chargeId: charge.id,
          cashBoxSessionId: dto.cashBoxSessionId,
          idempotencyKey: dto.idempotencyKey,
          code: paymentCode,
          amount: dto.amount,
          method: dto.method,
          status: PaymentStatus.COMPLETED,
          referenceNumber: dto.referenceNumber,
          notes: dto.notes,
        },
      });

      // Issue Receipt
      await (tx as typeof db).receipt.create({
        data: {
          id: uuidv4(),
          tenantId,
          paymentId: payment.id,
          receiptNumber,
          type: dto.receiptType || 'BOLETA',
          recipientName:
            dto.recipientName ||
            `${charge.student?.firstName || ''} ${charge.student?.lastName || ''}`.trim() ||
            'Público General',
          recipientDoc: dto.recipientDoc || charge.student?.documentNumber || '00000000',
          totalAmount: dto.amount,
        },
      });

      // Update Charge Status
      await (tx as typeof db).charge.update({
        where: { id: charge.id },
        data: {
          paidAmount: newPaidAmount,
          status: newChargeStatus,
        },
      });

      return await (tx as typeof db).payment.findUnique({
        where: { id: payment.id },
        include: { receipt: true, charge: true },
      });
    });
  }

  // --------------------------------------------------
  // INMUTABLE REVERSAL / CREDIT NOTES
  // --------------------------------------------------

  async reversePayment(
    tenantId: string,
    paymentId: string,
    dto: ReversePaymentDto
  ): Promise<any> {
    const payment = await db.payment.findFirst({
      where: { id: paymentId, tenantId },
      include: { charge: true },
    });
    if (!payment) throw new NotFoundException('Payment not found');

    if (payment.status === PaymentStatus.REVERSED) {
      throw new BadRequestException('Payment is already reversed');
    }

    const creditNoteId = uuidv4();
    const paymentRefundedEvent: DomainEvent = {
      eventId: uuidv4(),
      eventType: 'PaymentRefunded.v1',
      occurredAt: new Date().toISOString(),
      tenantId,
      aggregateId: payment.id,
      version: 1,
      payload: {
        paymentId: payment.id,
        chargeId: payment.chargeId,
        amount: payment.amount,
        noteNumber: dto.noteNumber,
        reason: dto.reason,
      },
    };

    return await withTransactionAndOutbox(db, tenantId, [paymentRefundedEvent], async (tx) => {
      // 1. Mark payment as reversed
      await (tx as typeof db).payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.REVERSED },
      });

      // 2. Issue Credit Note
      const creditNote = await (tx as typeof db).creditNote.create({
        data: {
          id: creditNoteId,
          tenantId,
          chargeId: payment.chargeId,
          paymentId: payment.id,
          noteNumber: dto.noteNumber,
          amount: payment.amount,
          reason: dto.reason,
        },
      });

      // 3. Adjust Charge balance
      const charge = payment.charge ?? await (tx as typeof db).charge.findFirst({
        where: { id: payment.chargeId, tenantId },
      });
      if (!charge) throw new NotFoundException('Charge not found for payment reversal');
      const adjustedPaid = Math.max(0, Number(charge.paidAmount) - Number(payment.amount));
      const adjustedStatus =
        adjustedPaid <= 0
          ? ChargeStatus.PENDING
          : adjustedPaid < Number(charge.totalAmount)
          ? ChargeStatus.PARTIALLY_PAID
          : ChargeStatus.PAID;

      await (tx as typeof db).charge.update({
        where: { id: charge.id },
        data: {
          paidAmount: adjustedPaid,
          status: adjustedStatus,
        },
      });

      return creditNote;
    });
  }

  // --------------------------------------------------
  // CASH BOX SESSIONS & MOVEMENTS
  // --------------------------------------------------

  async openCashBox(tenantId: string, userId: string, dto: OpenCashBoxDto): Promise<any> {
    const existingOpen = await db.cashBoxSession.findFirst({
      where: {
        tenantId,
        cashBoxId: dto.cashBoxId,
        status: CashBoxSessionStatus.OPEN,
      },
    });
    if (existingOpen) {
      throw new ConflictException('A cash box session is already open for this register');
    }

    return await db.cashBoxSession.create({
      data: {
        tenantId,
        cashBoxId: dto.cashBoxId,
        userId,
        openingAmount: dto.openingAmount || 0,
        status: CashBoxSessionStatus.OPEN,
      },
      include: { cashBox: true },
    });
  }

  async closeCashBox(tenantId: string, sessionId: string, dto: CloseCashBoxDto): Promise<any> {
    const session = await db.cashBoxSession.findFirst({
      where: { id: sessionId, tenantId, status: CashBoxSessionStatus.OPEN },
      include: {
        payments: { where: { status: PaymentStatus.COMPLETED, method: 'CASH' } },
        movements: true,
      },
    });
    if (!session) throw new NotFoundException('Open cash box session not found');

    const totalCashPayments = session.payments.reduce((acc, p) => acc + Number(p.amount), 0);
    const totalIncomes = session.movements
      .filter((m) => m.type === MovementType.INCOME)
      .reduce((acc, m) => acc + Number(m.amount), 0);
    const totalExpenses = session.movements
      .filter((m) => m.type === MovementType.EXPENSE)
      .reduce((acc, m) => acc + Number(m.amount), 0);

    const calculatedTotal =
      Number(session.openingAmount) + totalCashPayments + totalIncomes - totalExpenses;
    const difference = dto.actualCashAmount - calculatedTotal;

    return await db.cashBoxSession.update({
      where: { id: sessionId },
      data: {
        closingAmount: dto.actualCashAmount,
        calculatedTotal,
        difference,
        status: CashBoxSessionStatus.CLOSED,
        closedAt: new Date(),
      },
      include: { cashBox: true },
    });
  }

  async recordCashMovement(
    tenantId: string,
    sessionId: string,
    dto: RecordCashMovementDto
  ): Promise<any> {
    const session = await db.cashBoxSession.findFirst({
      where: { id: sessionId, tenantId, status: CashBoxSessionStatus.OPEN },
    });
    if (!session) throw new NotFoundException('Active cash box session not found');

    return await db.cashBoxMovement.create({
      data: {
        tenantId,
        sessionId,
        type: dto.type,
        amount: dto.amount,
        reason: dto.reason,
      },
    });
  }
}
