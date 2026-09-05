import { expect, test } from '@playwright/test';

test.use({ baseURL: 'http://127.0.0.1:3005' });

test('student portal loads authenticated academic summary', async ({ page }) => {
  await page.goto('/');
  await page.locator('input[type="email"]').fill('padre.garcia@email.com');
  await page.locator('input[type="password"]').fill('Cole2026!');
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page.getByText(/Asistencia/).first()).toBeVisible();
  await expect(page.getByText(/Horario/).first()).toBeVisible();
});
