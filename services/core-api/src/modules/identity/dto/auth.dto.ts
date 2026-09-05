import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({ example: 'director@sanjose.edu.pe' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SecretP@ssw0rd123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'Carlos' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ example: 'Mendoza' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiPropertyOptional({ example: 'tenant-uuid-here' })
  @IsString()
  @IsOptional()
  tenantId?: string;

  @ApiPropertyOptional({ example: ['DIRECTOR'] })
  @IsArray()
  @IsOptional()
  roles?: string[];
}

export class LoginDto {
  @ApiProperty({ example: 'director@sanjose.edu.pe' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SecretP@ssw0rd123' })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiPropertyOptional({ example: 'tenant-uuid-here', description: 'Target school tenant ID' })
  @IsString()
  @IsOptional()
  tenantId?: string;
}

export class ImpersonateDto {
  @ApiProperty({ example: 'target-user-uuid', description: 'Target user ID to impersonate' })
  @IsString()
  @IsNotEmpty()
  targetUserId!: string;

  @ApiProperty({ example: 'tenant-uuid', description: 'Target school tenant ID' })
  @IsString()
  @IsNotEmpty()
  tenantId!: string;

  @ApiProperty({ example: 'Debugging academic grade calculation issue reported in ticket #402' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}
