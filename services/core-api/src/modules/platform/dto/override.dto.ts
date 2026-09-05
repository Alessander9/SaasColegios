import { IsString, IsOptional, IsBoolean, IsInt, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SetTenantOverrideDto {
  @ApiPropertyOptional({ example: 'payroll', description: 'Feature to override' })
  @IsString()
  @IsOptional()
  featureKey?: string;

  @ApiPropertyOptional({ example: true, description: 'Force enable or disable feature' })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @ApiPropertyOptional({ example: 'students', description: 'Metric limit to override' })
  @IsString()
  @IsOptional()
  metricKey?: string;

  @ApiPropertyOptional({ example: 800, description: 'New custom limit value' })
  @IsInt()
  @IsOptional()
  limitValue?: number;

  @ApiPropertyOptional({ example: 'Special commercial agreement Q3' })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59.000Z' })
  @IsDateString()
  @IsOptional()
  expiresAt?: string;
}
