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
import { AcademicService } from './academic.service';
import {
  CreateCurricularAreaDto,
  CreateCourseDto,
  AssignTeacherToSectionDto,
  CreateEvaluationDto,
  SubmitGradesDto,
  RecordDailyAttendanceDto,
  CreateEvaluationScaleDto,
  CreateCompetencyDto,
  SubmitDescriptiveConclusionDto,
  CreateMockExamDto,
  SubmitMockExamResultsDto,
  LockAcademicPeriodDto,
} from './dto/academic.dto';
import { AuthGuard } from '../identity/guards/auth.guard';
import { PermissionGuard } from '../identity/guards/permission.guard';
import { RequirePermission, CurrentUser } from '../identity/decorators/auth.decorators';
import { Permissions, AuthenticatedUser } from '@cole/domain-types';

@ApiTags('Academic Core')
@ApiBearerAuth()
@Controller('academic')
@UseGuards(AuthGuard, PermissionGuard)
export class AcademicController {
  constructor(private readonly academicService: AcademicService) {}

  private extractTenantId(user: AuthenticatedUser): string {
    if (!user.tenantId) {
      throw new ForbiddenException('Tenant context is required for academic operations');
    }
    return user.tenantId;
  }

  // --------------------------------------------------
  // CURRICULAR AREAS & COURSES
  // --------------------------------------------------

  @Post('areas')
  @RequirePermission(Permissions.ACADEMIC_CURRICULUM_MANAGE)
  @ApiOperation({ summary: 'Create curricular area (e.g. Matemática, Comunicación)' })
  createArea(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCurricularAreaDto
  ) {
    return this.academicService.createCurricularArea(this.extractTenantId(user), dto);
  }

  @Get('areas')
  @RequirePermission(Permissions.ACADEMIC_GRADES_VIEW)
  @ApiOperation({ summary: 'List all curricular areas with their courses' })
  getAreas(@CurrentUser() user: AuthenticatedUser) {
    return this.academicService.getCurricularAreas(this.extractTenantId(user));
  }

  @Post('courses')
  @RequirePermission(Permissions.ACADEMIC_CURRICULUM_MANAGE)
  @ApiOperation({ summary: 'Create a course linked to an area and grade level' })
  createCourse(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCourseDto
  ) {
    return this.academicService.createCourse(this.extractTenantId(user), dto);
  }

  @Get('courses')
  @RequirePermission(Permissions.ACADEMIC_GRADES_VIEW)
  @ApiQuery({ name: 'gradeId', required: false })
  @ApiOperation({ summary: 'List courses with assigned teachers and sections' })
  getCourses(
    @CurrentUser() user: AuthenticatedUser,
    @Query('gradeId') gradeId?: string
  ) {
    return this.academicService.getCourses(this.extractTenantId(user), gradeId);
  }

  @Get('sections')
  @RequirePermission(Permissions.ACADEMIC_GRADES_VIEW)
  @ApiQuery({ name: 'teacherId', required: false })
  @ApiOperation({ summary: 'List course sections, enrolled students and evaluations' })
  getCourseSections(@CurrentUser() user: AuthenticatedUser, @Query('teacherId') teacherId?: string) {
    return this.academicService.getCourseSections(this.extractTenantId(user), teacherId);
  }

  @Get('evaluations')
  @RequirePermission(Permissions.ACADEMIC_GRADES_VIEW)
  @ApiQuery({ name: 'courseSectionId', required: false })
  @ApiOperation({ summary: 'List evaluations available for grade entry' })
  getEvaluations(@CurrentUser() user: AuthenticatedUser, @Query('courseSectionId') courseSectionId?: string) {
    return this.academicService.getEvaluations(this.extractTenantId(user), courseSectionId);
  }

  @Post('assignments')
  @RequirePermission(Permissions.ACADEMIC_CURRICULUM_MANAGE)
  @ApiOperation({ summary: 'Assign a teacher to a course in a specific section' })
  assignTeacher(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AssignTeacherToSectionDto
  ) {
    return this.academicService.assignTeacherToSection(this.extractTenantId(user), dto);
  }

