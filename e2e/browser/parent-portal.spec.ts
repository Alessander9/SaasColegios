import { expect, test } from '@playwright/test';

test('parent can authenticate and see the real school store', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Correo').fill('padre.garcia@email.com');
  await page.getByLabel('Contraseña').fill('Cole2026!');
  await page.getByRole('button', { name: 'Ingresar' }).click();

  await expect(page.getByRole('heading', { name: 'Portal de Padres' })).toBeVisible();
  await page.getByRole('button', { name: /Tienda Escolar/ }).click();
  await expect(page.getByText('Tienda Virtual del Colegio San José')).toBeVisible();
  await expect(page.getByText('Mis pedidos')).toBeVisible();
});
