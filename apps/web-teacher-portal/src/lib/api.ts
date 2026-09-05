const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('cole_access_token') : null;
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

export type ApiUser = { id: string; email: string; firstName: string; lastName: string };

export async function login(email: string, password: string) {
  const result = await request<{ accessToken: string; user: ApiUser }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('cole_access_token', result.accessToken);
  }
  return result;
}

export function getCourses<T>() {
  return request<T[]>('/academic/courses');
}

export function getCourseSections<T>(teacherId?: string) {
  const query = teacherId ? `?teacherId=${encodeURIComponent(teacherId)}` : '';
  return request<T[]>(`/academic/sections${query}`);
}

export function getEvaluationsBySection<T>(courseSectionId?: string) {
  const query = courseSectionId ? `?courseSectionId=${encodeURIComponent(courseSectionId)}` : '';
  return request<T[]>(`/academic/evaluations${query}`);
}

export function createEvaluation<T>(body: {
  courseSectionId: string;
  academicPeriodId: string;
  name: string;
  type: 'EXAM' | 'HOMEWORK' | 'PROJECT' | 'QUIZ' | 'ORAL';
  weight?: number;
  maxScore?: number;
  evaluationDate: string;
}) {
  return request<T>('/academic/evaluations', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function submitGrades<T>(body: {
  evaluationId: string;
  academicPeriodId: string;
  grades: Array<{
    studentId: string;
    score: number;
    letterScore?: string;
    feedback?: string;
  }>;
}) {
  return request<T>('/academic/grades/submit', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function publishEvaluation<T>(evaluationId: string) {
  return request<T>(`/academic/evaluations/${encodeURIComponent(evaluationId)}/publish`, {
    method: 'PATCH',
  });
}

export function recordAttendance<T>(body: {
  sectionId: string;
  academicPeriodId?: string;
  date: string;
  records: Array<{
    studentId: string;
    status: 'PRESENT' | 'ABSENT' | 'TARDY' | 'EXCUSED';
    remarks?: string;
  }>;
}) {
  return request<T>('/academic/attendance', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function getAttendanceReport<T>(sectionId: string, date?: string) {
  const query = date ? `?date=${encodeURIComponent(date)}` : '';
  return request<T[]>(`/academic/attendance/${encodeURIComponent(sectionId)}${query}`);
}

export function getStudentReportCard<T>(studentId: string, academicPeriodId?: string) {
  const query = academicPeriodId ? `?academicPeriodId=${encodeURIComponent(academicPeriodId)}` : '';
  return request<T>(`/academic/report-card/${encodeURIComponent(studentId)}${query}`);
}
