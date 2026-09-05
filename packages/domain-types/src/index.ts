// Multi-Tenant Context
export interface TenantContext {
  tenantId: string;
  subdomain?: string;
  schoolId?: string;
  isSuperAdmin?: boolean;
}

// User Context & Auth Identity
export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
  tenantId?: string;
  isSuperAdmin: boolean;
  impersonatorId?: string; // Audit mode for support impersonation
}

// Domain Event Base Contract
export interface DomainEvent<T = Record<string, unknown>> {
  eventId: string;
  eventType: string;
  occurredAt: string; // ISO 8601 UTC
  tenantId: string;
  aggregateId: string;
  correlationId?: string;
  causationId?: string;
  version: number;
  payload: T;
}

// Standard Domain Result / Error Pattern
export type DomainResult<T, E = DomainError> =
  | { success: true; data: T }
  | { success: false; error: E };

export interface DomainError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

// Audit Log Payload Contract
export interface AuditLogEntry {
  id: string;
  tenantId: string;
  actorId: string;
  actorEmail?: string;
  action: string;
  resource: string;
  resourceId: string;
  ipAddress?: string;
  userAgent?: string;
  correlationId?: string;
  timestamp: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
}

// Outbox Pattern Row Contract
export interface OutboxRecord {
  id: string;
  tenantId: string;
  eventType: string;
  payload: Record<string, unknown>;
  aggregateType: string;
  aggregateId: string;
  correlationId?: string;
  createdAt: string;
  status: 'PENDING' | 'PROCESSING' | 'PUBLISHED' | 'FAILED';
  retryCount: number;
  lastError?: string;
  publishedAt?: string;
}

// Feature Entitlement System Types
export type FeatureKey =
  | 'academic'
  | 'enrollment'
  | 'finance'
  | 'commerce'
  | 'activities'
  | 'hr'
  | 'payroll'
  | 'notifications'
  | 'documents'
  | 'reporting'
  | 'advanced_analytics'
  | 'custom_domain';

export type UsageMetricKey =
  | 'students'
  | 'teachers'
  | 'storage_gb'
  | 'monthly_emails'
  | 'monthly_sms';

export interface EntitlementCheckResult {
  allowed: boolean;
  reason?: 'FEATURE_NOT_INCLUDED' | 'LIMIT_REACHED' | 'TENANT_SUSPENDED' | 'PLAN_EXPIRED';
  metric?: UsageMetricKey;
  current?: number;
  limit?: number;
}

// Global & School Roles
export enum PlatformRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SUPPORT_AGENT = 'SUPPORT_AGENT',
}

export enum SchoolRole {
  DIRECTOR = 'DIRECTOR',
  ADMINISTRATOR = 'ADMINISTRATOR',
  SECRETARY = 'SECRETARY',
  ASSISTANT = 'ASSISTANT',
  TEACHER = 'TEACHER',
  PARENT = 'PARENT',
  STUDENT = 'STUDENT',
  ACCOUNTANT = 'ACCOUNTANT',
}

// Permission Catalog Constants
export const Permissions = {
  // Platform Super Admin
  PLATFORM_TENANTS_MANAGE: 'platform.tenants.manage',
  PLATFORM_PLANS_MANAGE: 'platform.plans.manage',
  PLATFORM_IMPERSONATE: 'platform.impersonate',
  PLATFORM_METRICS_VIEW: 'platform.metrics.view',

  // School Core
  SCHOOL_CONFIG_VIEW: 'school.config.view',
  SCHOOL_CONFIG_UPDATE: 'school.config.update',
  SCHOOL_CAMPUS_MANAGE: 'school.campus.manage',
  SCHOOL_PERIODS_MANAGE: 'school.periods.manage',

  // Students & Family
  STUDENTS_VIEW: 'students.view',
  STUDENTS_CREATE: 'students.create',
  STUDENTS_UPDATE: 'students.update',
  STUDENTS_DELETE: 'students.delete',
  FAMILY_VIEW: 'family.view',
  FAMILY_MANAGE: 'family.manage',

  // Enrollment
  ENROLLMENT_VIEW: 'enrollment.view',
  ENROLLMENT_MANAGE: 'enrollment.manage',
  ENROLLMENT_APPROVE: 'enrollment.approve',

  // Academic
  ACADEMIC_CURRICULUM_MANAGE: 'academic.curriculum.manage',
  ACADEMIC_GRADES_VIEW: 'academic.grades.view',
  ACADEMIC_GRADES_INPUT: 'academic.grades.input',
  ACADEMIC_GRADES_PUBLISH: 'academic.grades.publish',
  ACADEMIC_ATTENDANCE_RECORD: 'academic.attendance.record',

  // Financial Core
  FINANCE_VIEW: 'finance.view',
  FINANCE_COLLECT: 'finance.collect',
  FINANCE_REFUND: 'finance.refund',
  FINANCE_CASHBOX_MANAGE: 'finance.cashbox.manage',
  FINANCE_RATES_MANAGE: 'finance.rates.manage',

  // Commerce
  COMMERCE_CATALOG_MANAGE: 'commerce.catalog.manage',
  COMMERCE_INVENTORY_MANAGE: 'commerce.inventory.manage',
  COMMERCE_ORDERS_VIEW: 'commerce.orders.view',
  COMMERCE_ORDERS_PROCESS: 'commerce.orders.process',

  // Activities
  ACTIVITIES_VIEW: 'activities.view',
  ACTIVITIES_MANAGE: 'activities.manage',

  // HR & Payroll
  HR_EMPLOYEES_MANAGE: 'hr.employees.manage',
  HR_ATTENDANCE_MANAGE: 'hr.attendance.manage',
  PAYROLL_VIEW: 'payroll.view',
  PAYROLL_PROCESS: 'payroll.process',
  PAYROLL_APPROVE: 'payroll.approve',

  // Reporting & Audit
  REPORTING_VIEW: 'reporting.view',
  AUDIT_VIEW: 'audit.view',

  // Academic Engine & Scales
  ACADEMIC_SCALES_MANAGE: 'academic.scales.manage',
  ACADEMIC_COMPETENCIES_MANAGE: 'academic.competencies.manage',
  ACADEMIC_PROMOTION_MANAGE: 'academic.promotion.manage',
  ACADEMIC_PERIOD_LOCK: 'academic.period.lock',
} as const;

