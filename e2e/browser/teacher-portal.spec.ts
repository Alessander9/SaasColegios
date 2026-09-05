import { expect, test } from '@playwright/test';

test.use({ baseURL: 'http://127.0.0.1:3004' });

test('teacher can authenticate and see the gradebook', async ({ page }) => {
  await page.goto('/');
  await page.locator('input[type="email"]').fill('elena.torres@sanjose.edu.pe');
  await page.locator('input[type="password"]').fill('Cole2026!');
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page.getByRole('heading', { name: 'Portal del Profesor' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Guardar Calificaciones/ })).toBeVisible();
});
