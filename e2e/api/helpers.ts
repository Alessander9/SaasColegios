/**
 * MASSIVE API INTEGRATION TEST HELPERS
 * Shared utilities for all API test suites
 */

const BASE_URL = process.env.API_URL || 'http://localhost:4000';

// ─── Test Users & Credentials ─────────────────────────────────────────────────
export const USERS = {
  SUPER_ADMIN: { email: 'admin@cole.pe', password: 'Cole2026!', role: 'SUPER_ADMIN' },
  DIRECTOR: { email: 'director@sanjose.edu.pe', password: 'Cole2026!', role: 'DIRECTOR' },
  TEACHER: { email: 'elena.torres@sanjose.edu.pe', password: 'Cole2026!', role: 'TEACHER' },
  TEACHER_2: { email: 'carlos.mendoza@sanjose.edu.pe', password: 'Cole2026!', role: 'TEACHER' },
  PARENT: { email: 'padre.garcia@email.com', password: 'Cole2026!', role: 'PARENT' },
  // Users not seeded — tests will skip gracefully if login fails
  ACCOUNTANT: { email: 'contable@sanjose.edu.pe', password: 'Cole2026!', role: 'ACCOUNTANT' },
  ADMINISTRATOR: { email: 'admin.school@sanjose.edu.pe', password: 'Cole2026!', role: 'ADMINISTRATOR' },
  SECRETARY: { email: 'secretaria@sanjose.edu.pe', password: 'Cole2026!', role: 'SECRETARY' },
  STUDENT: { email: 'alumno.garcia@email.com', password: 'Cole2026!', role: 'STUDENT' },
} as const;

// ─── Token Cache ──────────────────────────────────────────────────────────────
const tokenCache: Record<string, string> = {};

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function loginAs(user: typeof USERS[keyof typeof USERS]): Promise<string | null> {
  const cacheKey = user.email;
  if (tokenCache[cacheKey]) return tokenCache[cacheKey];

  // Retry up to 3 times with backoff for rate limiting
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, password: user.password }),
      });

      if (res.status === 429) {
        console.warn(`⏳ Rate limited on ${user.email}, waiting ${(attempt * 3000) / 1000}s (attempt ${attempt}/3)`);
        await sleep(attempt * 3000);
        continue;
      }

      if (!res.ok) {
        console.warn(`⚠️  Login failed for ${user.email}: ${res.status}`);
        return null;
      }

      const data = await res.json();
      const token = data.accessToken || data.token;
      if (!token) {
        console.warn(`⚠️  No token returned for ${user.email}`);
        return null;
      }

      tokenCache[cacheKey] = token;
      return token;
    } catch (err: any) {
      console.warn(`⚠️  Login error for ${user.email}: ${err.message}`);
      return null;
    }
  }
  return null;
}

export function authHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

// ─── HTTP Utilities ───────────────────────────────────────────────────────────
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiRequestOptions {
  method: HttpMethod;
  path: string;
  token?: string;
  body?: unknown;
  query?: Record<string, string>;
}

export interface ApiResponse {
  status: number;
  body: unknown;
  ok: boolean;
}

// Small delay to avoid rate limiting (100ms between requests)
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 50;

export async function apiRequest(opts: ApiRequestOptions): Promise<ApiResponse> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_REQUEST_INTERVAL) {
    await new Promise(r => setTimeout(r, MIN_REQUEST_INTERVAL - elapsed));
  }
  lastRequestTime = Date.now();

  let url = `${BASE_URL}/api/v1${opts.path}`;
  if (opts.query) {
    const params = new URLSearchParams(opts.query);
    url += `?${params.toString()}`;
  }

  const headers: Record<string, string> = opts.token
    ? authHeaders(opts.token)
    : { 'Content-Type': 'application/json' };

  const res = await fetch(url, {
    method: opts.method,
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    body = await res.text();
  }

  return { status: res.status, body, ok: res.ok };
}

// ─── Convenience Functions ────────────────────────────────────────────────────
export const GET = (path: string, token?: string, query?: Record<string, string>) =>
  apiRequest({ method: 'GET', path, token, query });

export const POST = (path: string, token: string, body?: unknown) =>
  apiRequest({ method: 'POST', path, token, body });

export const PUT = (path: string, token: string, body?: unknown) =>
  apiRequest({ method: 'PUT', path, token, body });

export const PATCH = (path: string, token: string, body?: unknown) =>
  apiRequest({ method: 'PATCH', path, token, body });

export const DELETE = (path: string, token: string) =>
  apiRequest({ method: 'DELETE', path, token });

// ─── Expectation Helpers ──────────────────────────────────────────────────────
export function expectStatus(res: ApiResponse, expected: number) {
  if (res.status !== expected) {
    throw new Error(`Expected status ${expected}, got ${res.status}. Body: ${JSON.stringify(res.body)}`);
  }
}

export function expectOk(res: ApiResponse) {
  if (!res.ok) {
    throw new Error(`Expected OK response, got ${res.status}. Body: ${JSON.stringify(res.body)}`);
  }
}

export function expectForbidden(res: ApiResponse) {
  if (res.status !== 403 && res.status !== 401) {
    throw new Error(`Expected 401/403 Forbidden, got ${res.status}. Body: ${JSON.stringify(res.body)}`);
  }
}

export function expectUnauthorized(res: ApiResponse) {
  if (res.status !== 401) {
    throw new Error(`Expected 401 Unauthorized, got ${res.status}. Body: ${JSON.stringify(res.body)}`);
  }
}
