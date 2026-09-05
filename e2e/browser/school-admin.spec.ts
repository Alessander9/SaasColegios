import { expect, test } from '@playwright/test';

test.use({ baseURL: 'http://127.0.0.1:3006' });

test('school admin can authenticate and view payroll workspace', async ({ page }) => {
  await page.goto('/');
  await page.locator('input[type="email"]').fill('director@sanjose.edu.pe');
  await page.locator('input[type="password"]').fill('Cole2026!');
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page.getByText('Directorio de Personal y Docentes')).toBeVisible();
  await expect(page.getByRole('button', { name: /Liquidar Planilla/ })).toBeVisible();
});
