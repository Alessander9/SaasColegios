import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsEnum,
  IsNumber,
  IsDateString,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EvaluationType, AttendanceStatus } from '@cole/database';

export class CreateCurricularAreaDto {
  @ApiProperty({ example: 'level-uuid' })
  @IsString()
  @IsNotEmpty()
  levelId!: string;

  @ApiProperty({ example: 'Matemática' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'AREA-MAT' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsInt()
  @IsOptional()
  order?: number;
}

export class CreateCourseDto {
  @ApiProperty({ example: 'area-uuid' })
  @IsString()
  @IsNotEmpty()
  areaId!: string;

  @ApiProperty({ example: 'grade-uuid' })
  @IsString()
  @IsNotEmpty()
  gradeId!: string;

  @ApiProperty({ example: 'Álgebra y Aritmética' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'CUR-ALG-1' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiPropertyOptional({ example: 4, default: 4 })
  @IsInt()
  @IsOptional()
  hoursPerWeek?: number;
}

export class AssignTeacherToSectionDto {
  @ApiProperty({ example: 'course-uuid' })
  @IsString()
  @IsNotEmpty()
  courseId!: string;

  @ApiProperty({ example: 'section-uuid' })
  @IsString()
  @IsNotEmpty()
  sectionId!: string;

  @ApiPropertyOptional({ example: 'teacher-user-uuid' })
  @IsString()
  @IsOptional()
  teacherId?: string;
}

export class CreateEvaluationDto {
  @ApiProperty({ example: 'course-section-uuid' })
  @IsString()
  @IsNotEmpty()
  courseSectionId!: string;

  @ApiProperty({ example: 'academic-period-uuid' })
  @IsString()
  @IsNotEmpty()
  academicPeriodId!: string;

  @ApiProperty({ example: 'Examen Parcial I Bimestre' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ enum: EvaluationType, default: EvaluationType.EXAM })
  @IsEnum(EvaluationType)
  type!: EvaluationType;

  @ApiPropertyOptional({ example: 1.0, default: 1.0 })
  @IsNumber()
  @IsOptional()
  weight?: number;

  @ApiPropertyOptional({ example: 20.0, default: 20.0 })
  @IsNumber()
  @IsOptional()
  maxScore?: number;

  @ApiProperty({ example: '2026-04-15T00:00:00.000Z' })
  @IsDateString()
  evaluationDate!: string;
}

export class SubmitStudentGradeItemDto {
  @ApiProperty({ example: 'student-uuid' })
  @IsString()
  @IsNotEmpty()
  studentId!: string;

  @ApiProperty({ example: 18.5 })
  @IsNumber()
  score!: number;

  @ApiPropertyOptional({ example: 'AD' })
  @IsString()
  @IsOptional()
  letterScore?: string;

  @ApiPropertyOptional({ example: 'Excelente dominio del álgebra lineal' })
  @IsString()
  @IsOptional()
  feedback?: string;
}

export class SubmitGradesDto {
  @ApiProperty({ example: 'evaluation-uuid' })
  @IsString()
  @IsNotEmpty()
  evaluationId!: string;

  @ApiProperty({ example: 'academic-period-uuid' })
  @IsString()
  @IsNotEmpty()
  academicPeriodId!: string;

  @ApiProperty({ type: [SubmitStudentGradeItemDto] })
  @IsArray()
  grades!: SubmitStudentGradeItemDto[];
}

export class RecordDailyAttendanceItemDto {
  @ApiProperty({ example: 'student-uuid' })
  @IsString()
  @IsNotEmpty()
  studentId!: string;

  @ApiProperty({ enum: AttendanceStatus, default: AttendanceStatus.PRESENT })
  @IsEnum(AttendanceStatus)
  status!: AttendanceStatus;

  @ApiPropertyOptional({ example: 'Llegó 10 min tarde' })
  @IsString()
  @IsOptional()
  remarks?: string;
}

export class RecordDailyAttendanceDto {
  @ApiProperty({ example: 'section-uuid' })
  @IsString()
  @IsNotEmpty()
  sectionId!: string;

  @ApiProperty({ example: 'academic-period-uuid' })
  @IsString()
  @IsNotEmpty()
  academicPeriodId!: string;

  @ApiProperty({ example: '2026-04-15' })
  @IsString()
  @IsNotEmpty()
  date!: string;

  @ApiProperty({ type: [RecordDailyAttendanceItemDto] })
  @IsArray()
  records!: RecordDailyAttendanceItemDto[];
}

/* ────────────────────────────────────────────────────────────
   CONFIGURABLE SCALE & EVALUATION ENGINE DTOS
   ──────────────────────────────────────────────────────────── */

export class CreateEvaluationScaleItemDto {
  @ApiProperty({ example: 'AD' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ example: 'Logro destacado' })
  @IsString()
  @IsNotEmpty()
  label!: string;

  @ApiPropertyOptional({ example: 'Evidencia un nivel superior a lo esperado' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 18.0 })
  @IsNumber()
  @IsOptional()
  numericMin?: number;

  @ApiPropertyOptional({ example: 20.0 })
  @IsNumber()
  @IsOptional()
  numericMax?: number;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsInt()
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({ example: '#10b981' })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  isPassing?: boolean;
}

export class CreateEvaluationScaleDto {
  @ApiProperty({ example: 'SCALE-CNEB-2026' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ example: 'Escala CNEB Oficial (AD/A/B/C)' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'LITERAL', enum: ['LITERAL', 'NUMERIC', 'PERCENTAGE', 'POINTS', 'CUSTOM'] })
  @IsString()
  @IsNotEmpty()
  type!: 'LITERAL' | 'NUMERIC' | 'PERCENTAGE' | 'POINTS' | 'CUSTOM';

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @IsOptional()
  minValue?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsNumber()
  @IsOptional()
  maxValue?: number;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsInt()
  @IsOptional()
  decimalPlaces?: number;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  isDefault?: boolean;

  @ApiPropertyOptional({ type: [CreateEvaluationScaleItemDto] })
  @IsArray()
  @IsOptional()
  items?: CreateEvaluationScaleItemDto[];
}

export class CreateCompetencyDto {
  @ApiPropertyOptional({ example: 'area-uuid' })
  @IsString()
  @IsOptional()
  areaId?: string;

  @ApiPropertyOptional({ example: 'course-uuid' })
  @IsString()
  @IsOptional()
  courseId?: string;

  @ApiProperty({ example: 'COMP-MAT-01' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ example: 'Resuelve problemas de cantidad' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'Traduce cantidades a expresiones numéricas...' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsInt()
  @IsOptional()
  order?: number;
}

export class SubmitDescriptiveConclusionDto {
  @ApiProperty({ example: 'student-uuid' })
  @IsString()
  @IsNotEmpty()
  studentId!: string;

  @ApiProperty({ example: 'competency-uuid' })
  @IsString()
  @IsNotEmpty()
  competencyId!: string;

  @ApiProperty({ example: 'academic-period-uuid' })
  @IsString()
  @IsNotEmpty()
  periodId!: string;

  @ApiProperty({ example: 'teacher-uuid' })
  @IsString()
  @IsNotEmpty()
  teacherId!: string;

  @ApiProperty({ example: 'El estudiante resuelve problemas utilizando estrategias eficientes y argumenta sus procedimientos.' })
  @IsString()
  @IsNotEmpty()
  text!: string;
}

export class CreateMockExamDto {
  @ApiProperty({ example: 'Simulacro Dominical N° 4 - Tipo San Marcos' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'SIM-2026-UNMSM-04' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ example: '2026-04-19T08:00:00.000Z' })
  @IsDateString()
  examDate!: string;

  @ApiPropertyOptional({ example: 180, default: 180 })
  @IsInt()
  @IsOptional()
  durationMinutes?: number;

  @ApiPropertyOptional({ example: 100, default: 100 })
  @IsInt()
  @IsOptional()
  totalQuestions?: number;

  @ApiPropertyOptional({ example: 20.0, default: 20.0 })
  @IsNumber()
  @IsOptional()
  correctPoints?: number;

  @ApiPropertyOptional({ example: -1.125, default: -1.125 })
  @IsNumber()
  @IsOptional()
  incorrectPenalty?: number;

  @ApiPropertyOptional({ example: 0.0, default: 0.0 })
  @IsNumber()
  @IsOptional()
  blankPoints?: number;

  @ApiPropertyOptional({ example: 2000.0, default: 2000.0 })
  @IsNumber()
  @IsOptional()
  maxScore?: number;

  @ApiProperty({ example: 'academic-period-uuid' })
  @IsString()
  @IsNotEmpty()
  academicPeriodId!: string;
}

export class SubmitMockExamResultItemDto {
  @ApiProperty({ example: 'student-uuid' })
  @IsString()
  @IsNotEmpty()
  studentId!: string;

  @ApiProperty({ example: 74 })
  @IsInt()
  correctAnswers!: number;

  @ApiProperty({ example: 16 })
  @IsInt()
  incorrectAnswers!: number;

  @ApiProperty({ example: 10 })
  @IsInt()
  unanswered!: number;

  @ApiPropertyOptional({ example: 'Ingeniería de Sistemas' })
  @IsString()
  @IsOptional()
  careerTrack?: string;
}

export class SubmitMockExamResultsDto {
  @ApiProperty({ example: 'mock-exam-uuid' })
  @IsString()
  @IsNotEmpty()
  mockExamId!: string;

  @ApiProperty({ type: [SubmitMockExamResultItemDto] })
  @IsArray()
  results!: SubmitMockExamResultItemDto[];
}

export class LockAcademicPeriodDto {
  @ApiProperty({ example: 'academic-period-uuid' })
  @IsString()
  @IsNotEmpty()
  academicPeriodId!: string;

  @ApiProperty({ example: 'LOCKED', enum: ['DRAFT', 'OPEN', 'CLOSED', 'LOCKED'] })
  @IsString()
  @IsNotEmpty()
  status!: 'DRAFT' | 'OPEN' | 'CLOSED' | 'LOCKED';

  @ApiPropertyOptional({ example: 'Cierre oficial y generación de actas SIAGIE' })
  @IsString()
  @IsOptional()
  reason?: string;
}

