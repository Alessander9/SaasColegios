import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum ReportPeriod {
  CURRENT_MONTH = 'CURRENT_MONTH',
  CURRENT_QUARTER = 'CURRENT_QUARTER',
  CURRENT_YEAR = 'CURRENT_YEAR',
  CUSTOM = 'CUSTOM',
}

export enum AcademicReportScope {
  OVERALL = 'OVERALL',
  BY_GRADE = 'BY_GRADE',
  BY_COURSE = 'BY_COURSE',
}

export class PlatformAnalyticsDto {
  @ApiPropertyOptional({ description: 'Filter by subscription status' })
  @IsString()
  @IsOptional()
  subscriptionStatus?: string;
}

export class SchoolReportDto {
  @ApiPropertyOptional({ enum: ReportPeriod, default: ReportPeriod.CURRENT_MONTH })
  @IsEnum(ReportPeriod)
  @IsOptional()
  period?: ReportPeriod;

  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ example: 'academic-year-uuid' })
  @IsString()
  @IsOptional()
  academicYearId?: string;
}

export class FinancialReportDto extends SchoolReportDto {
  @ApiPropertyOptional({ example: 'concept-uuid' })
  @IsString()
  @IsOptional()
  conceptId?: string;
}

export class AcademicReportDto extends SchoolReportDto {
  @ApiPropertyOptional({ enum: AcademicReportScope, default: AcademicReportScope.OVERALL })
  @IsEnum(AcademicReportScope)
  @IsOptional()
  scope?: AcademicReportScope;

  @ApiPropertyOptional({ example: 'grade-level-uuid' })
  @IsString()
  @IsOptional()
  gradeId?: string;
}

export class AttendanceReportDto extends SchoolReportDto {
  @ApiPropertyOptional({ example: 'section-uuid' })
  @IsString()
  @IsOptional()
  sectionId?: string;
}

export class CommerceReportDto extends SchoolReportDto {
  @ApiPropertyOptional({ example: 'category-uuid' })
  @IsString()
  @IsOptional()
  categoryId?: string;
}

export class ExportReportDto {
  @ApiPropertyOptional({ enum: ['csv', 'xlsx', 'pdf'], default: 'csv' })
  @IsString()
  @IsOptional()
  format?: string;

  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}
