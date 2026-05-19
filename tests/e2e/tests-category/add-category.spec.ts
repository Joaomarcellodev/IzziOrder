import { test, expect } from '@playwright/test';
import { deleteTestCategories } from '../db-utils';

test.describe('Adicionar Categoria ', () => {
  let categoriaCriada: string = '';
  const categoriasDeTeste = ['Sobremesas', 'Lanches 2024', 'Café & Chá', 'Categoria Duplicada'];

  test.beforeEach(async ({ page }) => {
    test.setTimeout(150000);
    // Limpa o banco de testes antes de começar para evitar conflito com dados de testes anteriores quebrados
    await deleteTestCategories(categoriasDeTeste);

    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(3000);
    await page.getByRole('textbox', { name: /e-mail/i }).fill('usuario@teste.com');
    await page.getByRole('textbox', { name: /senha/i }).fill('senhatesteA1');
    await page.locator('button.bg-blue-600').click();
    await page.waitForURL('**/auth/**', { timeout: 120000 });
    await page.waitForTimeout(4000);

    await page.goto('http://localhost:3000/auth/menu');

    categoriaCriada = '';
  });

  test.afterEach(async () => {
    console.log('Limpando categorias criadas nos testes via DB...');
    await deleteTestCategories(categoriasDeTeste);
  });


  // VALID CASES 
  test.describe("Valid Cases ", () => {


    // 1. ADICIONAR CATEGORIA BÁSICA
    test('deve adicionar categoria com nome válido', async ({ page }) => {
      test.setTimeout(120000);

      await page.getByRole('button', { name: /Adicionar Categoria/i }).click();
      await page.waitForTimeout(1000);
      await page.getByRole('textbox', { name: /nome da categoria/i }).fill('Sobremesas');
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: /salvar/i }).click();
      await page.waitForTimeout(3000);
      await expect(page.getByText('Sobremesas').first()).toBeVisible();
      categoriaCriada = 'Sobremesas';
    });

    // 2. CATEGORIA COM NÚMEROS
    test('deve adicionar categoria com nome contendo números', async ({ page }) => {
      test.setTimeout(120000);

      await page.getByRole('button', { name: /Adicionar Categoria/i }).click();
      await page.waitForTimeout(1000);

      await page.getByRole('textbox', { name: /nome da categoria/i }).fill('Lanches 2024');
      await page.waitForTimeout(500);

      await page.getByRole('button', { name: /salvar/i }).click();
      await page.waitForTimeout(3000);

      await expect(page.getByText('Lanches 2024').first()).toBeVisible();
      categoriaCriada = 'Lanches 2024';

    });

    // 3. CATEGORIA COM CARACTERES ESPECIAIS
    test('deve adicionar categoria com nome contendo caracteres especiais', async ({ page }) => {
      test.setTimeout(120000);

      await page.getByRole('button', { name: /Adicionar Categoria/i }).click();
      await page.waitForTimeout(1000);

      await page.getByRole('textbox', { name: /nome da categoria/i }).fill('Café & Chá');
      await page.waitForTimeout(500);

      await page.getByRole('button', { name: /salvar/i }).click();
      await page.waitForTimeout(3000);

      await expect(page.getByText('Café & Chá').first()).toBeVisible();
      categoriaCriada = 'Café & Chá';
    });

  })


  // INVALID CASES 
  test.describe("Invalid Cases ", () => {


    // 1. CATEGORIA COM NOME VAZIO  
    test('deve bloquear categoria com nome vazio', async ({ page }) => {
      test.setTimeout(120000);
      await page.getByRole('button', { name: /Adicionar Categoria/i }).click();
      await page.waitForTimeout(1000);

      await page.getByRole('textbox', { name: /nome da categoria/i }).fill('');
      await page.waitForTimeout(500);

      await page.getByRole('button', { name: /salvar/i }).click();
      await page.waitForTimeout(3000);

      const aindaNoModal = await page.getByRole('textbox', { name: /nome da categoria/i }).isVisible();
      expect(aindaNoModal).toBeTruthy();

      await page.getByRole('button', { name: /cancelar/i }).click();
      await page.waitForTimeout(1000);

    });

    // 2. CATEGORIA COM NOME DUPLICADO 
    test('deve bloquear categoria com nome duplicado', async ({ page }) => {
      test.setTimeout(120000);

      await page.getByRole('button', { name: /Adicionar Categoria/i }).click();
      await page.waitForTimeout(1000);

      await page.getByRole('textbox', { name: /nome da categoria/i }).fill('Categoria Duplicada');
      await page.waitForTimeout(500);

      await page.getByRole('button', { name: /salvar/i }).click();
      await page.waitForTimeout(2000);

      await expect(page.getByText('Categoria Duplicada').first()).toBeVisible();

      categoriaCriada = 'Categoria Duplicada';

      await page.getByRole('button', { name: /Adicionar Categoria/i }).click();
      await page.waitForTimeout(1000);

      await page.getByRole('textbox', { name: /nome da categoria/i }).fill('Categoria Duplicada');
      await page.waitForTimeout(500);

      await page.getByRole('button', { name: /salvar/i }).click();
      await page.waitForTimeout(2000);

      const aindaNoModal = await page.getByRole('textbox', { name: /nome da categoria/i }).isVisible();
      expect(aindaNoModal).toBeTruthy();

      await page.getByRole('button', { name: /cancelar/i }).click();
      await page.waitForTimeout(1000);
    });


  })

});