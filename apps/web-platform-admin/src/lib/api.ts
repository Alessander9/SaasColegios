const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window === 'undefined' ? null : localStorage.getItem('cole_super_admin_token');
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!response.ok) throw new Error(`API request failed: ${response.status}`);
  return response.json() as Promise<T>;
}

// ── Auth ──
export async function login(email: string, password: string) {
  const result = await request<{ accessToken: string; user: { id: string; email: string; firstName: string; lastName: string; roles: string[]; isSuperAdmin: boolean } }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem('cole_super_admin_token', result.accessToken);
  localStorage.setItem('cole_super_admin_user', JSON.stringify(result.user));
  return result;
}

export function logout() {
  localStorage.removeItem('cole_super_admin_token');
  localStorage.removeItem('cole_super_admin_user');
}

export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('cole_super_admin_user');
  return raw ? JSON.parse(raw) : null;
}

// ── Platform: Tenants ──
export interface PlatformTenant {
  id: string;
  slug: string;
  name: string;
  subdomain: string;
  customDomain?: string;
  status: 'ACTIVE' | 'TRIAL' | 'SUSPENDED' | 'ARCHIVED';
  planId: string;
  plan?: PlatformPlan;
  subscriptions?: Subscription[];
  usageMetrics?: TenantUsage[];
  overrides?: TenantOverride[];
  createdAt: string;
  updatedAt: string;
}

export interface PlatformPlan {
  id: string;
  code: string;
  name: string;
  description?: string;
  maxStudents: number;
  maxTeachers: number;
  maxStorageGb: number;
  features: string[];
  monthlyPrice: number;
  annualPrice: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  tenantId: string;
  planId: string;
  status: string;
  billingCycle: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface TenantUsage {
  id: string;
  tenantId: string;
  metricKey: string;
  value: number;
  periodKey: string;
}

export interface TenantOverride {
  id: string;
  tenantId: string;
  featureKey?: string;
  enabled?: boolean;
  metricKey?: string;
  limitValue?: number;
  reason?: string;
  expiresAt?: string;
}

export interface CreateTenantDto {
  name: string;
  slug: string;
  subdomain: string;
  customDomain?: string;
  planId: string;
  status?: string;
}

export interface UpdateTenantDto {
  name?: string;
  customDomain?: string;
  status?: string;
  planId?: string;
}

export interface CreatePlanDto {
  code: string;
  name: string;
  description?: string;
  maxStudents: number;
  maxTeachers: number;
  maxStorageGb: number;
  features: string[];
  monthlyPrice: number;
  annualPrice: number;
  isActive?: boolean;
}

// ── Platform Metrics ──
export interface PlatformMetrics {
  tenants: {
    total: number;
    active: number;
    trial: number;
    suspended: number;
  };
  usage: {
    totalStudentsActive: number;
  };
  catalog: {
    activePlans: number;
  };
  timestamp: string;
}

// ── Reporting: Platform Overview ──
export interface PlatformOverview {
  mrr: number;
  arr: number;
  totalTenants: number;
  activeTenants: number;
  totalStudents: number;
  planDistribution: { plan: string; count: number }[];
  revenueByMonth: { month: string; amount: number }[];
}

// ── Reporting: Growth ──
export interface GrowthTimeline {
  month: string;
  tenants: number;
  students: number;
}

// ── Reporting: Module Usage ──
export interface ModuleUsage {
  module: string;
  tenantCount: number;
  usagePercentage: number;
}

// ── Audit ──
export interface AuditLog {
  id: string;
  tenantId: string;
  actorId: string;
  actorEmail?: string;
  action: string;
  resource: string;
  resourceId: string;
  ipAddress?: string;
  timestamp: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
}

export interface AuditStats {
  byResource: { resource: string; count: number }[];
  topActions: { action: string; count: number }[];
  topActors: { actorId: string; email: string; count: number }[];
}

// ── API Functions ──

// Platform Tenants
export function getTenants() { return request<PlatformTenant[]>('/platform/tenants'); }
export function getTenantById(id: string) { return request<PlatformTenant>(`/platform/tenants/${id}`); }
export function createTenant(dto: CreateTenantDto) { return request<PlatformTenant>('/platform/tenants', { method: 'POST', body: JSON.stringify(dto) }); }
export function updateTenant(id: string, dto: UpdateTenantDto) { return request<PlatformTenant>(`/platform/tenants/${id}`, { method: 'PATCH', body: JSON.stringify(dto) }); }

// Platform Plans
export function getPlans() { return request<PlatformPlan[]>('/platform/plans'); }
export function createPlan(dto: CreatePlanDto) { return request<PlatformPlan>('/platform/plans', { method: 'POST', body: JSON.stringify(dto) }); }

// Platform Metrics
export function getPlatformMetrics() { return request<PlatformMetrics>('/platform/metrics'); }

// Reporting
export function getPlatformOverview() { return request<PlatformOverview>('/reporting/platform/overview'); }
export function getPlatformGrowth() { return request<GrowthTimeline[]>('/reporting/platform/growth'); }
export function getModuleUsage() { return request<ModuleUsage[]>('/reporting/platform/modules'); }

// Audit
export function getAuditLogs(params?: { resource?: string; action?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.resource) query.set('resource', params.resource);
  if (params?.action) query.set('action', params.action);
  if (params?.startDate) query.set('startDate', params.startDate);
  if (params?.endDate) query.set('endDate', params.endDate);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const qs = query.toString();
  return request<{ data: AuditLog[]; total: number; page: number; limit: number }>(`/audit/logs${qs ? `?${qs}` : ''}`);
}

export function getAuditStats(params?: { startDate?: string; endDate?: string }) {
  const query = new URLSearchParams();
  if (params?.startDate) query.set('startDate', params.startDate);
  if (params?.endDate) query.set('endDate', params.endDate);
  const qs = query.toString();
  return request<AuditStats>(`/audit/stats${qs ? `?${qs}` : ''}`);
}

// Entitlements
export function checkEntitlement(tenantId: string, feature?: string, metric?: string) {
  const query = new URLSearchParams();
  if (feature) query.set('feature', feature);
  if (metric) query.set('metric', metric);
  return request<{ allowed: boolean; reason?: string; current?: number; limit?: number }>(`/platform/tenants/${tenantId}/entitlements/check?${query.toString()}`);
}