  // --------------------------------------------------
  // EVALUATIONS & GRADING LIFECYCLE
  // --------------------------------------------------

  @Post('evaluations')
  @RequirePermission(Permissions.ACADEMIC_GRADES_INPUT)
  @ApiOperation({ summary: 'Create an evaluation/exam for a course section' })
  createEvaluation(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateEvaluationDto
  ) {
    return this.academicService.createEvaluation(this.extractTenantId(user), dto);
  }

  @Post('grades/submit')
  @RequirePermission(Permissions.ACADEMIC_GRADES_INPUT)
  @ApiOperation({
    summary: 'Submit evaluation scores by teacher (Emits GradeSubmitted.v1)',
  })
  submitGrades(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SubmitGradesDto
  ) {
    return this.academicService.submitGrades(this.extractTenantId(user), user.id, dto);
  }

  @Patch('evaluations/:id/publish')
  @RequirePermission(Permissions.ACADEMIC_GRADES_PUBLISH)
  @ApiOperation({
    summary: 'Formally publish evaluation scores to families/students (Emits GradePublished.v1)',
  })
  publishGrades(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') evaluationId: string
  ) {
    return this.academicService.publishGrades(this.extractTenantId(user), evaluationId);
  }

  @Get('report-card/:studentId')
  @RequirePermission(Permissions.ACADEMIC_GRADES_VIEW)
  @ApiQuery({ name: 'academicPeriodId', required: false })
  @ApiOperation({ summary: 'Generate official student report card with weighted GPA' })
  getReportCard(
    @CurrentUser() user: AuthenticatedUser,
    @Param('studentId') studentId: string,
    @Query('academicPeriodId') academicPeriodId?: string
  ) {
    return this.academicService.getStudentReportCard(
      this.extractTenantId(user),
      studentId,
      academicPeriodId
    );
  }

  @Get('student/:studentId/schedule')
  @RequirePermission(Permissions.ACADEMIC_GRADES_VIEW)
  @ApiOperation({ summary: 'Get the enrolled course schedule for a student' })
  getStudentSchedule(@CurrentUser() user: AuthenticatedUser, @Param('studentId') studentId: string) {
    return this.academicService.getStudentSchedule(this.extractTenantId(user), studentId);
  }

  // --------------------------------------------------
  // ATTENDANCE
  // --------------------------------------------------

  @Post('attendance')
  @RequirePermission(Permissions.ACADEMIC_ATTENDANCE_RECORD)
  @ApiOperation({
    summary: 'Record daily classroom attendance for a section (Emits AttendanceRecorded.v1)',
  })
  recordAttendance(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RecordDailyAttendanceDto
  ) {
    return this.academicService.recordDailyAttendance(this.extractTenantId(user), dto);
  }

  @Get('attendance/:sectionId')
  @RequirePermission(Permissions.ACADEMIC_GRADES_VIEW)
  @ApiQuery({ name: 'date', required: false })
  @ApiOperation({ summary: 'Get section daily attendance records' })
  getAttendance(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sectionId') sectionId: string,
    @Query('date') date?: string
  ) {
    return this.academicService.getAttendanceReport(this.extractTenantId(user), sectionId, date);
  }

  // --------------------------------------------------
  // CONFIGURABLE EVALUATION SCALES
  // --------------------------------------------------

  @Get('scales')
  @RequirePermission(Permissions.ACADEMIC_GRADES_VIEW)
  @ApiOperation({ summary: 'Get all evaluation scales configured for this institution' })
  getScales(@CurrentUser() user: AuthenticatedUser) {
    return this.academicService.getEvaluationScales(this.extractTenantId(user));
  }

  @Post('scales')
  @RequirePermission(Permissions.ACADEMIC_SCALES_MANAGE)
  @ApiOperation({ summary: 'Create custom evaluation scale (LITERAL, NUMERIC, POINTS, CUSTOM)' })
  createScale(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateEvaluationScaleDto
  ) {
    return this.academicService.createEvaluationScale(this.extractTenantId(user), dto);
  }

