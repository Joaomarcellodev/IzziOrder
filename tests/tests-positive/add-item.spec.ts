import { test, expect, Page } from '@playwright/test';

test.describe('Adicionar Item', () => {
  
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
  });

  test.afterEach(async ({ page }) => {
    console.log('Limpando itens criados nos testes...');
    
    if (!page.url().includes('/auth/menu')) {
      await page.goto('http://localhost:3000/auth/menu');
      await page.waitForTimeout(2000);
    }

    await page.locator('button:has(svg.lucide-trash)').last().click();
    await page.waitForTimeout(1000);

    const botaoConfirmar = page.getByRole('button', { name: /excluir|confirmar|sim/i });
    if (await botaoConfirmar.isVisible({ timeout: 2000 })) {
      await botaoConfirmar.click();
      await page.waitForTimeout(1000);
      console.log('Item excluído');
    }
  });

  // 1. ADICIONAR ITEM COMUM
  test('deve adicionar item com dados válidos', async ({ page }) => {
    test.setTimeout(60000);
    await page.getByRole('button', { name: /Adicionar Item/i }).click();
    await page.waitForTimeout(2000);
    
    await page.getByRole('textbox', { name: 'Nome do Item' }).fill('Pizza Teste');
    await page.waitForTimeout(1000);
    await page.getByPlaceholder('Escreva a descrição do item').fill('Pizza de teste criada automaticamente');
    await page.waitForTimeout(1000);
    
    await page.getByRole('spinbutton', { name: 'Preço (R$)' }).fill('35.90');
    await page.waitForTimeout(1000);

    await page.locator('div:has-text("Categoria")').getByRole('combobox').click();
    await page.waitForTimeout(500);
    await page.getByRole('option').first().click();
    await page.waitForTimeout(500);
    
    await page.getByRole('button', { name: 'Salvar' }).click();
    await page.waitForTimeout(2000);
    await expect(page.getByText('Pizza Teste').first()).toBeVisible();
  });
    
  // 2. ITEM COM PREÇO INTEIRO (SEM CENTAVOS)
  test('deve adicionar item com preço inteiro', async ({ page }) => {
    test.setTimeout(60000);
    await page.getByRole('button', { name: /Adicionar Item/i }).click();
    await page.waitForTimeout(2000);
      
    await page.getByRole('textbox', { name: 'Nome do Item' }).fill('Água Mineral');
    await page.waitForTimeout(1000);
    
    await page.getByPlaceholder('Escreva a descrição do item').fill('Água sem gás 500ml');
    await page.waitForTimeout(1000);

    await page.getByRole('spinbutton', { name: 'Preço (R$)' }).fill('4');
    await page.waitForTimeout(1000);

    await page.locator('div:has-text("Categoria")').getByRole('combobox').click();
    await page.waitForTimeout(500);
    await page.getByRole('option').first().click();
    await page.waitForTimeout(500);
      
    await page.getByRole('button', { name: 'Salvar' }).click();
    await page.waitForTimeout(2000);
      
    await expect(page.getByText('Água Mineral').first()).toBeVisible();
  });
  
  // 3. PREÇO MÍNIMO VÁLIDO (R$ 0.01)
  test('deve adicionar item com preço mínimo válido', async ({ page }) => {
    test.setTimeout(60000);
      
    await page.getByRole('button', { name: /Adicionar Item/i }).click();
    await page.waitForTimeout(2000);
      
    await page.getByRole('textbox', { name: 'Nome do Item' }).fill('Item Promocional');
    await page.waitForTimeout(1000);
      
    await page.getByPlaceholder('Escreva a descrição do item').fill('Item com preço simbólico');
    await page.waitForTimeout(1000);
      
    await page.getByRole('spinbutton', { name: 'Preço (R$)' }).fill('0.01');
    await page.waitForTimeout(1000);

    await page.locator('div:has-text("Categoria")').getByRole('combobox').click();
    await page.waitForTimeout(500);
    await page.getByRole('option').first().click();
    await page.waitForTimeout(500);
      
    await page.getByRole('button', { name: 'Salvar' }).click();
    await page.waitForTimeout(2000);
      
    await expect(page.getByText('Item Promocional').first()).toBeVisible();
    await expect(page.getByText('R$ 0.01').first()).toBeVisible();
  });
});