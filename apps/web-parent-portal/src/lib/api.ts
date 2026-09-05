const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export type ApiUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  tenantId?: string;
};

type LoginResponse = { accessToken: string; user: ApiUser };

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window === 'undefined' ? null : window.localStorage.getItem('cole_access_token');
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const result = await request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  window.localStorage.setItem('cole_access_token', result.accessToken);
  return result;
}

export function getCurrentUser(): Promise<{ user: ApiUser }> {
  return request<{ user: ApiUser }>('/auth/me');
}

export function getActivities<T>(): Promise<T[]> {
  return request<T[]>('/activities');
}

export function getProducts<T>(): Promise<T[]> {
  return request<T[]>('/commerce/products');
}

export function getMyStudents<T>(): Promise<T[]> {
  return request<T[]>('/students/mine');
}

export function getMyOrders<T>(): Promise<T[]> {
  return request<T[]>('/commerce/orders');
}

export function checkoutOrder<T>(body: { studentId?: string; variantId: string; quantity: number; idempotencyKey: string }) {
  return request<T>('/commerce/orders/checkout', {
    method: 'POST',
    body: JSON.stringify({
      studentId: body.studentId,
      items: [{ variantId: body.variantId, quantity: body.quantity }],
      idempotencyKey: body.idempotencyKey,
      deliveryMethod: 'PICKUP_AT_SCHOOL',
    }),
  });
}
