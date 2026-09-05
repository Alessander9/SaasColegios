import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StudentService } from './student.service';
import { CreateStudentDto, CreateGuardianDto, LinkGuardianDto } from './dto/student.dto';
import { AuthGuard } from '../identity/guards/auth.guard';
import { PermissionGuard } from '../identity/guards/permission.guard';
import { RequirePermission, CurrentUser } from '../identity/decorators/auth.decorators';
import { Permissions, AuthenticatedUser } from '@cole/domain-types';

@ApiTags('Students & Families')
@ApiBearerAuth()
@Controller('students')
@UseGuards(AuthGuard, PermissionGuard)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  private extractTenantId(user: AuthenticatedUser): string {
    if (!user.tenantId) {
      throw new ForbiddenException('Tenant context is required for student operations');
    }
    return user.tenantId;
  }

  @Post()
  @RequirePermission(Permissions.STUDENTS_CREATE)
  @ApiOperation({ summary: 'Register a new student record (Validates plan student quota)' })
  createStudent(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateStudentDto
  ) {
    return this.studentService.createStudent(this.extractTenantId(user), dto);
  }

  @Get()
  @RequirePermission(Permissions.STUDENTS_VIEW)
  @ApiOperation({ summary: 'List students with guardians and active enrollments' })
  getStudents(@CurrentUser() user: AuthenticatedUser) {
    return this.studentService.getStudents(this.extractTenantId(user));
  }

  @Get('mine')
  @RequirePermission(Permissions.FAMILY_VIEW)
  @ApiOperation({ summary: 'List students linked to the authenticated family user' })
  getMine(@CurrentUser() user: AuthenticatedUser) {
    return this.studentService.getStudentsForGuardian(this.extractTenantId(user), user.id);
  }

  @Get(':id')
  @RequirePermission(Permissions.STUDENTS_VIEW)
  @ApiOperation({ summary: 'Get full student academic and family file by ID' })
  getStudentById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string
  ) {
    return this.studentService.getStudentById(this.extractTenantId(user), id);
  }

  @Post('guardians')
  @RequirePermission(Permissions.FAMILY_MANAGE)
  @ApiOperation({ summary: 'Create a parent/guardian profile' })
  createGuardian(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateGuardianDto
  ) {
    return this.studentService.createGuardian(this.extractTenantId(user), dto);
  }

  @Post(':id/guardians')
  @RequirePermission(Permissions.FAMILY_MANAGE)
  @ApiOperation({ summary: 'Link a parent/guardian to a student' })
  linkGuardian(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') studentId: string,
    @Body() dto: LinkGuardianDto
  ) {
    return this.studentService.linkGuardian(this.extractTenantId(user), studentId, dto);
  }
}