export type PermissionKey = (typeof Permissions)[keyof typeof Permissions];

/* ────────────────────────────────────────────────────────────
   ACADEMIC ENGINE & CONFIGURABLE EVALUATION SYSTEM TYPES
   ──────────────────────────────────────────────────────────── */

export enum InstitutionType {
  INITIAL_EDUCATION = 'INITIAL_EDUCATION',
  PRIMARY_EDUCATION = 'PRIMARY_EDUCATION',
  SECONDARY_EDUCATION = 'SECONDARY_EDUCATION',
  EBR = 'EBR',
  EBA = 'EBA',
  PRE_UNIVERSITY = 'PRE_UNIVERSITY',
  TRAINING_CENTER = 'TRAINING_CENTER',
  CUSTOM = 'CUSTOM',
}

export enum EvaluationScaleType {
  LITERAL = 'LITERAL',
  NUMERIC = 'NUMERIC',
  PERCENTAGE = 'PERCENTAGE',
  POINTS = 'POINTS',
  CUSTOM = 'CUSTOM',
}

export enum AssessmentType {
  COMPETENCY = 'COMPETENCY',
  EXAM = 'EXAM',
  QUIZ = 'QUIZ',
  TASK = 'TASK',
  PROJECT = 'PROJECT',
  PARTICIPATION = 'PARTICIPATION',
  PRACTICE = 'PRACTICE',
  SIMULATION = 'SIMULATION',
  CUSTOM = 'CUSTOM',
}

export enum AcademicPeriodState {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  LOCKED = 'LOCKED',
}

export interface EvaluationScaleDto {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  type: EvaluationScaleType;
  minValue?: number;
  maxValue?: number;
  decimalPlaces: number;
  isDefault: boolean;
  isActive: boolean;
  items?: EvaluationScaleItemDto[];
}

export interface EvaluationScaleItemDto {
  id: string;
  scaleId: string;
  code: string; // e.g. "AD", "A", "B", "C"
  label: string; // e.g. "Logro destacado", "Logro esperado"
  description?: string;
  numericMin?: number;
  numericMax?: number;
  order: number;
  color?: string;
  isPassing: boolean;
}

export interface CompetencyDto {
  id: string;
  tenantId: string;
  areaId?: string;
  courseId?: string;
  code: string;
  name: string;
  description?: string;
  order: number;
  isActive: boolean;
  criteria?: CriterionDto[];
}

export interface CriterionDto {
  id: string;
  competencyId: string;
  code: string;
  name: string;
  description?: string;
  order: number;
}

export interface AssessmentDto {
  id: string;
  tenantId: string;
  courseSectionId: string;
  academicPeriodId: string;
  competencyId?: string;
  scaleId: string;
  name: string;
  type: AssessmentType;
  weight: number;
  maxScore?: number;
  date: string;
  status: AcademicPeriodState;
}

export interface StudentAssessmentResultDto {
  id: string;
  tenantId: string;
  assessmentId: string;
  studentId: string;
  scaleItemId?: string;
  numericValue?: number;
  literalValue?: string;
  percentage?: number;
  comment?: string;
  teacherObservation?: string;
}

export interface DescriptiveConclusionDto {
  id: string;
  tenantId: string;
  studentId: string;
  competencyId: string;
  periodId: string;
  teacherId: string;
  text: string;
  status: AcademicPeriodState;
  createdAt: string;
  updatedAt: string;
}

export interface MockExamDto {
  id: string;
  tenantId: string;
  title: string;
  code: string;
  examDate: string;
  durationMinutes: number;
  totalQuestions: number;
  correctPoints: number;
  incorrectPenalty: number;
  blankPoints: number;
  maxScore: number;
  academicPeriodId: string;
}

export interface MockExamResultDto {
  id: string;
  tenantId: string;
  mockExamId: string;
  studentId: string;
  studentName?: string;
  correctAnswers: number;
  incorrectAnswers: number;
  unanswered: number;
  rawScore: number;
  finalScore: number;
  percentage: number;
  ranking: number;
  totalStudents: number;
  percentile: number;
  careerTrack?: string;
}

export interface GradeAuditDto {
  id: string;
  tenantId: string;
  assessmentId: string;
  studentId: string;
  userId: string;
  oldValue?: string;
  newValue?: string;
  reason: string;
  timestamp: string;
  ipAddress?: string;
}

export interface AcademicRegulationDto {
  id: string;
  code: string; // e.g. "RVM-094-2020-MINEDU"
  name: string;
  version: string;
  effectiveFrom: string;
  effectiveTo?: string;
  institutionType: InstitutionType;
  rules: Record<string, unknown>;
  isActive: boolean;
}
