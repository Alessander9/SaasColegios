import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AdmissionStatus, EnrollmentStatus } from '@cole/database';

export class CreateAdmissionApplicationDto {
  @ApiProperty({ example: 'academic-year-uuid' })
  @IsString()
  @IsNotEmpty()
  academicYearId!: string;

  @ApiProperty({ example: 'grade-level-uuid' })
  @IsString()
  @IsNotEmpty()
  gradeId!: string;

  @ApiPropertyOptional({ example: 'student-uuid' })
  @IsString()
  @IsOptional()
  studentId?: string;

  @ApiProperty({ example: 'Luciana Ramos' })
  @IsString()
  @IsNotEmpty()
  applicantName!: string;

  @ApiProperty({ example: '76192834' })
  @IsString()
  @IsNotEmpty()
  applicantDoc!: string;

  @ApiProperty({ example: 'padres.ramos@gmail.com' })
  @IsString()
  @IsNotEmpty()
  contactEmail!: string;

  @ApiProperty({ example: '+51 988-776-655' })
  @IsString()
  @IsNotEmpty()
  contactPhone!: string;

  @ApiPropertyOptional({ example: 'Proceso regular de admisión 2026' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateAdmissionStatusDto {
  @ApiProperty({ enum: AdmissionStatus })
  @IsEnum(AdmissionStatus)
  status!: AdmissionStatus;

  @ApiPropertyOptional({ example: 18.5 })
  @IsNumber()
  @IsOptional()
  evaluationScore?: number;

  @ApiPropertyOptional({ example: 'Aprobado en entrevista psicológica' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class EnrollStudentDto {
  @ApiProperty({ example: 'student-uuid' })
  @IsString()
  @IsNotEmpty()
  studentId!: string;

  @ApiProperty({ example: 'academic-year-uuid' })
  @IsString()
  @IsNotEmpty()
  academicYearId!: string;

  @ApiProperty({ example: 'grade-level-uuid' })
  @IsString()
  @IsNotEmpty()
  gradeId!: string;

  @ApiProperty({ example: 'section-uuid' })
  @IsString()
  @IsNotEmpty()
  sectionId!: string;

  @ApiPropertyOptional({ enum: EnrollmentStatus, default: EnrollmentStatus.CONFIRMED })
  @IsEnum(EnrollmentStatus)
  @IsOptional()
  status?: EnrollmentStatus;
}

export class TransitionEnrollmentStatusDto {
  @ApiProperty({ enum: EnrollmentStatus })
  @IsEnum(EnrollmentStatus)
  status!: EnrollmentStatus;

  @ApiPropertyOptional({ example: 'Ficha médica y Ficha Única de Matrícula SIAGIE validadas' })
  @IsString()
  @IsOptional()
  remarks?: string;
}
