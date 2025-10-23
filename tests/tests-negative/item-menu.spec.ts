import { test, expect } from '@playwright/test';

test.describe('Testes Negativos - Adicionar Item', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/menu');
    await page.waitForTimeout(2000);
  });

  // 1. NOME COM MENOS DE 3 CARACTERES
  test('deve bloquear item com nome menor que 3 caracteres', async ({ page }) => {
    test.setTimeout(60000);
    
    await page.getByRole('button', { name: /Adicionar Item/i }).click();
    await page.waitForTimeout(2000);
    
    await page.getByRole('textbox', { name: 'Nome do Item' }).fill('Ab');
    await page.waitForTimeout(2000);
    await page.getByPlaceholder('Escreva a descrição do item').fill('Descrição válida');
    await page.waitForTimeout(2000);
    await page.getByRole('spinbutton', { name: 'Preço (R$)' }).fill('10.00');
    await page.waitForTimeout(2000);
    
    await page.locator('div:has-text("Categoria")').getByRole('combobox').click();
    await page.waitForTimeout(2000);
    await page.getByRole('option', { name: 'Teste' }).first().click();
    await page.waitForTimeout(2000);
    
    await page.getByRole('button', { name: 'Salvar' }).click();
    await page.waitForTimeout(2000);
    
    // Verifica se NÃO salvou e mostra erro
   await expect(page.getByRole('dialog')).toBeVisible();
  });

   test('deve bloquear item com nome vazio', async ({ page }) => {
    test.setTimeout(60000);
    
    await page.getByRole('button', { name: /Adicionar Item/i }).click();
    await page.waitForTimeout(3000);
    
    await page.getByRole('textbox', { name: 'Nome do Item' }).fill('');
    await page.waitForTimeout(3000);
    await page.getByPlaceholder('Escreva a descrição do item').fill('Descrição válida');
    await page.waitForTimeout(3000);
    await page.getByRole('spinbutton', { name: 'Preço (R$)' }).fill('15.50');
    await page.waitForTimeout(3000);
    
    await page.locator('div:has-text("Categoria")').getByRole('combobox').click();
    await page.waitForTimeout(3000);
    await page.getByRole('option', { name: 'Teste' }).first().click();
    await page.waitForTimeout(3000);
    
    await page.getByRole('button', { name: 'Salvar' }).click();
    await page.waitForTimeout(5000);
    
    // Verifica se mostra mensagem de erro
   await expect(page.getByRole('dialog')).toBeVisible();
  });
 
});