const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window === 'undefined' ? null : localStorage.getItem('cole_access_token');
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) },
  });
  if (!response.ok) throw new Error(`API request failed: ${response.status}`);
  return response.json() as Promise<T>;
}

export async function login(email: string, password: string) {
  const result = await request<{ accessToken: string; user: unknown }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  localStorage.setItem('cole_access_token', result.accessToken);
  return result;
}

export function getStaff<T>() { return request<T[]>('/hr/employees'); }
export function createStaff<T>(data: any) {
  return request<T>('/hr/employees', { method: 'POST', body: JSON.stringify(data) });
}

export function getReporting<T>() { return request<T>('/reporting/school/overview'); }
export function getCourses<T>() { return request<T[]>('/academic/courses'); }
export function createCourse<T>(data: any) {
  return request<T>('/academic/courses', { method: 'POST', body: JSON.stringify(data) });
}

export function getPayrollPeriods<T>() { return request<T[]>('/payroll/periods'); }
export function calculatePayroll<T>(periodId: string) {
  return request<T>('/payroll/calculate', { method: 'POST', body: JSON.stringify({ periodId }) });
}
export function openPayrollPeriod<T>() {
  return request<T>('/payroll/periods', { method: 'POST', body: JSON.stringify({ name: 'Planilla Mensual Abril 2026', year: 2026, month: 4, startDate: '2026-04-01', endDate: '2026-04-30' }) });
}

export function getFinancialReport<T>() { return request<T>('/reporting/school/financial'); }
export function getCommerceReport<T>() { return request<T>('/reporting/school/commerce'); }
export function getOrders<T>() { return request<T[]>('/commerce/orders'); }
export function updateOrderStatus<T>(orderId: string, status: string) {
  return request<T>(`/commerce/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function getStudents<T>() { return request<T[]>('/students'); }
export function createStudent<T>(data: any) {
  return request<T>('/students', { method: 'POST', body: JSON.stringify(data) });
}

export function recordPayment<T>(data: any) {
  return request<T>('/finance/payments', { method: 'POST', body: JSON.stringify(data) });
}
