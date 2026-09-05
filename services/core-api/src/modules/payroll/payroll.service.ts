import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import {
  db,
  withTransactionAndOutbox,
  PayrollPeriodStatus,
  PayslipStatus,
  EmployeeStatus,
} from '@cole/database';
import { DomainEvent } from '@cole/domain-types';
import { v4 as uuidv4 } from 'uuid';
import { OpenPayrollPeriodDto, CalculatePayrollDto } from './dto/payroll.dto';

@Injectable()
export class PayrollService {
  // --------------------------------------------------
  // PAYROLL PERIODS
  // --------------------------------------------------

  async openPeriod(tenantId: string, dto: OpenPayrollPeriodDto): Promise<any> {
    const existing = await db.payrollPeriod.findUnique({
      where: {
        tenantId_year_month: {
          tenantId,
          year: dto.year,
          month: dto.month,
        },
      },
    });
    if (existing) {
      throw new ConflictException(`Payroll period for ${dto.month}/${dto.year} already exists`);
    }

    return await db.payrollPeriod.create({
      data: {
        tenantId,
        name: dto.name,
        year: dto.year,
        month: dto.month,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        status: PayrollPeriodStatus.OPEN,
      },
    });
  }

  async getPeriods(tenantId: string): Promise<any[]> {
    return await db.payrollPeriod.findMany({
      where: { tenantId },
      include: {
        _count: { select: { slips: true } },
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  // --------------------------------------------------
  // PAYROLL LIQUIDATION ENGINE (EARNINGS & DEDUCTIONS)
  // --------------------------------------------------

  async calculatePayroll(tenantId: string, dto: CalculatePayrollDto): Promise<any> {
    const period = await db.payrollPeriod.findFirst({
      where: { id: dto.periodId, tenantId },
    });
    if (!period) throw new NotFoundException('Payroll period not found');

    if (period.status === PayrollPeriodStatus.CLOSED) {
      throw new BadRequestException('Cannot recalculate a closed payroll period');
    }

    const activeEmployees = await db.employee.findMany({
      where: { tenantId, status: EmployeeStatus.ACTIVE },
      include: { contracts: { where: { isActive: true } } },
    });

    const slipsCreated: any[] = [];
    const event: DomainEvent = {
      eventId: uuidv4(),
      eventType: 'PayrollCalculated.v1',
      occurredAt: new Date().toISOString(),
      tenantId,
      aggregateId: period.id,
      version: 1,
      payload: {
        periodId: period.id,
        employeesProcessed: activeEmployees.length,
      },
    };

    return await withTransactionAndOutbox(db, tenantId, [event], async (tx) => {
      // Clear previous calculation if re-calculating
      await (tx as typeof db).payrollSlip.deleteMany({
        where: { periodId: period.id, tenantId },
      });

      for (const emp of activeEmployees) {
        const baseSalary = Number(emp.baseSalary);

        // Earnings
        const asigFamiliar = 102.5; // Asignación familiar estándar
        const grossEarnings = baseSalary + asigFamiliar;

        // Deductions (AFP/ONP ~ 13%)
        const pensionRate = emp.pensionSystem.startsWith('AFP') ? 0.128 : 0.13;
        const pensionDeduction = Number((baseSalary * pensionRate).toFixed(2));
        const totalDeductions = pensionDeduction;

        const netPay = Number((grossEarnings - totalDeductions).toFixed(2));

        const slipId = uuidv4();
        const slip = await (tx as typeof db).payrollSlip.create({
          data: {
            id: slipId,
            tenantId,
            periodId: period.id,
            employeeId: emp.id,
            grossEarnings,
            totalDeductions,
            netPay,
            status: PayslipStatus.APPROVED,
          },
        });

        // Add slip items
        await (tx as typeof db).payrollItem.createMany({
          data: [
            {
              id: uuidv4(),
              tenantId,
              slipId: slip.id,
              type: 'EARNING',
              code: 'BASICO',
              name: 'Sueldo Básico',
              amount: baseSalary,
            },
            {
              id: uuidv4(),
              tenantId,
              slipId: slip.id,
              type: 'EARNING',
              code: 'ASIG_FAM',
              name: 'Asignación Familiar',
              amount: asigFamiliar,
            },
            {
              id: uuidv4(),
              tenantId,
              slipId: slip.id,
              type: 'DEDUCTION',
              code: emp.pensionSystem,
              name: `Aporte ${emp.pensionSystem}`,
              amount: pensionDeduction,
            },
          ],
        });

        slipsCreated.push(slip);
      }

      await (tx as typeof db).payrollPeriod.update({
        where: { id: period.id },
        data: { status: PayrollPeriodStatus.APPROVED },
      });

      return {
        periodId: period.id,
        employeesProcessed: slipsCreated.length,
        status: 'APPROVED',
      };
    });
  }

  async getPayslips(tenantId: string, periodId: string): Promise<any[]> {
    return await db.payrollSlip.findMany({
      where: { tenantId, periodId },
      include: {
        employee: true,
        items: true,
      },
      orderBy: { employee: { lastName: 'asc' } },
    });
  }
}
