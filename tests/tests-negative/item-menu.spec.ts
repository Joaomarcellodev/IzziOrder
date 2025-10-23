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

    // 3. DESCRIÇÃO VAZIA
  test('deve bloquear item com descrição vazia', async ({ page }) => {
    await page.getByRole('button', { name: /Adicionar Item/i }).click();
    await page.waitForTimeout(2000);
    
    await page.getByRole('textbox', { name: 'Nome do Item' }).fill('Item Válido');
    await page.waitForTimeout(1000);
    await page.getByPlaceholder('Escreva a descrição do item').fill('');
    await page.waitForTimeout(1000);
    await page.getByRole('spinbutton', { name: 'Preço (R$)' }).fill('20.00');
    await page.waitForTimeout(1000);
    
    await page.locator('div:has-text("Categoria")').getByRole('combobox').click();
    await page.waitForTimeout(1000);
    await page.getByRole('option', { name: 'Teste' }).first().click();
    await page.waitForTimeout(1000);
    
    await page.getByRole('button', { name: 'Salvar' }).click();
    await page.waitForTimeout(2000);

    await expect(page.getByRole('dialog')).toBeVisible();

  });
      // 4. DESCRIÇÃO COM MENOS DE 3 CARACTERES
  test('deve bloquear item com descrição menor que 3 caracteres', async ({ page }) => {
    await page.getByRole('button', { name: /Adicionar Item/i }).click();
    await page.waitForTimeout(2000);
    
    await page.getByRole('textbox', { name: 'Nome do Item' }).fill('Item Válido');
    await page.waitForTimeout(1000);
    await page.getByPlaceholder('Escreva a descrição do item').fill('De');
    await page.waitForTimeout(1000);
    await page.getByRole('spinbutton', { name: 'Preço (R$)' }).fill('25.00');
    await page.waitForTimeout(1000);
    
    await page.locator('div:has-text("Categoria")').getByRole('combobox').click();
    await page.waitForTimeout(1000);
    await page.getByRole('option', { name: 'Teste' }).first().click();
    await page.waitForTimeout(1000);
    
    await page.getByRole('button', { name: 'Salvar' }).click();
    await page.waitForTimeout(2000);
    await expect(page.getByRole('dialog')).toBeVisible();
  });

      // 5. PREÇO ZERO
  test('deve bloquear item com preço zero', async ({ page }) => {
    await page.getByRole('button', { name: /Adicionar Item/i }).click();
    await page.waitForTimeout(2000);
    
    await page.getByRole('textbox', { name: 'Nome do Item' }).fill('Item com Preço Zero');
    await page.waitForTimeout(1000);
    await page.getByPlaceholder('Escreva a descrição do item').fill('Descrição válida');
    await page.waitForTimeout(1000);
    await page.getByRole('spinbutton', { name: 'Preço (R$)' }).fill('0');
    await page.waitForTimeout(1000);
    
    await page.locator('div:has-text("Categoria")').getByRole('combobox').click();
    await page.waitForTimeout(1000);
    await page.getByRole('option', { name: 'Teste' }).first().click();
    await page.waitForTimeout(1000);
    
    await page.getByRole('button', { name: 'Salvar' }).click();
    await page.waitForTimeout(2000);
    
    // Verifica se mostra mensagem de erro
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  // 6. PREÇO NEGATIVO
  test('deve bloquear item com preço negativo', async ({ page }) => {
    await page.getByRole('button', { name: /Adicionar Item/i }).click();
    await page.waitForTimeout(2000);
    
    await page.getByRole('textbox', { name: 'Nome do Item' }).fill('Item com Preço Negativo');
    await page.waitForTimeout(1000);
    await page.getByPlaceholder('Escreva a descrição do item').fill('Descrição válida');
    await page.waitForTimeout(1000);
    await page.getByRole('spinbutton', { name: 'Preço (R$)' }).fill('-10.00');
    await page.waitForTimeout(1000);
    
    await page.locator('div:has-text("Categoria")').getByRole('combobox').click();
    await page.waitForTimeout(1000);
    await page.getByRole('option', { name: 'Teste' }).first().click();
    await page.waitForTimeout(1000);
    
    await page.getByRole('button', { name: 'Salvar' }).click();
    await page.waitForTimeout(2000);

    await expect(page.getByRole('dialog')).toBeVisible();

  });
    // 7. SEM CATEGORIA SELECIONADA
  test('deve bloquear item sem categoria selecionada', async ({ page }) => {
    await page.getByRole('button', { name: /Adicionar Item/i }).click();
    await page.waitForTimeout(2000);
    
    await page.getByRole('textbox', { name: 'Nome do Item' }).fill('Item Sem Categoria');
    await page.waitForTimeout(1000);
    await page.getByPlaceholder('Escreva a descrição do item').fill('Descrição válida');
    await page.waitForTimeout(1000);
    await page.getByRole('spinbutton', { name: 'Preço (R$)' }).fill('30.00');
    await page.waitForTimeout(1000);
    
    // Não seleciona categoria
    
    await page.getByRole('button', { name: 'Salvar' }).click();
    await page.waitForTimeout(2000);
    
    // Verifica se mostra mensagem de erro
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  // 8. CANCELAR CRIAÇÃO DE ITEM
  test('deve cancelar criação de item ao clicar em cancelar', async ({ page }) => {
    await page.getByRole('button', { name: /Adicionar Item/i }).click();
    await page.waitForTimeout(2000);
    
    await page.getByRole('textbox', { name: 'Nome do Item' }).fill('Item Cancelado');
    await page.waitForTimeout(1000);
    await page.getByPlaceholder('Escreva a descrição do item').fill('Descrição do item cancelado');
    await page.waitForTimeout(1000);
    await page.getByRole('spinbutton', { name: 'Preço (R$)' }).fill('40.00');
    await page.waitForTimeout(1000);
    
    await page.locator('div:has-text("Categoria")').getByRole('combobox').click();
    await page.waitForTimeout(1000);
    await page.getByRole('option', { name: 'Teste' }).first().click();
    await page.waitForTimeout(1000);
    
    await page.getByRole('button', { name: /cancelar/i }).click();
    await page.waitForTimeout(2000);
    
    // Verifica se o modal/dialog foi fechado
    await expect(page.getByRole('textbox', { name: 'Nome do Item' })).not.toBeVisible();
    
    // Verifica se o item NÃO foi criado
    await expect(page.getByText('Item Cancelado')).not.toBeVisible();
  });
});