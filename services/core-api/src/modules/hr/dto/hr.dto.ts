import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsInt,
  IsEmail,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmployeeType, EmployeeStatus, ContractType, WorkAttendanceStatus } from '@cole/database';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'EMP-2026-001' })
  @IsString()
  @IsNotEmpty()
  employeeCode!: string;

  @ApiPropertyOptional({ example: 'DNI', default: 'DNI' })
  @IsString()
  @IsOptional()
  documentType?: string;

  @ApiProperty({ example: '10928374' })
  @IsString()
  @IsNotEmpty()
  documentNumber!: string;

  @ApiProperty({ example: 'Elena' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ example: 'Torres Valencia' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiPropertyOptional({ example: 'elena.torres@sanjose.edu.pe' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '+51 988-112-233' })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiPropertyOptional({ example: 'Av. Javier Prado 234, San Borja' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: '1988-04-12T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  birthDate?: string;

  @ApiProperty({ enum: EmployeeType, default: EmployeeType.TEACHER })
  @IsEnum(EmployeeType)
  type!: EmployeeType;

  @ApiProperty({ example: 2800.0 })
  @IsNumber()
  baseSalary!: number;

  @ApiPropertyOptional({ example: '191-98765432-0-12' })
  @IsString()
  @IsOptional()
  bankAccount?: string;

  @ApiPropertyOptional({ example: 'AFP_INTEGRA', default: 'ONP' })
  @IsString()
  @IsOptional()
  pensionSystem?: string;

  @ApiPropertyOptional({ example: 'user-uuid' })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({ enum: EmployeeStatus, default: EmployeeStatus.ACTIVE })
  @IsEnum(EmployeeStatus)
  @IsOptional()
  status?: EmployeeStatus;
}

export class CreateContractDto {
  @ApiProperty({ example: 'employee-uuid' })
  @IsString()
  @IsNotEmpty()
  employeeId!: string;

  @ApiProperty({ enum: ContractType, default: ContractType.FIXED_TERM })
  @IsEnum(ContractType)
  type!: ContractType;

  @ApiProperty({ example: 'Docente de Comunicación Primaria' })
  @IsString()
  @IsNotEmpty()
  positionTitle!: string;

  @ApiProperty({ example: '2026-03-01T00:00:00.000Z' })
  @IsDateString()
  startDate!: string;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59.000Z' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ example: 2800.0 })
  @IsNumber()
  salary!: number;

  @ApiPropertyOptional({ example: 30, default: 30 })
  @IsInt()
  @IsOptional()
  hoursPerWeek?: number;
}

export class RecordWorkAttendanceDto {
  @ApiProperty({ example: 'employee-uuid' })
  @IsString()
  @IsNotEmpty()
  employeeId!: string;

  @ApiProperty({ example: '2026-04-15' })
  @IsString()
  @IsNotEmpty()
  date!: string;

  @ApiProperty({ enum: WorkAttendanceStatus, default: WorkAttendanceStatus.PRESENT })
  @IsEnum(WorkAttendanceStatus)
  status!: WorkAttendanceStatus;

  @ApiPropertyOptional({ example: '07:55:00' })
  @IsDateString()
  @IsOptional()
  checkInTime?: string;

  @ApiPropertyOptional({ example: '15:30:00' })
  @IsDateString()
  @IsOptional()
  checkOutTime?: string;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsInt()
  @IsOptional()
  minutesLate?: number;

  @ApiPropertyOptional({ example: 'Ingreso puntual' })
  @IsString()
  @IsOptional()
  remarks?: string;
}
