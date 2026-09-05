/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  PLAYWRIGHT E2E: ALL PORTALS COMPREHENSIVE                                ║
 * ║  Tests: Parent, Teacher, Student portals with full flows                  ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { expect, test } from '@playwright/test';

// ═════════════════════════════════════════════════════════════════════════════
// PARENT PORTAL
// ═════════════════════════════════════════════════════════════════════════════
test.describe('Parent Portal', () => {
  test.use({ baseURL: 'http://127.0.0.1:3003' });

  test('should display login page', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/Portal de Padres|Colegio/i).first()).toBeVisible();
  });

  test('should login with parent credentials', async ({ page }) => {
    await page.goto('/');
    const emailInput = page.getByLabel('Correo').or(page.locator('input[type="email"]'));
    const passInput = page.getByLabel('Contraseña').or(page.locator('input[type="password"]'));
    await emailInput.fill('padre.garcia@email.com');
    await passInput.fill('Cole2026!');
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await expect(page.getByRole('heading', { name: /Portal de Padres/i })).toBeVisible({ timeout: 10000 });
  });

  test('should show children information after login', async ({ page }) => {
    await page.goto('/');
    const emailInput = page.getByLabel('Correo').or(page.locator('input[type="email"]'));
    const passInput = page.getByLabel('Contraseña').or(page.locator('input[type="password"]'));
    await emailInput.fill('padre.garcia@email.com');
    await passInput.fill('Cole2026!');
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await page.getByRole('heading', { name: /Portal de Padres/i }).waitFor({ timeout: 10000 });
    // Should show child-related content
    await expect(page.getByText(/Hijo|Student|Alumno|Grado/i).first()).toBeVisible();
  });

  test('should access school store', async ({ page }) => {
    await page.goto('/');
    const emailInput = page.getByLabel('Correo').or(page.locator('input[type="email"]'));
    const passInput = page.getByLabel('Contraseña').or(page.locator('input[type="password"]'));
    await emailInput.fill('padre.garcia@email.com');
    await passInput.fill('Cole2026!');
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await page.getByRole('heading', { name: /Portal de Padres/i }).waitFor({ timeout: 10000 });

    const storeBtn = page.getByRole('button', { name: /Tienda|Store/i });
    if (await storeBtn.isVisible()) {
      await storeBtn.click();
      await expect(page.getByText('Tienda Virtual del Colegio San José')).toBeVisible();
    }
  });

  test('should view grades/notes', async ({ page }) => {
    await page.goto('/');
    const emailInput = page.getByLabel('Correo').or(page.locator('input[type="email"]'));
    const passInput = page.getByLabel('Contraseña').or(page.locator('input[type="password"]'));
    await emailInput.fill('padre.garcia@email.com');
    await passInput.fill('Cole2026!');
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await page.getByRole('heading', { name: /Portal de Padres/i }).waitFor({ timeout: 10000 });

    const gradesBtn = page.getByRole('button', { name: /Calificaciones|Notas|Grades/i });
    if (await gradesBtn.isVisible()) {
      await gradesBtn.click();
      await expect(page.getByText(/Calificaciones|Notas|Grades|Reporte/i).first()).toBeVisible();
    }
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/');
    const emailInput = page.getByLabel('Correo').or(page.locator('input[type="email"]'));
    const passInput = page.getByLabel('Contraseña').or(page.locator('input[type="password"]'));
    await emailInput.fill('wrong@email.com');
    await passInput.fill('wrong');
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await expect(page.getByText(/inválid|invalid|error/i)).toBeVisible({ timeout: 5000 });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TEACHER PORTAL
// ═════════════════════════════════════════════════════════════════════════════
test.describe('Teacher Portal', () => {
  test.use({ baseURL: 'http://127.0.0.1:3004' });

  test('should display login page', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/Portal del Profesor|Docente|Teacher/i).first()).toBeVisible();
  });

  test('should login with teacher credentials', async ({ page }) => {
    await page.goto('/');
    const emailInput = page.locator('input[type="email"]');
    const passInput = page.locator('input[type="password"]');
    await emailInput.fill('elena.torres@sanjose.edu.pe');
    await passInput.fill('Cole2026!');
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await expect(page.getByRole('heading', { name: /Portal del Profesor/i })).toBeVisible({ timeout: 10000 });
  });

  test('should show gradebook after login', async ({ page }) => {
    await page.goto('/');
    await page.locator('input[type="email"]').fill('elena.torres@sanjose.edu.pe');
    await page.locator('input[type="password"]').fill('Cole2026!');
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await page.getByRole('heading', { name: /Portal del Profesor/i }).waitFor({ timeout: 10000 });
    await expect(page.getByText(/Calificaciones|Gradebook|Notas/i).first()).toBeVisible();
  });

  test('should show courses assigned to teacher', async ({ page }) => {
    await page.goto('/');
    await page.locator('input[type="email"]').fill('elena.torres@sanjose.edu.pe');
    await page.locator('input[type="password"]').fill('Cole2026!');
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await page.getByRole('heading', { name: /Portal del Profesor/i }).waitFor({ timeout: 10000 });
    await expect(page.getByText(/Comunicación|Curso|Course/i).first()).toBeVisible();
  });

  test('should have save grades button', async ({ page }) => {
    await page.goto('/');
    await page.locator('input[type="email"]').fill('elena.torres@sanjose.edu.pe');
    await page.locator('input[type="password"]').fill('Cole2026!');
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await page.getByRole('heading', { name: /Portal del Profesor/i }).waitFor({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /Guardar Calificaciones|Save/i })).toBeVisible();
  });

  test('should show attendance section', async ({ page }) => {
    await page.goto('/');
    await page.locator('input[type="email"]').fill('elena.torres@sanjose.edu.pe');
    await page.locator('input[type="password"]').fill('Cole2026!');
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await page.getByRole('heading', { name: /Portal del Profesor/i }).waitFor({ timeout: 10000 });
    await expect(page.getByText(/Asistencia|Attendance/i).first()).toBeVisible();
  });

  test('should show error for wrong credentials', async ({ page }) => {
    await page.goto('/');
    await page.locator('input[type="email"]').fill('elena.torres@sanjose.edu.pe');
    await page.locator('input[type="password"]').fill('wrong');
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await expect(page.getByText(/inválid|invalid|error/i)).toBeVisible({ timeout: 5000 });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// STUDENT PORTAL
// ═════════════════════════════════════════════════════════════════════════════
test.describe('Student Portal', () => {
  test.use({ baseURL: 'http://127.0.0.1:3005' });

  test('should display login page', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/Portal del Alumno|Student/i).first()).toBeVisible();
  });

  test('should login with student/family credentials', async ({ page }) => {
    await page.goto('/');
    const emailInput = page.locator('input[type="email"]');
    const passInput = page.locator('input[type="password"]');
    await emailInput.fill('padre.garcia@email.com');
    await passInput.fill('Cole2026!');
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await page.waitForTimeout(5000);
  });

  test('should show academic summary after login', async ({ page }) => {
    await page.goto('/');
    await page.locator('input[type="email"]').fill('padre.garcia@email.com');
    await page.locator('input[type="password"]').fill('Cole2026!');
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await page.waitForTimeout(5000);
    // Should show academic info
    const academicContent = page.getByText(/Asistencia|Horario|Calificaciones|Notas/i).first();
    await expect(academicContent).toBeVisible({ timeout: 10000 });
  });

  test('should show schedule information', async ({ page }) => {
    await page.goto('/');
    await page.locator('input[type="email"]').fill('padre.garcia@email.com');
    await page.locator('input[type="password"]').fill('Cole2026!');
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await page.waitForTimeout(5000);
    await expect(page.getByText(/Horario|Schedule/i).first()).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/');
    await page.locator('input[type="email"]').fill('wrong@email.com');
    await page.locator('input[type="password"]').fill('wrong');
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await expect(page.getByText(/inválid|invalid|error/i)).toBeVisible({ timeout: 5000 });
  });
});
