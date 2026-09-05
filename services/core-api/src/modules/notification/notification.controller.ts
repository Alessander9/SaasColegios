import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import {
  SendNotificationDto,
  SendBulkNotificationDto,
  NotificationChannel,
  NotificationStatus,
} from './dto/notification.dto';
import { AuthGuard } from '../identity/guards/auth.guard';
import { PermissionGuard } from '../identity/guards/permission.guard';
import { RequirePermission, CurrentUser } from '../identity/decorators/auth.decorators';
import { Permissions, AuthenticatedUser } from '@cole/domain-types';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(AuthGuard, PermissionGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  private extractTenantId(user: AuthenticatedUser): string {
    if (!user.tenantId) {
      throw new ForbiddenException('Tenant context is required for notification operations');
    }
    return user.tenantId;
  }

  @Post('send')
  @RequirePermission(Permissions.SCHOOL_CONFIG_UPDATE)
  @ApiOperation({ summary: 'Send a single notification to a user (email, SMS, push, or in-app)' })
  sendNotification(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SendNotificationDto,
  ) {
    return this.notificationService.sendNotification(this.extractTenantId(user), dto);
  }

  @Post('send-bulk')
  @RequirePermission(Permissions.SCHOOL_CONFIG_UPDATE)
  @ApiOperation({ summary: 'Send bulk notifications to multiple recipients' })
  sendBulkNotification(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SendBulkNotificationDto,
  ) {
    return this.notificationService.sendBulkNotification(this.extractTenantId(user), dto);
  }

  @Get('my')
  @RequirePermission(Permissions.SCHOOL_CONFIG_VIEW)
  @ApiOperation({ summary: 'Get current user notifications with optional filters' })
  @ApiQuery({ name: 'channel', enum: NotificationChannel, required: false })
  @ApiQuery({ name: 'status', enum: NotificationStatus, required: false })
  @ApiQuery({ name: 'category', required: false })
  getMyNotifications(
    @CurrentUser() user: AuthenticatedUser,
    @Query('channel') channel?: NotificationChannel,
    @Query('status') status?: NotificationStatus,
    @Query('category') category?: string,
  ) {
    return this.notificationService.getNotifications(
      this.extractTenantId(user),
      user.id,
      { channel, status, category },
    );
  }

  @Get('my/unread-count')
  @RequirePermission(Permissions.SCHOOL_CONFIG_VIEW)
  @ApiOperation({ summary: 'Get unread notification count for current user' })
  getUnreadCount(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationService.getUnreadCount(this.extractTenantId(user), user.id);
  }

  @Get('stats')
  @RequirePermission(Permissions.REPORTING_VIEW)
  @ApiOperation({ summary: 'Get notification delivery statistics for the school' })
  getStats(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationService.getNotificationStats(this.extractTenantId(user));
  }

  @Post(':id/read')
  @RequirePermission(Permissions.SCHOOL_CONFIG_VIEW)
  @ApiOperation({ summary: 'Mark a notification as read' })
  markAsRead(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.notificationService.markAsRead(this.extractTenantId(user), id);
  }
}
