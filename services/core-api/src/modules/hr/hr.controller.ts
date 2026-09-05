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
import { HRService } from './hr.service';
import {
  CreateEmployeeDto,
  CreateContractDto,
  RecordWorkAttendanceDto,
} from './dto/hr.dto';
import { AuthGuard } from '../identity/guards/auth.guard';
import { PermissionGuard } from '../identity/guards/permission.guard';
import { RequirePermission, CurrentUser } from '../identity/decorators/auth.decorators';
import { Permissions, AuthenticatedUser } from '@cole/domain-types';
import { EmployeeStatus } from '@cole/database';

@ApiTags('Human Resources')
@ApiBearerAuth()
@Controller('hr')
@UseGuards(AuthGuard, PermissionGuard)
export class HRController {
  constructor(private readonly hrService: HRService) {}

  private extractTenantId(user: AuthenticatedUser): string {
    if (!user.tenantId) {
      throw new ForbiddenException('Tenant context is required for HR operations');
    }
    return user.tenantId;
  }

  @Post('employees')
  @RequirePermission(Permissions.HR_EMPLOYEES_MANAGE)
  @ApiOperation({ summary: 'Register new school staff/teacher record (Emits EmployeeHired.v1)' })
  createEmployee(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateEmployeeDto
  ) {
    return this.hrService.createEmployee(this.extractTenantId(user), dto);
  }

  @Get('employees')
  @RequirePermission(Permissions.HR_EMPLOYEES_MANAGE)
  @ApiQuery({ name: 'status', enum: EmployeeStatus, required: false })
  @ApiOperation({ summary: 'List school employees and teachers' })
  getEmployees(
    @CurrentUser() user: AuthenticatedUser,
    @Query('status') status?: EmployeeStatus
  ) {
    return this.hrService.getEmployees(this.extractTenantId(user), status);
  }

  @Get('employees/:id')
  @RequirePermission(Permissions.HR_EMPLOYEES_MANAGE)
  @ApiOperation({ summary: 'Get full employee profile, contracts and attendance history' })
  getEmployeeById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string
  ) {
    return this.hrService.getEmployeeById(this.extractTenantId(user), id);
  }

  @Post('contracts')
  @RequirePermission(Permissions.HR_EMPLOYEES_MANAGE)
  @ApiOperation({ summary: 'Create an employment contract for staff' })
  createContract(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateContractDto
  ) {
    return this.hrService.createContract(this.extractTenantId(user), dto);
  }

  @Post('attendance')
  @RequirePermission(Permissions.HR_ATTENDANCE_MANAGE)
  @ApiOperation({ summary: 'Record staff biometric / daily work attendance and punctuality' })
  recordAttendance(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RecordWorkAttendanceDto
  ) {
    return this.hrService.recordWorkAttendance(this.extractTenantId(user), dto);
  }

  @Get('attendance')
  @RequirePermission(Permissions.HR_ATTENDANCE_MANAGE)
  @ApiQuery({ name: 'date', required: false })
  @ApiOperation({ summary: 'Get staff daily attendance report' })
  getAttendance(
    @CurrentUser() user: AuthenticatedUser,
    @Query('date') date?: string
  ) {
    return this.hrService.getWorkAttendanceReport(this.extractTenantId(user), date);
  }
}
