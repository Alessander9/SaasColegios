import {
  Controller,
  Get,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportingService } from './reporting.service';
import { AuthGuard } from '../identity/guards/auth.guard';
import { PermissionGuard } from '../identity/guards/permission.guard';
import { RequirePermission, CurrentUser } from '../identity/decorators/auth.decorators';
import { Permissions, AuthenticatedUser } from '@cole/domain-types';

@ApiTags('Reporting & BI')
@ApiBearerAuth()
@Controller('reporting')
@UseGuards(AuthGuard, PermissionGuard)
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  private extractTenantId(user: AuthenticatedUser): string {
    if (!user.tenantId) {
      throw new ForbiddenException('Tenant context is required for reporting operations');
    }
    return user.tenantId;
  }

  // ================================================================
  // PLATFORM ANALYTICS (SUPER ADMIN)
  // ================================================================

  @Get('platform/overview')
  @RequirePermission(Permissions.PLATFORM_METRICS_VIEW)
  @ApiOperation({
    summary: 'Platform-wide analytics: MRR, ARR, tenant counts, revenue and plan distribution',
  })
  getPlatformOverview() {
    return this.reportingService.getPlatformOverview();
  }

  @Get('platform/growth')
  @RequirePermission(Permissions.PLATFORM_METRICS_VIEW)
  @ApiOperation({
    summary: 'Tenant and student growth timeline for the last 12 months',
  })
  getTenantGrowthTimeline() {
    return this.reportingService.getTenantGrowthTimeline();
  }

  @Get('platform/modules')
  @RequirePermission(Permissions.PLATFORM_METRICS_VIEW)
  @ApiOperation({
    summary: 'Module usage statistics across all tenants',
  })
  getModuleUsage() {
    return this.reportingService.getModuleUsage();
  }

  // ================================================================
  // SCHOOL-LEVEL REPORTS
  // ================================================================

  @Get('school/overview')
  @RequirePermission(Permissions.REPORTING_VIEW)
  @ApiOperation({
    summary: 'School overview KPIs: students, finances, staff, activities',
  })
  getSchoolOverview(
    @CurrentUser() user: AuthenticatedUser,
    @Query('academicYearId') academicYearId?: string,
  ) {
    return this.reportingService.getSchoolOverview(
      this.extractTenantId(user),
      academicYearId,
    );
  }

  @Get('school/financial')
  @RequirePermission(Permissions.REPORTING_VIEW)
  @ApiOperation({
    summary: 'Financial report: charges by status, payments by method, overdue debt, monthly collection trend',
  })
  getFinancialReport(
    @CurrentUser() user: AuthenticatedUser,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportingService.getFinancialReport(
      this.extractTenantId(user),
      startDate,
      endDate,
    );
  }

  @Get('school/academic')
  @RequirePermission(Permissions.REPORTING_VIEW)
  @ApiOperation({
    summary: 'Academic performance report: GPA by course, grade distribution, overall GPA',
  })
  getAcademicReport(
    @CurrentUser() user: AuthenticatedUser,
    @Query('academicYearId') academicYearId?: string,
    @Query('gradeId') gradeId?: string,
  ) {
    return this.reportingService.getAcademicReport(
      this.extractTenantId(user),
      academicYearId,
      gradeId,
    );
  }

  @Get('school/attendance')
  @RequirePermission(Permissions.REPORTING_VIEW)
  @ApiOperation({
    summary: 'Student attendance report: present/absent/tardy/excused distribution and attendance rate',
  })
  getAttendanceReport(
    @CurrentUser() user: AuthenticatedUser,
    @Query('academicYearId') academicYearId?: string,
    @Query('sectionId') sectionId?: string,
  ) {
    return this.reportingService.getAttendanceReport(
      this.extractTenantId(user),
      academicYearId,
      sectionId,
    );
  }

  @Get('school/commerce')
  @RequirePermission(Permissions.REPORTING_VIEW)
  @ApiOperation({
    summary: 'Commerce report: orders by status, revenue, top selling products',
  })
  getCommerceReport(
    @CurrentUser() user: AuthenticatedUser,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportingService.getCommerceReport(
      this.extractTenantId(user),
      startDate,
      endDate,
    );
  }

  @Get('school/activities')
  @RequirePermission(Permissions.REPORTING_VIEW)
  @ApiOperation({
    summary: 'Activities report: registrations, participation rate, attendance stats',
  })
  getActivityReport(
    @CurrentUser() user: AuthenticatedUser,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportingService.getActivityReport(
      this.extractTenantId(user),
      startDate,
      endDate,
    );
  }

  @Get('school/staff')
  @RequirePermission(Permissions.REPORTING_VIEW)
  @ApiOperation({
    summary: 'Staff and HR report: employees by type/status, punctuality, last payroll summary',
  })
  getStaffReport(@CurrentUser() user: AuthenticatedUser) {
    return this.reportingService.getStaffReport(this.extractTenantId(user));
  }

  // ================================================================
  // EXPORT ENDPOINTS (CSV / Excel data)
  // ================================================================

  @Get('export/students')
  @RequirePermission(Permissions.REPORTING_VIEW)
  @ApiOperation({ summary: 'Export students directory as tabular data for CSV/Excel' })
  exportStudents(@CurrentUser() user: AuthenticatedUser) {
    return this.reportingService.exportStudents(this.extractTenantId(user));
  }

  @Get('export/payments')
  @RequirePermission(Permissions.REPORTING_VIEW)
  @ApiOperation({ summary: 'Export payment history as tabular data for CSV/Excel' })
  exportPayments(
    @CurrentUser() user: AuthenticatedUser,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportingService.exportPayments(
      this.extractTenantId(user),
      startDate,
      endDate,
    );
  }

  @Get('export/grades')
  @RequirePermission(Permissions.REPORTING_VIEW)
  @ApiOperation({ summary: 'Export published grades as tabular data for CSV/Excel' })
  exportGrades(
    @CurrentUser() user: AuthenticatedUser,
    @Query('academicYearId') academicYearId?: string,
  ) {
    return this.reportingService.exportGrades(
      this.extractTenantId(user),
      academicYearId,
    );
  }

  @Get('export/attendance')
  @RequirePermission(Permissions.REPORTING_VIEW)
  @ApiOperation({ summary: 'Export attendance records as tabular data for CSV/Excel' })
  exportAttendance(
    @CurrentUser() user: AuthenticatedUser,
    @Query('sectionId') sectionId?: string,
  ) {
    return this.reportingService.exportAttendance(
      this.extractTenantId(user),
      sectionId,
    );
  }
}
