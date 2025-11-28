import { test, expect, Page } from '@playwright/test';

test.describe('Adicionar Categoria - Testes Negativos', () => {
  let categoriaCriada: string = '';
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(2000);
    await page.getByRole('textbox', { name: /e-mail/i }).fill('usuario@teste.com');
    await page.getByRole('textbox', { name: /senha/i }).fill('senhateste');
    await page.locator('button.bg-blue-600').click();
    await page.waitForURL('**/auth/**', { timeout: 15000 });
    await page.waitForTimeout(3000);

    await page.goto('http://localhost:3000/auth/menu');
    await page.waitForTimeout(2000);

    categoriaCriada = '';
  });

  test.afterEach(async ({ page }) => {
    console.log('Limpando categoria criada nos testes...');
    
    if (!page.url().includes('/auth/menu')) {
      await page.goto('http://localhost:3000/auth/menu');
      await page.waitForTimeout(2000);
    }

    if (categoriaCriada) {
      console.log('Excluindo categoria: ' + categoriaCriada);
      

      const categoriaParaExcluir = page.locator('div, li, article, section')
        .filter({ hasText: categoriaCriada })
        .filter({ has: page.locator('button:has(svg.lucide-trash)') })
        .last();

      if (await categoriaParaExcluir.isVisible()) {
        await categoriaParaExcluir.locator('button:has(svg.lucide-trash)').click();
        await page.waitForTimeout(1000);

        const botaoConfirmar = page.getByRole('button', { name: /excluir/i });
        if (await botaoConfirmar.isVisible({ timeout: 2000 })) {
          await botaoConfirmar.click();
          await page.waitForTimeout(1000);
          console.log('Categoria excluída: ' + categoriaCriada);
        }
      }
    } else {
      console.log('Nenhuma categoria criada para excluir');
    }
  });

  // 1. CATEGORIA COM NOME VAZIO 
  test('deve bloquear categoria com nome vazio', async ({ page }) => {
    await page.getByRole('button', { name: /Adicionar Categoria/i }).click();
    await page.waitForTimeout(1000);
    
    await page.getByRole('textbox', { name: /nome da categoria/i }).fill('');
    await page.waitForTimeout(500);
    
    await page.getByRole('button', { name: /salvar/i }).click();
    await page.waitForTimeout(2000);

    const aindaNoModal = await page.getByRole('textbox', { name: /nome da categoria/i }).isVisible();
    expect(aindaNoModal).toBeTruthy();

    await page.getByRole('button', { name: /cancelar/i }).click();
    await page.waitForTimeout(1000);

  });

  // 2. CATEGORIA COM NOME DUPLICADO 
  test('deve bloquear categoria com nome duplicado', async ({ page }) => {
  
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

});