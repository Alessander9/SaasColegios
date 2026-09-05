import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SchoolCoreService } from './school-core.service';
import {
  UpdateSchoolProfileDto,
  CreateCampusDto,
  CreateAcademicYearDto,
  CreateAcademicPeriodDto,
  CreateEducationalLevelDto,
  CreateGradeLevelDto,
  CreateSectionDto,
  CreateClassroomDto,
} from './dto/school-core.dto';
import { AuthGuard } from '../identity/guards/auth.guard';
import { PermissionGuard } from '../identity/guards/permission.guard';
import { RequirePermission, CurrentUser } from '../identity/decorators/auth.decorators';
import { Permissions, AuthenticatedUser } from '@cole/domain-types';

@ApiTags('School Core')
@ApiBearerAuth()
@Controller('school')
@UseGuards(AuthGuard, PermissionGuard)
export class SchoolCoreController {
  constructor(private readonly schoolCoreService: SchoolCoreService) {}

  private extractTenantId(user: AuthenticatedUser): string {
    if (!user.tenantId) {
      throw new ForbiddenException('Tenant context is required for school core operations');
    }
    return user.tenantId;
  }

  // --------------------------------------------------
  // INSTITUTIONAL PROFILE
  // --------------------------------------------------

  @Get('profile')
  @RequirePermission(Permissions.SCHOOL_CONFIG_VIEW)
  @ApiOperation({ summary: 'Get current school institutional profile and configuration' })
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.schoolCoreService.getProfile(this.extractTenantId(user));
  }

  @Put('profile')
  @RequirePermission(Permissions.SCHOOL_CONFIG_UPDATE)
  @ApiOperation({ summary: 'Update school legal information, branding and currency settings' })
  updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateSchoolProfileDto
  ) {
    return this.schoolCoreService.updateProfile(this.extractTenantId(user), dto);
  }

  // --------------------------------------------------
  // CAMPUSES & CAMPUS MANAGEMENT
  // --------------------------------------------------

  @Post('campuses')
  @RequirePermission(Permissions.SCHOOL_CAMPUS_MANAGE)
  @ApiOperation({ summary: 'Create a new campus/sede for the school' })
  createCampus(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCampusDto
  ) {
    return this.schoolCoreService.createCampus(this.extractTenantId(user), dto);
  }

  @Get('campuses')
  @RequirePermission(Permissions.SCHOOL_CONFIG_VIEW)
  @ApiOperation({ summary: 'List all active campuses in this school' })
  getCampuses(@CurrentUser() user: AuthenticatedUser) {
    return this.schoolCoreService.getCampuses(this.extractTenantId(user));
  }

  // --------------------------------------------------
  // ACADEMIC YEARS & PERIODS
  // --------------------------------------------------

  @Post('academic-years')
  @RequirePermission(Permissions.SCHOOL_PERIODS_MANAGE)
  @ApiOperation({ summary: 'Create a new academic school year (e.g. 2026)' })
  createAcademicYear(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateAcademicYearDto
  ) {
    return this.schoolCoreService.createAcademicYear(this.extractTenantId(user), dto);
  }

  @Get('academic-years')
  @RequirePermission(Permissions.SCHOOL_CONFIG_VIEW)
  @ApiOperation({ summary: 'List academic years and periods' })
  getAcademicYears(@CurrentUser() user: AuthenticatedUser) {
    return this.schoolCoreService.getAcademicYears(this.extractTenantId(user));
  }

  @Post('academic-periods')
  @RequirePermission(Permissions.SCHOOL_PERIODS_MANAGE)
  @ApiOperation({ summary: 'Create an academic period (Bimester, Trimester, etc.)' })
  createAcademicPeriod(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateAcademicPeriodDto
  ) {
    return this.schoolCoreService.createAcademicPeriod(this.extractTenantId(user), dto);
  }

  // --------------------------------------------------
  // EDUCATIONAL LEVELS & GRADES
  // --------------------------------------------------

  @Post('levels')
  @RequirePermission(Permissions.SCHOOL_CONFIG_UPDATE)
  @ApiOperation({ summary: 'Create educational level (e.g. Inicial, Primaria, Secundaria)' })
  createLevel(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateEducationalLevelDto
  ) {
    return this.schoolCoreService.createEducationalLevel(this.extractTenantId(user), dto);
  }

  @Get('levels')
  @RequirePermission(Permissions.SCHOOL_CONFIG_VIEW)
  @ApiOperation({ summary: 'Get educational hierarchy (Levels -> Grades -> Sections)' })
  getLevels(@CurrentUser() user: AuthenticatedUser) {
    return this.schoolCoreService.getEducationalLevels(this.extractTenantId(user));
  }

  @Post('grades')
  @RequirePermission(Permissions.SCHOOL_CONFIG_UPDATE)
  @ApiOperation({ summary: 'Create a grade level linked to an educational level' })
  createGrade(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateGradeLevelDto
  ) {
    return this.schoolCoreService.createGradeLevel(this.extractTenantId(user), dto);
  }

  // --------------------------------------------------
  // SECTIONS & CLASSROOMS
  // --------------------------------------------------

  @Post('sections')
  @RequirePermission(Permissions.SCHOOL_CONFIG_UPDATE)
  @ApiOperation({ summary: 'Create a class section for an academic year and grade' })
  createSection(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateSectionDto
  ) {
    return this.schoolCoreService.createSection(this.extractTenantId(user), dto);
  }

  @Get('sections')
  @RequirePermission(Permissions.SCHOOL_CONFIG_VIEW)
  @ApiQuery({ name: 'academicYearId', required: false })
  @ApiOperation({ summary: 'List sections with campus and grade info' })
  getSections(
    @CurrentUser() user: AuthenticatedUser,
    @Query('academicYearId') academicYearId?: string
  ) {
    return this.schoolCoreService.getSections(this.extractTenantId(user), academicYearId);
  }

  @Post('classrooms')
  @RequirePermission(Permissions.SCHOOL_CAMPUS_MANAGE)
  @ApiOperation({ summary: 'Create a physical classroom linked to a campus' })
  createClassroom(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateClassroomDto
  ) {
    return this.schoolCoreService.createClassroom(this.extractTenantId(user), dto);
  }
}
