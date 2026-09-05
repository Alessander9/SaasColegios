import { IsString, IsNotEmpty, IsOptional, IsInt, IsBoolean, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PeriodType } from '@cole/database';

export class UpdateSchoolProfileDto {
  @ApiProperty({ example: 'Colegio San José S.A.C.' })
  @IsString()
  @IsNotEmpty()
  legalName!: string;

  @ApiPropertyOptional({ example: '20491827361' })
  @IsString()
  @IsOptional()
  taxId?: string;

  @ApiPropertyOptional({ example: '+51 1 456-7890' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'contacto@sanjose.edu.pe' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'Av. Las Palmeras 450, San Isidro, Lima' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'https://cdn.cole.app/logos/sanjose.png' })
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'PEN', default: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ example: 'America/Lima', default: 'America/Lima' })
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiPropertyOptional({ example: 'NUMERIC_0_20', default: 'NUMERIC_0_20' })
  @IsString()
  @IsOptional()
  gradingScale?: string;
}

export class CreateCampusDto {
  @ApiProperty({ example: 'Sede Principal - San Isidro' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'SEDE-01' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiPropertyOptional({ example: 'Av. Las Palmeras 450' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: '+51 1 456-7890' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isMain?: boolean;
}

export class CreateAcademicYearDto {
  @ApiProperty({ example: 2026 })
  @IsInt()
  year!: number;

  @ApiProperty({ example: 'Año Escolar 2026' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: '2026-03-01T00:00:00.000Z' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '2026-12-20T23:59:59.000Z' })
  @IsDateString()
  endDate!: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CreateAcademicPeriodDto {
  @ApiProperty({ example: 'academic-year-uuid' })
  @IsString()
  @IsNotEmpty()
  academicYearId!: string;

  @ApiProperty({ example: 'I Bimestre' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'B1' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  order!: number;

  @ApiPropertyOptional({ enum: PeriodType, default: PeriodType.BIMESTER })
  @IsEnum(PeriodType)
  @IsOptional()
  type?: PeriodType;

  @ApiProperty({ example: '2026-03-01T00:00:00.000Z' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '2026-05-15T23:59:59.000Z' })
  @IsDateString()
  endDate!: string;
}

export class CreateEducationalLevelDto {
  @ApiProperty({ example: 'Primaria' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'PRI' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  order!: number;
}

export class CreateGradeLevelDto {
  @ApiProperty({ example: 'educational-level-uuid' })
  @IsString()
  @IsNotEmpty()
  levelId!: string;

  @ApiProperty({ example: '1er Grado de Primaria' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'PRI-1' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  order!: number;
}

export class CreateSectionDto {
  @ApiProperty({ example: 'academic-year-uuid' })
  @IsString()
  @IsNotEmpty()
  academicYearId!: string;

  @ApiProperty({ example: 'grade-level-uuid' })
  @IsString()
  @IsNotEmpty()
  gradeId!: string;

  @ApiProperty({ example: 'A' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'PRI-1-A-2026' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiPropertyOptional({ example: 'campus-uuid' })
  @IsString()
  @IsOptional()
  campusId?: string;

  @ApiPropertyOptional({ example: 'classroom-uuid' })
  @IsString()
  @IsOptional()
  classroomId?: string;

  @ApiPropertyOptional({ example: 30, default: 30 })
  @IsInt()
  @IsOptional()
  maxCapacity?: number;
}

export class CreateClassroomDto {
  @ApiProperty({ example: 'campus-uuid' })
  @IsString()
  @IsNotEmpty()
  campusId!: string;

  @ApiProperty({ example: 'Aula 101' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'A-101' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiPropertyOptional({ example: 30, default: 30 })
  @IsInt()
  @IsOptional()
  capacity?: number;

  @ApiPropertyOptional({ example: 'Pabellón A, Piso 1' })
  @IsString()
  @IsOptional()
  location?: string;
}
