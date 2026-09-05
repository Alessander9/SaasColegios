import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConceptCategory, PaymentMethod, ReceiptType, MovementType } from '@cole/database';

export class CreateFeeConceptDto {
  @ApiProperty({ example: 'PEN-2026' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ example: 'Pensión Escolar Mensual' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ enum: ConceptCategory, default: ConceptCategory.TUITION_PENSION })
  @IsEnum(ConceptCategory)
  category!: ConceptCategory;

  @ApiProperty({ example: 350.0 })
  @IsNumber()
  defaultAmount!: number;
}

export class GeneratePensionScheduleDto {
  @ApiProperty({ example: 'student-uuid' })
  @IsString()
  @IsNotEmpty()
  studentId!: string;

  @ApiProperty({ example: 'academic-year-uuid' })
  @IsString()
  @IsNotEmpty()
  academicYearId!: string;

  @ApiProperty({ example: 'concept-uuid' })
  @IsString()
  @IsNotEmpty()
  conceptId!: string;

  @ApiProperty({ example: 350.0 })
  @IsNumber()
  monthlyAmount!: number;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @IsOptional()
  discountPerMonth?: number;

  @ApiProperty({
    example: [
      { month: 'Marzo', dueDate: '2026-03-31T23:59:59.000Z' },
      { month: 'Abril', dueDate: '2026-04-30T23:59:59.000Z' },
      { month: 'Mayo', dueDate: '2026-05-31T23:59:59.000Z' },
    ],
  })
  @IsArray()
  months!: Array<{ month: string; dueDate: string }>;
}

export class CreatePaymentDto {
  @ApiProperty({ example: 'charge-uuid' })
  @IsString()
  @IsNotEmpty()
  chargeId!: string;

  @ApiProperty({ example: 'req-idemp-8921829102-p1' })
  @IsString()
  @IsNotEmpty()
  idempotencyKey!: string;

  @ApiProperty({ example: 350.0 })
  @IsNumber()
  amount!: number;

  @ApiProperty({ enum: PaymentMethod, default: PaymentMethod.CASH })
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @ApiPropertyOptional({ example: 'session-uuid' })
  @IsString()
  @IsOptional()
  cashBoxSessionId?: string;

  @ApiPropertyOptional({ example: 'OP-98765432' })
  @IsString()
  @IsOptional()
  referenceNumber?: string;

  @ApiPropertyOptional({ example: 'Pago en ventanilla' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ enum: ReceiptType, default: ReceiptType.BOLETA })
  @IsEnum(ReceiptType)
  @IsOptional()
  receiptType?: ReceiptType;

  @ApiPropertyOptional({ example: 'Roberto García Vargas' })
  @IsString()
  @IsOptional()
  recipientName?: string;

  @ApiPropertyOptional({ example: '10928374' })
  @IsString()
  @IsOptional()
  recipientDoc?: string;
}

export class ReversePaymentDto {
  @ApiProperty({ example: 'NC01-000001' })
  @IsString()
  @IsNotEmpty()
  noteNumber!: string;

  @ApiProperty({ example: 'Error en digitación de monto por cajero' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}

export class OpenCashBoxDto {
  @ApiProperty({ example: 'caja-uuid' })
  @IsString()
  @IsNotEmpty()
  cashBoxId!: string;

  @ApiPropertyOptional({ example: 100.0, default: 0 })
  @IsNumber()
  @IsOptional()
  openingAmount?: number;
}

export class CloseCashBoxDto {
  @ApiProperty({ example: 1250.0 })
  @IsNumber()
  actualCashAmount!: number;
}

export class RecordCashMovementDto {
  @ApiProperty({ enum: MovementType })
  @IsEnum(MovementType)
  type!: MovementType;

  @ApiProperty({ example: 45.0 })
  @IsNumber()
  amount!: number;

  @ApiProperty({ example: 'Compra de suministros de limpieza de emergencia' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}
