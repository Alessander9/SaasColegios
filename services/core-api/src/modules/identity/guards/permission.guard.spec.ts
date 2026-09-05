import { PermissionGuard } from './permission.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Permissions } from '@cole/domain-types';
import { PERMISSIONS_KEY, ROLES_KEY } from '../decorators/auth.decorators';

describe('PermissionGuard', () => {
  let guard: PermissionGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new PermissionGuard(reflector);
  });

  const createMockContext = (user: any) => {
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  };

  it('should allow super admins unconditionally', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
      if (key === PERMISSIONS_KEY) return [Permissions.STUDENTS_DELETE];
      return undefined;
    });

    const context = createMockContext({
      id: 'admin-1',
      isSuperAdmin: true,
      permissions: [],
      roles: ['SUPER_ADMIN'],
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow users with required permission', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
      if (key === PERMISSIONS_KEY) return [Permissions.ACADEMIC_GRADES_INPUT];
      if (key === ROLES_KEY) return ['TEACHER'];
      return undefined;
    });

    const context = createMockContext({
      id: 'teacher-1',
      isSuperAdmin: false,
      permissions: [Permissions.ACADEMIC_GRADES_INPUT, Permissions.ACADEMIC_GRADES_VIEW],
      roles: ['TEACHER'],
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should reject users lacking required permission', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
      if (key === PERMISSIONS_KEY) return [Permissions.FINANCE_COLLECT];
      return undefined;
    });

    const context = createMockContext({
      id: 'teacher-1',
      isSuperAdmin: false,
      permissions: [Permissions.ACADEMIC_GRADES_INPUT],
      roles: ['TEACHER'],
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  describe('SchoolRole.ASSISTANT (Auxiliar / Asistente)', () => {
    it('should allow ASSISTANT to record attendance and view students/family', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === PERMISSIONS_KEY) return [Permissions.ACADEMIC_ATTENDANCE_RECORD];
        return undefined;
      });

      const context = createMockContext({
        id: 'assistant-1',
        isSuperAdmin: false,
        permissions: [
          Permissions.SCHOOL_CONFIG_VIEW,
          Permissions.STUDENTS_VIEW,
          Permissions.FAMILY_VIEW,
          Permissions.ENROLLMENT_VIEW,
          Permissions.ACADEMIC_GRADES_VIEW,
          Permissions.ACADEMIC_ATTENDANCE_RECORD,
          Permissions.ACTIVITIES_VIEW,
        ],
        roles: ['ASSISTANT'],
      });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should strictly reject ASSISTANT attempting to modify academic grades', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === PERMISSIONS_KEY) return [Permissions.ACADEMIC_GRADES_INPUT];
        return undefined;
      });

      const context = createMockContext({
        id: 'assistant-1',
        isSuperAdmin: false,
        permissions: [
          Permissions.STUDENTS_VIEW,
          Permissions.ACADEMIC_ATTENDANCE_RECORD,
        ],
        roles: ['ASSISTANT'],
      });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should strictly reject ASSISTANT attempting to collect payments or manage cashbox', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === PERMISSIONS_KEY) return [Permissions.FINANCE_COLLECT];
        return undefined;
      });

      const context = createMockContext({
        id: 'assistant-1',
        isSuperAdmin: false,
        permissions: [
          Permissions.STUDENTS_VIEW,
          Permissions.ACADEMIC_ATTENDANCE_RECORD,
        ],
        roles: ['ASSISTANT'],
      });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should strictly reject ASSISTANT attempting to delete or create students', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === PERMISSIONS_KEY) return [Permissions.STUDENTS_DELETE];
        return undefined;
      });

      const context = createMockContext({
        id: 'assistant-1',
        isSuperAdmin: false,
        permissions: [
          Permissions.STUDENTS_VIEW,
          Permissions.ACADEMIC_ATTENDANCE_RECORD,
        ],
        roles: ['ASSISTANT'],
      });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should strictly reject ASSISTANT attempting to process payroll or manage staff', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === PERMISSIONS_KEY) return [Permissions.PAYROLL_PROCESS];
        return undefined;
      });

      const context = createMockContext({
        id: 'assistant-1',
        isSuperAdmin: false,
        permissions: [
          Permissions.STUDENTS_VIEW,
          Permissions.ACADEMIC_ATTENDANCE_RECORD,
        ],
        roles: ['ASSISTANT'],
      });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });
});
