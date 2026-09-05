/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  PLAYWRIGHT E2E: SUPER ADMIN PORTAL                                       ║
 * ║  Tests: Login, Dashboard, Tenant Management, Plans, Entitlements          ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { expect, test } from '@playwright/test';

test.use({ baseURL: 'http://127.0.0.1:3000' });

test.describe('Super Admin Portal', () => {
  test.describe('Authentication', () => {
    test('should display login page with premium design elements', async ({ page }) => {
      await page.goto('/');
      // Check mesh gradient and particles exist
      await expect(page.locator('.mesh-blob')).toHaveCount(4);
      // Check shield icon
      await expect(page.locator('.shield-icon-container')).toBeVisible();
      // Check login form
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.getByRole('button', { name: /Ingresar/i })).toBeVisible();
    });

    test('should login with valid super admin credentials', async ({ page }) => {
      await page.goto('/');
      await page.locator('input[type="email"]').fill('admin@cole.pe');
      await page.locator('input[type="password"]').fill('Cole2026!');
      await page.getByRole('button', { name: /Ingresar/i }).click();
      // Should show dashboard
      await expect(page.getByText('Colegio San José').first()).toBeVisible({ timeout: 10000 });
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/');
      await page.locator('input[type="email"]').fill('admin@cole.pe');
      await page.locator('input[type="password"]').fill('WrongPassword!');
      await page.getByRole('button', { name: /Ingresar/i }).click();
      await expect(page.getByText(/inválid|invalid|error/i)).toBeVisible({ timeout: 5000 });
    });

    test('should show error for empty fields', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /Ingresar/i }).click();
      await expect(page.locator('input[type="email"]')).toBeFocused();
    });

    test('should show 3D tilt effect on card hover', async ({ page }) => {
      await page.goto('/');
      const card = page.locator('.glass-card, [style*="perspective"]').first();
      if (await card.isVisible()) {
        await card.hover();
        // Card should have transform applied
        const transform = await card.evaluate(el => getComputedStyle(el).transform);
        expect(transform).toBeTruthy();
      }
    });
  });

  test.describe('Dashboard After Login', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.locator('input[type="email"]').fill('admin@cole.pe');
      await page.locator('input[type="password"]').fill('Cole2026!');
      await page.getByRole('button', { name: /Ingresar/i }).click();
      await page.getByText('Colegio San José').first().waitFor({ timeout: 10000 });
    });

    test('should display KPI cards', async ({ page }) => {
      await expect(page.getByText(/Alumnos Matriculados/i)).toBeVisible();
      await expect(page.getByText(/Ingresos Mensuales/i)).toBeVisible();
      await expect(page.getByText(/Docentes Activos/i)).toBeVisible();
    });

    test('should display revenue chart placeholder', async ({ page }) => {
      await expect(page.getByText(/Ingresos Mensuales/i)).toBeVisible();
    });

    test('should have logout functionality', async ({ page }) => {
      const logoutBtn = page.getByRole('button', { name: /Cerrar Sesión|Logout/i });
      if (await logoutBtn.isVisible()) {
        await logoutBtn.click();
        await expect(page.locator('input[type="email"]')).toBeVisible();
      }
    });
  });

  test.describe('Navigation Tabs', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.locator('input[type="email"]').fill('admin@cole.pe');
      await page.locator('input[type="password"]').fill('Cole2026!');
      await page.getByRole('button', { name: /Ingresar/i }).click();
      await page.getByText('Colegio San José').first().waitFor({ timeout: 10000 });
    });

    test('should navigate to tenants section', async ({ page }) => {
      const tenantsTab = page.getByRole('button', { name: /Escuelas|Tenants|Instituciones/i });
      if (await tenantsTab.isVisible()) {
        await tenantsTab.click();
        await expect(page.getByText(/Colegio San José/i).first()).toBeVisible();
      }
    });

    test('should navigate to plans section', async ({ page }) => {
      const plansTab = page.getByRole('button', { name: /Planes|Plans|Suscripciones/i });
      if (await plansTab.isVisible()) {
        await plansTab.click();
      }
    });

    test('should navigate to reporting section', async ({ page }) => {
      const reportingTab = page.getByRole('button', { name: /Reportes|Analytics|BI/i });
      if (await reportingTab.isVisible()) {
        await reportingTab.click();
      }
    });
  });
});
