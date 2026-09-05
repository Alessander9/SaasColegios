import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/browser',
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  timeout: 30000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    // ── Super Admin Portal ──
    {
      name: 'super-admin',
      testMatch: /super-admin-comprehensive\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://127.0.0.1:3000' },
    },
    // ── School Admin Portal ──
    {
      name: 'school-admin-comprehensive',
      testMatch: /school-admin-comprehensive\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://127.0.0.1:3001' },
    },
    // ── All Portals (Parent, Teacher, Student) ──
    {
      name: 'all-portals-parent',
      testMatch: /all-portals-comprehensive\.spec\.ts/,
      testIgnore: /teacher|student/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://127.0.0.1:3003' },
    },
    {
      name: 'all-portals-teacher',
      testMatch: /all-portals-comprehensive\.spec\.ts/,
      testIgnore: /parent|student/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://127.0.0.1:3004' },
    },
    {
      name: 'all-portals-student',
      testMatch: /all-portals-comprehensive\.spec\.ts/,
      testIgnore: /parent|teacher/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://127.0.0.1:3005' },
    },
    // ── Original simple tests ──
    {
      name: 'school-admin-simple',
      testMatch: /school-admin\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://127.0.0.1:3001' },
    },
    {
      name: 'parent-portal-simple',
      testMatch: /parent-portal\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://127.0.0.1:3003' },
    },
    {
      name: 'teacher-portal-simple',
      testMatch: /teacher-portal\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://127.0.0.1:3004' },
    },
    {
      name: 'student-portal-simple',
      testMatch: /student-portal\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://127.0.0.1:3005' },
    },
  ],
});
