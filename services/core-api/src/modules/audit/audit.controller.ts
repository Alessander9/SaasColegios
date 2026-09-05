import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { AuthGuard } from '../identity/guards/auth.guard';
import { PermissionGuard } from '../identity/guards/permission.guard';
import { RequirePermission, CurrentUser } from '../identity/decorators/auth.decorators';
import { Permissions, AuthenticatedUser } from '@cole/domain-types';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@Controller('audit')
@UseGuards(AuthGuard, PermissionGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  private extractTenantId(user: AuthenticatedUser): string {
    if (!user.tenantId) {
      throw new ForbiddenException('Tenant context is required for audit operations');
    }
    return user.tenantId;
  }

  @Get('logs')
  @RequirePermission(Permissions.AUDIT_VIEW)
  @ApiOperation({ summary: 'Query audit logs with filters, pagination and date range' })
  @ApiQuery({ name: 'resource', required: false })
  @ApiQuery({ name: 'actorId', required: false })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getAuditLogs(
    @CurrentUser() user: AuthenticatedUser,
    @Query('resource') resource?: string,
    @Query('actorId') actorId?: string,
    @Query('action') action?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditService.getAuditLogs(
      this.extractTenantId(user),
      { resource, actorId, action, startDate, endDate },
      { page: page ? parseInt(page, 10) : 1, limit: limit ? parseInt(limit, 10) : 50 },
    );
  }

  @Get('logs/:id')
  @RequirePermission(Permissions.AUDIT_VIEW)
  @ApiOperation({ summary: 'Get a single audit log entry by ID' })
  getAuditLogById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.auditService.getAuditLogById(this.extractTenantId(user), id);
  }

  @Get('resource/:resource/:resourceId')
  @RequirePermission(Permissions.AUDIT_VIEW)
  @ApiOperation({ summary: 'Get full audit history for a specific resource' })
  getResourceHistory(
    @CurrentUser() user: AuthenticatedUser,
    @Param('resource') resource: string,
    @Param('resourceId') resourceId: string,
  ) {
    return this.auditService.getResourceHistory(
      this.extractTenantId(user),
      resource,
      resourceId,
    );
  }

  @Get('actor/:actorId')
  @RequirePermission(Permissions.AUDIT_VIEW)
  @ApiOperation({ summary: 'Get activity history for a specific user/actor' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  getActorActivity(
    @CurrentUser() user: AuthenticatedUser,
    @Param('actorId') actorId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.auditService.getActorActivity(
      this.extractTenantId(user),
      actorId,
      { startDate, endDate },
    );
  }

  @Get('stats')
  @RequirePermission(Permissions.AUDIT_VIEW)
  @ApiOperation({ summary: 'Get audit log statistics: by resource, top actions, top actors' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  getAuditStats(
    @CurrentUser() user: AuthenticatedUser,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.auditService.getAuditStats(this.extractTenantId(user), startDate, endDate);
  }
}
