import {
  IsString,
  IsNotEmpty,
  IsInt,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OpenPayrollPeriodDto {
  @ApiProperty({ example: 'Planilla Mensual Abril 2026' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 2026 })
  @IsInt()
  year!: number;

  @ApiProperty({ example: 4 })
  @IsInt()
  month!: number;

  @ApiProperty({ example: '2026-04-01T00:00:00.000Z' })
  @IsString()
  @IsNotEmpty()
  startDate!: string;

  @ApiProperty({ example: '2026-04-30T23:59:59.000Z' })
  @IsString()
  @IsNotEmpty()
  endDate!: string;
}

export class CalculatePayrollDto {
  @ApiProperty({ example: 'payroll-period-uuid' })
  @IsString()
  @IsNotEmpty()
  periodId!: string;
}
