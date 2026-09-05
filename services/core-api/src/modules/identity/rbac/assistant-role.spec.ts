import { SchoolRole, Permissions } from '@cole/domain-types';
import { getPermissionsForRoles, RolePermissionsMap } from './role-permissions.map';

describe('SchoolRole.ASSISTANT Role Permissions Matrix', () => {
  it('should map SchoolRole.ASSISTANT with expected operational permissions', () => {
    const assistantPermissions = getPermissionsForRoles([SchoolRole.ASSISTANT]);

    // Expected Allowed Permissions
    expect(assistantPermissions).toContain(Permissions.SCHOOL_CONFIG_VIEW);
    expect(assistantPermissions).toContain(Permissions.STUDENTS_VIEW);
    expect(assistantPermissions).toContain(Permissions.FAMILY_VIEW);
    expect(assistantPermissions).toContain(Permissions.ENROLLMENT_VIEW);
    expect(assistantPermissions).toContain(Permissions.ACADEMIC_GRADES_VIEW);
    expect(assistantPermissions).toContain(Permissions.ACADEMIC_ATTENDANCE_RECORD);
    expect(assistantPermissions).toContain(Permissions.ACTIVITIES_VIEW);
  });

  it('should strictly exclude administrative, financial, curricular and mutation permissions for ASSISTANT', () => {
    const assistantPermissions = getPermissionsForRoles([SchoolRole.ASSISTANT]);

    // Forbidden Student Mutations
    expect(assistantPermissions).not.toContain(Permissions.STUDENTS_CREATE);
    expect(assistantPermissions).not.toContain(Permissions.STUDENTS_UPDATE);
    expect(assistantPermissions).not.toContain(Permissions.STUDENTS_DELETE);

    // Forbidden Enrollment Operations
    expect(assistantPermissions).not.toContain(Permissions.ENROLLMENT_MANAGE);
    expect(assistantPermissions).not.toContain(Permissions.ENROLLMENT_APPROVE);

    // Forbidden Academic Grade Mutations & Curricular Management
    expect(assistantPermissions).not.toContain(Permissions.ACADEMIC_GRADES_INPUT);
    expect(assistantPermissions).not.toContain(Permissions.ACADEMIC_GRADES_PUBLISH);
    expect(assistantPermissions).not.toContain(Permissions.ACADEMIC_CURRICULUM_MANAGE);
    expect(assistantPermissions).not.toContain(Permissions.ACADEMIC_SCALES_MANAGE);
    expect(assistantPermissions).not.toContain(Permissions.ACADEMIC_PERIOD_LOCK);

    // Forbidden Financial & CashBox Operations
    expect(assistantPermissions).not.toContain(Permissions.FINANCE_VIEW);
    expect(assistantPermissions).not.toContain(Permissions.FINANCE_COLLECT);
    expect(assistantPermissions).not.toContain(Permissions.FINANCE_REFUND);
    expect(assistantPermissions).not.toContain(Permissions.FINANCE_CASHBOX_MANAGE);
    expect(assistantPermissions).not.toContain(Permissions.FINANCE_RATES_MANAGE);

    // Forbidden HR & Payroll Operations
    expect(assistantPermissions).not.toContain(Permissions.HR_EMPLOYEES_MANAGE);
    expect(assistantPermissions).not.toContain(Permissions.PAYROLL_VIEW);
    expect(assistantPermissions).not.toContain(Permissions.PAYROLL_PROCESS);
    expect(assistantPermissions).not.toContain(Permissions.PAYROLL_APPROVE);

    // Forbidden System & Campus Configurations
    expect(assistantPermissions).not.toContain(Permissions.SCHOOL_CONFIG_UPDATE);
    expect(assistantPermissions).not.toContain(Permissions.SCHOOL_CAMPUS_MANAGE);
  });

  it('should return exactly the defined permissions in RolePermissionsMap', () => {
    const mapped = RolePermissionsMap[SchoolRole.ASSISTANT];
    expect(mapped).toBeDefined();
    expect(mapped.length).toBe(7);
  });
});
