import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TenantStatus } from '@cole/database';

export class CreateTenantDto {
  @ApiProperty({ example: 'colegio-san-jose', description: 'Unique slug for the school tenant' })
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiProperty({ example: 'Colegio San José', description: 'Full commercial / institutional name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'sanjose', description: 'Subdomain for the school (e.g. sanjose.cole.app)' })
  @IsString()
  @IsNotEmpty()
  subdomain!: string;

  @ApiPropertyOptional({ example: 'portal.colegiosanjose.edu.pe', description: 'Custom domain' })
  @IsString()
  @IsOptional()
  customDomain?: string;

  @ApiProperty({ example: 'plan-pro-id', description: 'ID of the commercial plan assigned' })
  @IsString()
  @IsNotEmpty()
  planId!: string;

  @ApiPropertyOptional({ enum: TenantStatus, default: TenantStatus.ACTIVE })
  @IsEnum(TenantStatus)
  @IsOptional()
  status?: TenantStatus;
}

export class UpdateTenantDto {
  @ApiPropertyOptional({ example: 'Colegio San José Updated' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'portal.colegiosanjose.edu.pe' })
  @IsString()
  @IsOptional()
  customDomain?: string;

  @ApiPropertyOptional({ enum: TenantStatus })
  @IsEnum(TenantStatus)
  @IsOptional()
  status?: TenantStatus;

  @ApiPropertyOptional({ example: 'plan-enterprise-id' })
  @IsString()
  @IsOptional()
  planId?: string;
}
