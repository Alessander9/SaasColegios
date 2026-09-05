import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsInt,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityType, ActivityStatus, PaymentMethod } from '@cole/database';

export class CreateActivityDto {
  @ApiProperty({ example: 'Taller Extracurricular de Robótica 2026' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'ACT-ROB-2026' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ enum: ActivityType, default: ActivityType.WORKSHOP })
  @IsEnum(ActivityType)
  type!: ActivityType;

  @ApiPropertyOptional({ example: 'Taller de robótica educativa, sensores y programación con Arduino' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'Laboratorio STEM (Pabellón B)' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ example: '2026-04-01T15:00:00.000Z' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '2026-06-30T17:00:00.000Z' })
  @IsDateString()
  endDate!: string;

  @ApiPropertyOptional({ example: 80.0, default: 0 })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ example: 25, default: 30 })
  @IsInt()
  @IsOptional()
  maxCapacity?: number;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  requiresConsent?: boolean;

  @ApiPropertyOptional({ example: 'teacher-uuid' })
  @IsString()
  @IsOptional()
  teacherInChargeId?: string;

  @ApiPropertyOptional({ enum: ActivityStatus, default: ActivityStatus.OPEN_REGISTRATION })
  @IsEnum(ActivityStatus)
  @IsOptional()
  status?: ActivityStatus;
}

export class RegisterToActivityDto {
  @ApiProperty({ example: 'activity-uuid' })
  @IsString()
  @IsNotEmpty()
  activityId!: string;

  @ApiProperty({ example: 'student-uuid' })
  @IsString()
  @IsNotEmpty()
  studentId!: string;

  @ApiProperty({ example: 'guardian-uuid' })
  @IsString()
  @IsNotEmpty()
  guardianId!: string;

  @ApiProperty({ example: true, description: 'Parental digital consent confirmation' })
  @IsBoolean()
  isAuthorized!: boolean;

  @ApiPropertyOptional({ example: 'req-idemp-act-892182' })
  @IsString()
  @IsOptional()
  idempotencyKey?: string;

  @ApiPropertyOptional({ enum: PaymentMethod, default: PaymentMethod.ONLINE_GATEWAY })
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;
}

export class RecordActivityAttendanceDto {
  @ApiProperty({ example: true, default: true })
  @IsBoolean()
  attended!: boolean;

  @ApiPropertyOptional({ example: 'Participó activamente en la sesión' })
  @IsString()
  @IsOptional()
  remarks?: string;
}
