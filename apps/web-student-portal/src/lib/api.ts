const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = window.localStorage.getItem('cole_access_token');
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

export async function login(email: string, password: string) {
  const result = await request<{ accessToken: string; user: { id: string; firstName: string; lastName: string } }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  window.localStorage.setItem('cole_access_token', result.accessToken);
  return result;
}

export function getStudentReportCard<T>(studentId: string) {
  return request<T>(`/academic/report-card/${studentId}`);
}
export function getAttendance<T>(sectionId: string) {
  return request<T[]>(`/academic/attendance/${sectionId}`);
}

export function getCourses<T>() { return request<T[]>('/academic/courses'); }
export function getMyStudents<T>() { return request<T[]>('/students/mine'); }
export function getStudentSchedule<T>(studentId: string) {
  return request<T>(`/academic/student/${studentId}/schedule`);
}
