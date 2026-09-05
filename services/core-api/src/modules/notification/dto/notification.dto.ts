import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP',
}

export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  READ = 'READ',
}

export class SendNotificationDto {
  @ApiProperty({ example: 'user-uuid' })
  @IsString()
  @IsNotEmpty()
  recipientId!: string;

  @ApiProperty({ enum: NotificationChannel, default: NotificationChannel.EMAIL })
  @IsEnum(NotificationChannel)
  channel!: NotificationChannel;

  @ApiProperty({ example: 'Recordatorio de pensión pendiente' })
  @IsString()
  @IsNotEmpty()
  subject!: string;

  @ApiProperty({ example: 'Estimado padre de familia, le recordimos que tiene una pensión pendiente de S/ 450.00...' })
  @IsString()
  @IsNotEmpty()
  body!: string;

  @ApiPropertyOptional({ example: 'pension-reminder' })
  @IsString()
  @IsOptional()
  templateKey?: string;

  @ApiPropertyOptional({ example: { amount: 450.00, dueDate: '2026-04-15', studentName: 'Mateo García' } })
  @IsOptional()
  templateData?: Record<string, unknown>;

  @ApiPropertyOptional({ enum: NotificationPriority, default: NotificationPriority.NORMAL })
  @IsEnum(NotificationPriority)
  @IsOptional()
  priority?: NotificationPriority;

  @ApiPropertyOptional({ example: 'finance' })
  @IsString()
  @IsOptional()
  category?: string;
}

export class SendBulkNotificationDto {
  @ApiProperty({ type: [String], example: ['user-uuid-1', 'user-uuid-2'] })
  @IsArray()
  @IsString({ each: true })
  recipientIds!: string[];

  @ApiProperty({ enum: NotificationChannel, default: NotificationChannel.EMAIL })
  @IsEnum(NotificationChannel)
  channel!: NotificationChannel;

  @ApiProperty({ example: 'Comunicado institucional' })
  @IsString()
  @IsNotEmpty()
  subject!: string;

  @ApiProperty({ example: 'Estimados padres de familia, les informamos que el día lunes 28 de abril no habrá clases...' })
  @IsString()
  @IsNotEmpty()
  body!: string;

  @ApiPropertyOptional({ enum: NotificationPriority, default: NotificationPriority.NORMAL })
  @IsEnum(NotificationPriority)
  @IsOptional()
  priority?: NotificationPriority;

  @ApiPropertyOptional({ example: 'institutional' })
  @IsString()
  @IsOptional()
  category?: string;
}

export class NotificationFilterDto {
  @ApiPropertyOptional({ enum: NotificationChannel })
  @IsEnum(NotificationChannel)
  @IsOptional()
  channel?: NotificationChannel;

  @ApiPropertyOptional({ enum: NotificationStatus })
  @IsEnum(NotificationStatus)
  @IsOptional()
  status?: NotificationStatus;

  @ApiPropertyOptional({ example: 'finance' })
  @IsString()
  @IsOptional()
  category?: string;
}
