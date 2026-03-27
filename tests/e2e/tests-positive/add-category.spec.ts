import { test, expect } from '@playwright/test';

test.describe('Adicionar Categoria', () => {

  test.beforeEach(async ({ page }) => {

    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(2000);
    await page.getByRole('textbox', { name: /e-mail/i }).fill('usuario@teste.com');
    await page.getByRole('textbox', { name: /senha/i }).fill('senhatesteA1');
    await page.locator('button.bg-blue-600').click();
    await page.waitForURL('**/auth/**', { timeout: 15000 });
    await page.waitForTimeout(3000);

    await page.goto('http://localhost:3000/auth/menu');
    await page.waitForTimeout(2000);
  });

  test.afterEach(async ({ page }) => {
    console.log('Limpando categorias criadas nos testes...');

    if (!page.url().includes('/auth/menu')) {
      await page.goto('http://localhost:3000/auth/menu');
      await page.waitForTimeout(2000);
    }
    await page.locator('button:has(svg.lucide-trash)').last().click();
    await page.waitForTimeout(1000);

    const botaoConfirmar = page.getByRole('button', { name: /excluir/i });
    if (await botaoConfirmar.isVisible({ timeout: 2000 })) {
      await botaoConfirmar.click();
      await page.waitForTimeout(1000);
      console.log('Categoria excluída');
    }
  });

  // 1. ADICIONAR CATEGORIA BÁSICA
  test('deve adicionar categoria com nome válido', async ({ page }) => {
    test.setTimeout(60000);

    await page.getByRole('button', { name: /Adicionar Categoria/i }).click();
    await page.waitForTimeout(1000);

    await page.getByRole('textbox', { name: /nome da categoria/i }).fill('Sobremesas');
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: /salvar/i }).click();
    await page.waitForTimeout(2000);

    await expect(page.getByText('Sobremesas').first()).toBeVisible();
  });

  // 2. CATEGORIA COM NÚMEROS
  test('deve adicionar categoria com nome contendo números', async ({ page }) => {
    test.setTimeout(60000);

    await page.getByRole('button', { name: /Adicionar Categoria/i }).click();
    await page.waitForTimeout(1000);

    await page.getByRole('textbox', { name: /nome da categoria/i }).fill('Lanches 2024');
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: /salvar/i }).click();
    await page.waitForTimeout(2000);

    await expect(page.getByText('Lanches 2024').first()).toBeVisible();
  });

  // 3. CATEGORIA COM CARACTERES ESPECIAIS
  test('deve adicionar categoria com nome contendo caracteres especiais', async ({ page }) => {
    test.setTimeout(60000);

    await page.getByRole('button', { name: /Adicionar Categoria/i }).click();
    await page.waitForTimeout(1000);

    await page.getByRole('textbox', { name: /nome da categoria/i }).fill('Café & Chá');
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: /salvar/i }).click();
    await page.waitForTimeout(2000);

    await expect(page.getByText('Café & Chá').first()).toBeVisible();
  });

});