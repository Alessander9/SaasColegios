import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentType, DocumentStatus } from '@cole/database';

export class GenerateDocumentDto {
  @ApiProperty({ enum: DocumentType, default: DocumentType.REPORT_CARD })
  @IsEnum(DocumentType)
  type!: DocumentType;

  @ApiProperty({ example: 'Boleta Mateo García - I Bimestre 2026' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'Reporte de calificaciones del primer bimestre' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: { studentId: 'stu-1', periodId: 'per-1', academicYearId: 'ay-1' } })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 'user-uuid' })
  @IsString()
  @IsOptional()
  generatedBy?: string;
}

export class UploadDocumentDto {
  @ApiProperty({ enum: DocumentType, default: DocumentType.OTHER })
  @IsEnum(DocumentType)
  type!: DocumentType;

  @ApiProperty({ example: 'Contrato Laboral Elena Torres' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'Contrato de trabajo a plazo fijo' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'employee-uuid' })
  @IsString()
  @IsOptional()
  recipientId?: string;

  @ApiPropertyOptional({ example: { employeeId: 'emp-1', contractType: 'FIXED_TERM' } })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}

export class DocumentFilterDto {
  @ApiPropertyOptional({ enum: DocumentType })
  @IsEnum(DocumentType)
  @IsOptional()
  type?: DocumentType;

  @ApiPropertyOptional({ enum: DocumentStatus })
  @IsEnum(DocumentStatus)
  @IsOptional()
  status?: DocumentStatus;
}