  // --------------------------------------------------
  // COMPETENCIES (CNEB)
  // --------------------------------------------------

  @Get('competencies')
  @RequirePermission(Permissions.ACADEMIC_GRADES_VIEW)
  @ApiQuery({ name: 'areaId', required: false })
  @ApiQuery({ name: 'courseId', required: false })
  @ApiOperation({ summary: 'Get competencies and rubrics' })
  getCompetencies(
    @CurrentUser() user: AuthenticatedUser,
    @Query('areaId') areaId?: string,
    @Query('courseId') courseId?: string
  ) {
    return this.academicService.getCompetencies(this.extractTenantId(user), areaId, courseId);
  }

  @Post('competencies')
  @RequirePermission(Permissions.ACADEMIC_COMPETENCIES_MANAGE)
  @ApiOperation({ summary: 'Create competency with criteria' })
  createCompetency(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCompetencyDto
  ) {
    return this.academicService.createCompetency(this.extractTenantId(user), dto);
  }

  // --------------------------------------------------
  // DESCRIPTIVE CONCLUSIONS (INICIAL / PRIMARIA)
  // --------------------------------------------------

  @Post('conclusions')
  @RequirePermission(Permissions.ACADEMIC_GRADES_INPUT)
  @ApiOperation({ summary: 'Submit descriptive conclusion for student competency' })
  submitConclusion(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SubmitDescriptiveConclusionDto
  ) {
    return this.academicService.submitDescriptiveConclusion(this.extractTenantId(user), dto);
  }

  @Get('conclusions/:studentId')
  @RequirePermission(Permissions.ACADEMIC_GRADES_VIEW)
  @ApiQuery({ name: 'periodId', required: false })
  @ApiOperation({ summary: 'Get descriptive conclusions for student' })
  getConclusions(
    @CurrentUser() user: AuthenticatedUser,
    @Param('studentId') studentId: string,
    @Query('periodId') periodId?: string
  ) {
    return this.academicService.getDescriptiveConclusions(this.extractTenantId(user), studentId, periodId);
  }

  // --------------------------------------------------
  // MOCK EXAMS & ADMISSION PRE-U
  // --------------------------------------------------

  @Post('mock-exams')
  @RequirePermission(Permissions.ACADEMIC_CURRICULUM_MANAGE)
  @ApiOperation({ summary: 'Create pre-university mock exam with scoring rules' })
  createMockExam(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateMockExamDto
  ) {
    return this.academicService.createMockExam(this.extractTenantId(user), dto);
  }

  @Post('mock-exams/results')
  @RequirePermission(Permissions.ACADEMIC_GRADES_INPUT)
  @ApiOperation({ summary: 'Submit mock exam student answer counts and compute rankings' })
  submitMockExamResults(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SubmitMockExamResultsDto
  ) {
    return this.academicService.submitMockExamResults(this.extractTenantId(user), dto);
  }

  @Get('mock-exams/:mockExamId/rankings')
  @RequirePermission(Permissions.ACADEMIC_GRADES_VIEW)
  @ApiOperation({ summary: 'Get mock exam leaderboard, rankings and percentiles' })
  getMockExamRankings(
    @CurrentUser() user: AuthenticatedUser,
    @Param('mockExamId') mockExamId: string
  ) {
    return this.academicService.getMockExamRankings(this.extractTenantId(user), mockExamId);
  }

  // --------------------------------------------------
  // PERIOD LOCKING
  // --------------------------------------------------

  @Post('periods/lock')
  @RequirePermission(Permissions.ACADEMIC_PERIOD_LOCK)
  @ApiOperation({ summary: 'Lock or close academic period to prevent further mutations' })
  lockPeriod(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: LockAcademicPeriodDto
  ) {
    return this.academicService.lockAcademicPeriod(this.extractTenantId(user), dto);
  }
}
