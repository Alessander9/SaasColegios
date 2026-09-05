import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { db, withTransactionAndOutbox, EmployeeStatus } from '@cole/database';
import { DomainEvent } from '@cole/domain-types';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateEmployeeDto,
  CreateContractDto,
  RecordWorkAttendanceDto,
} from './dto/hr.dto';

@Injectable()
export class HRService {
  // --------------------------------------------------
  // EMPLOYEE FILE & CONTRACTS
  // --------------------------------------------------

  async createEmployee(tenantId: string, dto: CreateEmployeeDto): Promise<any> {
    const existing = await db.employee.findFirst({
      where: {
        tenantId,
        OR: [
          { employeeCode: dto.employeeCode },
          { documentNumber: dto.documentNumber },
        ],
      },
    });
    if (existing) {
      throw new ConflictException('Employee with this code or document already exists');
    }

    const employeeId = uuidv4();
    const employeeHiredEvent: DomainEvent = {
      eventId: uuidv4(),
      eventType: 'EmployeeHired.v1',
      occurredAt: new Date().toISOString(),
      tenantId,
      aggregateId: employeeId,
      version: 1,
      payload: {
        employeeCode: dto.employeeCode,
        fullName: `${dto.firstName} ${dto.lastName}`,
        type: dto.type,
        baseSalary: dto.baseSalary,
      },
    };

    return await withTransactionAndOutbox(db, tenantId, [employeeHiredEvent], async (tx) => {
      return await (tx as typeof db).employee.create({
        data: {
          id: employeeId,
          tenantId,
          userId: dto.userId,
          employeeCode: dto.employeeCode,
          documentType: dto.documentType || 'DNI',
          documentNumber: dto.documentNumber,
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          phone: dto.phone,
          address: dto.address,
          birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
          type: dto.type,
          baseSalary: dto.baseSalary,
          bankAccount: dto.bankAccount,
          pensionSystem: dto.pensionSystem || 'ONP',
          status: dto.status || EmployeeStatus.ACTIVE,
        },
      });
    });
  }

  async getEmployees(tenantId: string, status?: EmployeeStatus): Promise<any[]> {
    return await db.employee.findMany({
      where: {
        tenantId,
        ...(status ? { status } : {}),
      },
      include: {
        contracts: { where: { isActive: true } },
        user: true,
      },
      orderBy: { lastName: 'asc' },
    });
  }

  async getEmployeeById(tenantId: string, id: string): Promise<any> {
    const employee = await db.employee.findFirst({
      where: { id, tenantId },
      include: {
        contracts: true,
        attendances: { orderBy: { date: 'desc' }, take: 30 },
        user: true,
      },
    });
    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }

  async createContract(tenantId: string, dto: CreateContractDto): Promise<any> {
    const employee = await db.employee.findFirst({
      where: { id: dto.employeeId, tenantId },
    });
    if (!employee) throw new NotFoundException('Employee not found');

    return await db.employmentContract.create({
      data: {
        tenantId,
        employeeId: dto.employeeId,
        type: dto.type,
        positionTitle: dto.positionTitle,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        salary: dto.salary,
        hoursPerWeek: dto.hoursPerWeek || 30,
        isActive: true,
      },
    });
  }

  // --------------------------------------------------
  // WORK ATTENDANCE & PUNCTUALITY
  // --------------------------------------------------

  async recordWorkAttendance(tenantId: string, dto: RecordWorkAttendanceDto): Promise<any> {
    const attendanceDate = new Date(dto.date);

    return await db.workAttendance.upsert({
      where: {
        tenantId_employeeId_date: {
          tenantId,
          employeeId: dto.employeeId,
          date: attendanceDate,
        },
      },
      update: {
        status: dto.status,
        checkInTime: dto.checkInTime ? new Date(dto.checkInTime) : null,
        checkOutTime: dto.checkOutTime ? new Date(dto.checkOutTime) : null,
        minutesLate: dto.minutesLate || 0,
        remarks: dto.remarks,
        recordedAt: new Date(),
      },
      create: {
        tenantId,
        employeeId: dto.employeeId,
        date: attendanceDate,
        status: dto.status,
        checkInTime: dto.checkInTime ? new Date(dto.checkInTime) : null,
        checkOutTime: dto.checkOutTime ? new Date(dto.checkOutTime) : null,
        minutesLate: dto.minutesLate || 0,
        remarks: dto.remarks,
      },
    });
  }

  async getWorkAttendanceReport(tenantId: string, date?: string): Promise<any[]> {
    return await db.workAttendance.findMany({
      where: {
        tenantId,
        ...(date ? { date: new Date(date) } : {}),
      },
      include: { employee: true },
      orderBy: [{ date: 'desc' }, { employee: { lastName: 'asc' } }],
    });
  }
}
