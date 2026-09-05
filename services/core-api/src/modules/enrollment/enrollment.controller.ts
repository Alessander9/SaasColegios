import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EnrollmentService } from './enrollment.service';
import {
  CreateAdmissionApplicationDto,
  UpdateAdmissionStatusDto,
  EnrollStudentDto,
  TransitionEnrollmentStatusDto,
} from './dto/enrollment.dto';
import { AuthGuard } from '../identity/guards/auth.guard';
import { PermissionGuard } from '../identity/guards/permission.guard';
import { RequirePermission, CurrentUser } from '../identity/decorators/auth.decorators';
import { Permissions, AuthenticatedUser } from '@cole/domain-types';
import { AdmissionStatus } from '@cole/database';

@ApiTags('Enrollment & Admissions')
@ApiBearerAuth()
@Controller('enrollment')
@UseGuards(AuthGuard, PermissionGuard)
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  private extractTenantId(user: AuthenticatedUser): string {
    if (!user.tenantId) {
      throw new ForbiddenException('Tenant context is required for enrollment operations');
    }
    return user.tenantId;
  }

  // --------------------------------------------------
  // ADMISSIONS
  // --------------------------------------------------

  @Post('admissions')
  @RequirePermission(Permissions.ENROLLMENT_MANAGE)
  @ApiOperation({ summary: 'Submit a new student admission application' })
  createAdmission(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateAdmissionApplicationDto
  ) {
    return this.enrollmentService.createAdmissionApplication(this.extractTenantId(user), dto);
  }

  @Get('admissions')
  @RequirePermission(Permissions.ENROLLMENT_VIEW)
  @ApiQuery({ name: 'status', enum: AdmissionStatus, required: false })
  @ApiOperation({ summary: 'List admission applications by status' })
  getAdmissions(
    @CurrentUser() user: AuthenticatedUser,
    @Query('status') status?: AdmissionStatus
  ) {
    return this.enrollmentService.getAdmissions(this.extractTenantId(user), status);
  }

  @Patch('admissions/:id/status')
  @RequirePermission(Permissions.ENROLLMENT_APPROVE)
  @ApiOperation({ summary: 'Update admission application status (Approve, Reject, Score)' })
  updateAdmissionStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateAdmissionStatusDto
  ) {
    return this.enrollmentService.updateAdmissionStatus(this.extractTenantId(user), id, dto);
  }

  // --------------------------------------------------
  // FORMAL ENROLLMENT & STATE MACHINE
  // --------------------------------------------------

  @Post('enroll')
  @RequirePermission(Permissions.ENROLLMENT_MANAGE)
  @ApiOperation({
    summary: 'Formally enroll a student into an academic year, grade and section (Emits EnrollmentConfirmed.v1)',
  })
  enrollStudent(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: EnrollStudentDto
  ) {
    return this.enrollmentService.enrollStudent(this.extractTenantId(user), dto);
  }

  @Post('enrollments/:id/transition')
  @RequirePermission(Permissions.ENROLLMENT_MANAGE)
  @ApiOperation({
    summary: 'Transition digital enrollment state machine status (PENDING -> CONFIRMED -> GRADUATED/WITHDRAWN)',
  })
  transitionEnrollmentStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') enrollmentId: string,
    @Body() dto: TransitionEnrollmentStatusDto
  ) {
    return this.enrollmentService.transitionEnrollmentStatus(
      this.extractTenantId(user),
      enrollmentId,
      dto
    );
  }

  @Get('enrollments')
  @RequirePermission(Permissions.ENROLLMENT_VIEW)
  @ApiQuery({ name: 'academicYearId', required: false })
  @ApiOperation({ summary: 'List confirmed enrollments in the school' })
  getEnrollments(
    @CurrentUser() user: AuthenticatedUser,
    @Query('academicYearId') academicYearId?: string
  ) {
    return this.enrollmentService.getEnrollments(this.extractTenantId(user), academicYearId);
  }
}
