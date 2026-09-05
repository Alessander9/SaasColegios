import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ActivityService } from './activity.service';
import {
  CreateActivityDto,
  RegisterToActivityDto,
  RecordActivityAttendanceDto,
} from './dto/activity.dto';
import { AuthGuard } from '../identity/guards/auth.guard';
import { PermissionGuard } from '../identity/guards/permission.guard';
import { RequirePermission, CurrentUser } from '../identity/decorators/auth.decorators';
import { Permissions, AuthenticatedUser } from '@cole/domain-types';

@ApiTags('Activities & Workshops')
@ApiBearerAuth()
@Controller('activities')
@UseGuards(AuthGuard, PermissionGuard)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  private extractTenantId(user: AuthenticatedUser): string {
    if (!user.tenantId) {
      throw new ForbiddenException('Tenant context is required for activity operations');
    }
    return user.tenantId;
  }

  @Post()
  @RequirePermission(Permissions.ACTIVITIES_MANAGE)
  @ApiOperation({ summary: 'Create a school activity/workshop (Emits ActivityCreated.v1)' })
  createActivity(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateActivityDto
  ) {
    return this.activityService.createActivity(this.extractTenantId(user), dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all open activities and workshops in the school' })
  getActivities(@CurrentUser() user: AuthenticatedUser) {
    return this.activityService.getActivities(this.extractTenantId(user));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get activity details with registration list and consent forms' })
  getActivityById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string
  ) {
    return this.activityService.getActivityById(this.extractTenantId(user), id);
  }

  @Post('register')
  @ApiOperation({
    summary: 'Register student to activity with parental digital consent & payment processing',
  })
  registerToActivity(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RegisterToActivityDto,
    @Req() req: any
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    return this.activityService.registerToActivity(this.extractTenantId(user), dto, ipAddress);
  }

  @Post('registrations/:id/attendance')
  @RequirePermission(Permissions.ACTIVITIES_MANAGE)
  @ApiOperation({ summary: 'Record participant attendance check-in on event day' })
  recordAttendance(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') registrationId: string,
    @Body() dto: RecordActivityAttendanceDto
  ) {
    return this.activityService.recordAttendance(
      this.extractTenantId(user),
      registrationId,
      dto
    );
  }
}
