import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsEnum,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StudentStatus, RelationshipType } from '@cole/database';

export class CreateStudentDto {
  @ApiProperty({ example: 'ALU-2026-001' })
  @IsString()
  @IsNotEmpty()
  studentCode!: string;

  @ApiPropertyOptional({ example: 'DNI', default: 'DNI' })
  @IsString()
  @IsOptional()
  documentType?: string;

  @ApiProperty({ example: '72819203' })
  @IsString()
  @IsNotEmpty()
  documentNumber!: string;

  @ApiProperty({ example: 'Mateo' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ example: 'García Morales' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiPropertyOptional({ example: '2015-05-14T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  birthDate?: string;

  @ApiPropertyOptional({ example: 'M' })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({ example: 'mateo.garcia@estudiante.sanjose.edu.pe' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+51 987-654-321' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Av. Arequipa 1234, Lima' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ enum: StudentStatus, default: StudentStatus.ACTIVE })
  @IsEnum(StudentStatus)
  @IsOptional()
  status?: StudentStatus;
}

export class CreateGuardianDto {
  @ApiPropertyOptional({ example: 'DNI', default: 'DNI' })
  @IsString()
  @IsOptional()
  documentType?: string;

  @ApiProperty({ example: '10928374' })
  @IsString()
  @IsNotEmpty()
  documentNumber!: string;

  @ApiProperty({ example: 'Roberto' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ example: 'García Vargas' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({ enum: RelationshipType, default: RelationshipType.FATHER })
  @IsEnum(RelationshipType)
  relationship!: RelationshipType;

  @ApiPropertyOptional({ example: 'roberto.garcia@gmail.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '+51 999-888-777' })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiPropertyOptional({ example: 'Av. Arequipa 1234, Lima' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isEmergencyContact?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isFinancialResponsible?: boolean;
}

export class LinkGuardianDto {
  @ApiProperty({ example: 'guardian-uuid' })
  @IsString()
  @IsNotEmpty()
  guardianId!: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}
