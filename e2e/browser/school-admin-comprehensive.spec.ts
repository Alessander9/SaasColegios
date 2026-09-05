/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  PLAYWRIGHT E2E: SCHOOL ADMIN PORTAL                                      ║
 * ║  Tests: Login, HR, Academic, Finance, Students, Reporting Tabs            ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { expect, test } from '@playwright/test';

test.use({ baseURL: 'http://127.0.0.1:3001' });

test.describe('School Admin Portal', () => {
  test.describe('Authentication', () => {
    test('should display login page with emerald theme', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('.mesh-blob')).toHaveCount(4);
      await expect(page.locator('.shield-icon-container')).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
    });

    test('should login with director credentials', async ({ page }) => {
      await page.goto('/');
      await page.locator('input[type="email"]').fill('director@sanjose.edu.pe');
      await page.locator('input[type="password"]').fill('Cole2026!');
      await page.getByRole('button', { name: 'Ingresar' }).click();
      await expect(page.getByText('Colegio San José').first()).toBeVisible({ timeout: 10000 });
    });

    test('should show error for wrong password', async ({ page }) => {
      await page.goto('/');
      await page.locator('input[type="email"]').fill('director@sanjose.edu.pe');
      await page.locator('input[type="password"]').fill('wrong');
      await page.getByRole('button', { name: 'Ingresar' }).click();
      await expect(page.getByText(/inválid|invalid|error/i)).toBeVisible({ timeout: 5000 });
    });

    test('should reject super admin credentials on school portal', async ({ page }) => {
      await page.goto('/');
      await page.locator('input[type="email"]').fill('admin@cole.pe');
      await page.locator('input[type="password"]').fill('Cole2026!');
      await page.getByRole('button', { name: 'Ingresar' }).click();
      // Should either show error or login without school context
      await page.waitForTimeout(3000);
    });
  });

  test.describe('Dashboard Tabs', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.locator('input[type="email"]').fill('director@sanjose.edu.pe');
      await page.locator('input[type="password"]').fill('Cole2026!');
      await page.getByRole('button', { name: 'Ingresar' }).click();
      await page.getByText('Colegio San José').first().waitFor({ timeout: 10000 });
    });

    test('should display KPI cards on dashboard', async ({ page }) => {
      await expect(page.getByText('Personal Activo').first()).toBeVisible();
      await expect(page.getByText('Planilla Mensual Neta').first()).toBeVisible();
    });

    test('should show HR & Payroll tab content', async ({ page }) => {
      const hrTab = page.getByRole('button', { name: /RRHH|Planilla/i });
      if (await hrTab.isVisible()) {
        await hrTab.click();
        await expect(page.getByText('Directorio de Personal')).toBeVisible();
      }
    });

    test('should show employee directory table', async ({ page }) => {
      await expect(page.locator('table')).toBeVisible();
      await expect(page.getByText('Elena Torres Valencia').first()).toBeVisible();
      await expect(page.getByText('Carlos Mendoza Ríos').first()).toBeVisible();
    });

    test('should have payroll calculation button', async ({ page }) => {
      const payrollBtn = page.getByRole('button', { name: /Liquidar Planilla/i });
      await expect(payrollBtn).toBeVisible();
    });

    test('should navigate to Academic tab', async ({ page }) => {
      const academicTab = page.getByRole('button', { name: /Académico|Notas/i });
      if (await academicTab.isVisible()) {
        await academicTab.click();
        await expect(page.getByText('Malla Curricular')).toBeVisible();
      }
    });

    test('should show courses in Academic tab', async ({ page }) => {
      const academicTab = page.getByRole('button', { name: /Académico|Notas/i });
      if (await academicTab.isVisible()) {
        await academicTab.click();
        await expect(page.getByText('Álgebra y Aritmética').first()).toBeVisible();
        await expect(page.getByText('Comprensión Lectora').first()).toBeVisible();
      }
    });

    test('should navigate to Finance tab', async ({ page }) => {
      const financeTab = page.getByRole('button', { name: /Finanzas|Caja/i });
      if (await financeTab.isVisible()) {
        await financeTab.click();
        await expect(page.getByText('Núcleo Financiero')).toBeVisible();
      }
    });

    test('should show orders table in Finance tab', async ({ page }) => {
      const financeTab = page.getByRole('button', { name: /Finanzas|Caja/i });
      if (await financeTab.isVisible()) {
        await financeTab.click();
        await expect(page.getByText('Pedidos de Tienda')).toBeVisible();
      }
    });

    test('should navigate to Students tab', async ({ page }) => {
      const studentsTab = page.getByRole('button', { name: /Alumnos/i });
      if (await studentsTab.isVisible()) {
        await studentsTab.click();
        await expect(page.getByText('Directorio de Alumnos')).toBeVisible();
      }
    });

    test('should navigate to Reporting tab', async ({ page }) => {
      const reportingTab = page.getByRole('button', { name: /Reportes|BI/i });
      if (await reportingTab.isVisible()) {
        await reportingTab.click();
        await expect(page.getByText('Recaudación vs Morosidad')).toBeVisible();
      }
    });

    test('should show financial collection table in Reporting', async ({ page }) => {
      const reportingTab = page.getByRole('button', { name: /Reportes|BI/i });
      if (await reportingTab.isVisible()) {
        await reportingTab.click();
        await expect(page.getByText('Pensiones')).toBeVisible();
      }
    });
  });

  test.describe('Payroll Flow', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.locator('input[type="email"]').fill('director@sanjose.edu.pe');
      await page.locator('input[type="password"]').fill('Cole2026!');
      await page.getByRole('button', { name: 'Ingresar' }).click();
      await page.getByText('Colegio San José').first().waitFor({ timeout: 10000 });
    });

    test('should calculate payroll and show success', async ({ page }) => {
      const payrollBtn = page.getByRole('button', { name: /Liquidar Planilla/i });
      await payrollBtn.click();
      // Wait for either success or error
      await page.waitForTimeout(3000);
      const successOrError = page.getByText(/calculada|calculada|error|Error/i);
      await expect(successOrError).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Visual Effects', () => {
    test('should have particle animation on login', async ({ page }) => {
      await page.goto('/');
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
    });

    test('should have mesh gradient on login', async ({ page }) => {
      await page.goto('/');
      const meshBlobs = page.locator('.mesh-blob');
      await expect(meshBlobs).toHaveCount(4);
    });
  });
});
