import { Permissions, PermissionKey, SchoolRole, PlatformRole } from '@cole/domain-types';

export const RolePermissionsMap: Record<string, PermissionKey[]> = {
  // Global Platform Roles
  [PlatformRole.SUPER_ADMIN]: Object.values(Permissions) as PermissionKey[],
  [PlatformRole.SUPPORT_AGENT]: [
    Permissions.PLATFORM_METRICS_VIEW,
    Permissions.PLATFORM_IMPERSONATE,
    Permissions.SCHOOL_CONFIG_VIEW,
    Permissions.STUDENTS_VIEW,
    Permissions.ENROLLMENT_VIEW,
    Permissions.ACADEMIC_GRADES_VIEW,
    Permissions.FINANCE_VIEW,
    Permissions.REPORTING_VIEW,
    Permissions.AUDIT_VIEW,
  ],

  // School Specific Roles
  [SchoolRole.DIRECTOR]: [
    Permissions.SCHOOL_CONFIG_VIEW,
    Permissions.SCHOOL_CONFIG_UPDATE,
    Permissions.SCHOOL_CAMPUS_MANAGE,
    Permissions.SCHOOL_PERIODS_MANAGE,
    Permissions.STUDENTS_VIEW,
    Permissions.STUDENTS_CREATE,
    Permissions.STUDENTS_UPDATE,
    Permissions.STUDENTS_DELETE,
    Permissions.FAMILY_VIEW,
    Permissions.FAMILY_MANAGE,
    Permissions.ENROLLMENT_VIEW,
    Permissions.ENROLLMENT_MANAGE,
    Permissions.ENROLLMENT_APPROVE,
    Permissions.ACADEMIC_CURRICULUM_MANAGE,
    Permissions.ACADEMIC_GRADES_VIEW,
    Permissions.ACADEMIC_GRADES_INPUT,
    Permissions.ACADEMIC_GRADES_PUBLISH,
    Permissions.ACADEMIC_ATTENDANCE_RECORD,
    Permissions.FINANCE_VIEW,
    Permissions.FINANCE_COLLECT,
    Permissions.FINANCE_REFUND,
    Permissions.FINANCE_CASHBOX_MANAGE,
    Permissions.FINANCE_RATES_MANAGE,
    Permissions.COMMERCE_CATALOG_MANAGE,
    Permissions.COMMERCE_INVENTORY_MANAGE,
    Permissions.COMMERCE_ORDERS_VIEW,
    Permissions.COMMERCE_ORDERS_PROCESS,
    Permissions.ACTIVITIES_VIEW,
    Permissions.COMMERCE_ORDERS_VIEW,
    Permissions.ACTIVITIES_MANAGE,
    Permissions.HR_EMPLOYEES_MANAGE,
    Permissions.HR_ATTENDANCE_MANAGE,
    Permissions.PAYROLL_VIEW,
    Permissions.PAYROLL_PROCESS,
    Permissions.PAYROLL_APPROVE,
    Permissions.REPORTING_VIEW,
    Permissions.AUDIT_VIEW,
  ],

  [SchoolRole.ADMINISTRATOR]: [
    Permissions.SCHOOL_CONFIG_VIEW,
    Permissions.SCHOOL_CONFIG_UPDATE,
    Permissions.SCHOOL_CAMPUS_MANAGE,
    Permissions.SCHOOL_PERIODS_MANAGE,
    Permissions.STUDENTS_VIEW,
    Permissions.STUDENTS_CREATE,
    Permissions.STUDENTS_UPDATE,
    Permissions.FAMILY_VIEW,
    Permissions.FAMILY_MANAGE,
    Permissions.ENROLLMENT_VIEW,
    Permissions.ENROLLMENT_MANAGE,
    Permissions.ENROLLMENT_APPROVE,
    Permissions.ACADEMIC_GRADES_VIEW,
    Permissions.FINANCE_VIEW,
    Permissions.FINANCE_COLLECT,
    Permissions.FINANCE_CASHBOX_MANAGE,
    Permissions.COMMERCE_ORDERS_VIEW,
    Permissions.COMMERCE_ORDERS_PROCESS,
    Permissions.ACTIVITIES_VIEW,
    Permissions.ACTIVITIES_MANAGE,
    Permissions.HR_EMPLOYEES_MANAGE,
    Permissions.REPORTING_VIEW,
  ],

  [SchoolRole.SECRETARY]: [
    Permissions.SCHOOL_CONFIG_VIEW,
    Permissions.STUDENTS_VIEW,
    Permissions.STUDENTS_CREATE,
    Permissions.STUDENTS_UPDATE,
    Permissions.FAMILY_VIEW,
    Permissions.FAMILY_MANAGE,
    Permissions.ENROLLMENT_VIEW,
    Permissions.ENROLLMENT_MANAGE,
    Permissions.ACADEMIC_GRADES_VIEW,
    Permissions.ACADEMIC_ATTENDANCE_RECORD,
    Permissions.ACTIVITIES_VIEW,
  ],

  [SchoolRole.ASSISTANT]: [
    Permissions.SCHOOL_CONFIG_VIEW,
    Permissions.STUDENTS_VIEW,
    Permissions.FAMILY_VIEW,
    Permissions.ENROLLMENT_VIEW,
    Permissions.ACADEMIC_GRADES_VIEW,
    Permissions.ACADEMIC_ATTENDANCE_RECORD,
    Permissions.ACTIVITIES_VIEW,
  ],

  [SchoolRole.TEACHER]: [
    Permissions.STUDENTS_VIEW,
    Permissions.ACADEMIC_GRADES_VIEW,
    Permissions.ACADEMIC_GRADES_INPUT,
    Permissions.ACADEMIC_ATTENDANCE_RECORD,
    Permissions.ACTIVITIES_VIEW,
  ],

  [SchoolRole.ACCOUNTANT]: [
    Permissions.FINANCE_VIEW,
    Permissions.FINANCE_COLLECT,
    Permissions.FINANCE_REFUND,
    Permissions.FINANCE_CASHBOX_MANAGE,
    Permissions.FINANCE_RATES_MANAGE,
    Permissions.COMMERCE_ORDERS_VIEW,
    Permissions.PAYROLL_VIEW,
    Permissions.PAYROLL_PROCESS,
    Permissions.REPORTING_VIEW,
  ],

  [SchoolRole.PARENT]: [
    Permissions.STUDENTS_VIEW,
    Permissions.FAMILY_VIEW,
    Permissions.COMMERCE_ORDERS_VIEW,
    Permissions.ACADEMIC_GRADES_VIEW,
    Permissions.FINANCE_VIEW,
    Permissions.ACTIVITIES_VIEW,
  ],

  [SchoolRole.STUDENT]: [
    Permissions.STUDENTS_VIEW,
    Permissions.ACADEMIC_GRADES_VIEW,
    Permissions.ACTIVITIES_VIEW,
  ],
};

export function getPermissionsForRoles(roles: string[], isSuperAdmin = false): string[] {
  if (isSuperAdmin) {
    return Object.values(Permissions);
  }

  const permissionSet = new Set<string>();
  for (const role of roles) {
    const perms = RolePermissionsMap[role] || [];
    for (const p of perms) {
      permissionSet.add(p);
    }
  }

  return Array.from(permissionSet);
}
