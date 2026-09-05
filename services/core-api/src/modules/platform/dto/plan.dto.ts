import { IsString, IsNotEmpty, IsOptional, IsInt, IsArray, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePlanDto {
  @ApiProperty({ example: 'PLAN_PRO', description: 'Unique code of the plan' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ example: 'Plan Profesional' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'Plan integral para colegios de hasta 500 alumnos' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 500, default: 100 })
  @IsInt()
  maxStudents!: number;

  @ApiProperty({ example: 50, default: 20 })
  @IsInt()
  maxTeachers!: number;

  @ApiProperty({ example: 50, default: 10 })
  @IsInt()
  maxStorageGb!: number;

  @ApiProperty({
    example: ['academic', 'enrollment', 'finance', 'commerce', 'notifications'],
    description: 'Array of FeatureKey strings included in this plan',
  })
  @IsArray()
  features!: string[];

  @ApiProperty({ example: 199.0, description: 'Monthly price in USD' })
  @IsNumber()
  monthlyPrice!: number;

  @ApiProperty({ example: 1990.0, description: 'Annual price in USD' })
  @IsNumber()
  annualPrice!: number;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
