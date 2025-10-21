import { test, expect } from '@playwright/test';

test.describe('Adicionar Item - Testes Críticos', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/menu');
  });

  // 1. FLUXO PRINCIPAL
test('deve adicionar item com dados válidos', async ({ page }) => {
  test.setTimeout(60000);
  await page.getByRole('button', { name: /Adicionar Item/i }).click();
  await page.waitForTimeout(3000);
  
  // Preenche nome
  await page.getByRole('textbox', { name: 'Nome do Item' }).fill('Pizza Teste');
  await page.waitForTimeout(5000);
  // CORREÇÃO: Preenche descrição
  await page.getByPlaceholder('Escreva a descrição do item').fill('Pizza de teste criada automaticamente');
  await page.waitForTimeout(5000);
  // Preenche preço
  await page.getByRole('spinbutton', { name: 'Preço (R$)' }).fill('35.90');
  await page.waitForTimeout(5000);
  // Seleciona categoria
  await page.locator('div:has-text("Categoria")').getByRole('combobox').click();
  await page.getByRole('option', { name: 'Teste' }).click();
  await page.waitForTimeout(5000);
  // Salva
  await page.getByRole('button', { name: 'Salvar' }).click();
  await page.waitForTimeout(5000);
  await expect(page.getByText('Pizza Teste').first()).toBeVisible();
});
   
     // 2. ITEM COM NOME NO LIMITE MÍNIMO (3 caracteres)
  test('deve adicionar item com nome de 3 caracteres', async ({ page }) => {
    test.setTimeout(60000);
    await page.getByRole('button', { name: /Adicionar Item/i }).click();
    await page.waitForTimeout(3000);
    
    await page.getByRole('textbox', { name: 'Nome do Item' }).fill('Chá');
    await page.waitForTimeout(3000);
    await page.getByPlaceholder('Escreva a descrição do item').fill('Cha de Boldo');
    await page.waitForTimeout(3000);
    await page.getByRole('spinbutton', { name: 'Preço (R$)' }).fill('5.00');
    await page.waitForTimeout(3000);
    
    await page.locator('div:has-text("Categoria")').getByRole('combobox').click();
    await page.getByRole('option', { name: 'Bebidas' }).click();
    await page.waitForTimeout(3000);
    
    await page.getByRole('button', { name: 'Salvar' }).click();
    await page.waitForTimeout(3000);
    
    await expect(page.getByText('Caf').first()).toBeVisible();
  });

  // 3. ITEM COM DESCRIÇÃO NO LIMITE MÍNIMO (3 caracteres)
  test('deve adicionar item com descrição de 3 caracteres', async ({ page }) => {
    test.setTimeout(60000);
    await page.getByRole('button', { name: /Adicionar Item/i }).click();
    await page.waitForTimeout(3000);
    
    await page.getByRole('textbox', { name: 'Nome do Item' }).fill('Chá Verde');
    await page.waitForTimeout(3000);
    await page.getByPlaceholder('Escreva a descrição do item').fill('que');
    await page.waitForTimeout(3000);
    await page.getByRole('spinbutton', { name: 'Preço (R$)' }).fill('8.50');
    await page.waitForTimeout(3000);
    
    await page.locator('div:has-text("Categoria")').getByRole('combobox').click();
    await page.waitForTimeout(3000);
    await page.getByRole('option', { name: 'Bebidas' }).click();
    
    await page.getByRole('button', { name: 'Salvar' }).click();
    
    await expect(page.getByText('Chá Verde').first()).toBeVisible();
  });

  // 4. ITEM COM PREÇO INTEIRO (SEM CENTAVOS)
      test('deve adicionar item com preço inteiro', async ({ page }) => {
        test.setTimeout(60000);
    await page.getByRole('button', { name: /Adicionar Item/i }).click();
    await page.waitForTimeout(3000);
    
    await page.getByRole('textbox', { name: 'Nome do Item' }).fill('Água Mineral');
    await page.waitForTimeout(3000);
    await page.getByPlaceholder('Escreva a descrição do item').fill('Água sem gás 500ml');
    await page.waitForTimeout(3000);
    await page.getByRole('spinbutton', { name: 'Preço (R$)' }).fill('4');
    await page.waitForTimeout(3000);
    
    await page.locator('div:has-text("Categoria")').getByRole('combobox').click();
    await page.waitForTimeout(3000);
    await page.getByRole('option', { name: 'Bebidas' }).click();
    
    await page.getByRole('button', { name: 'Salvar' }).click();
    
    await expect(page.getByText('Água Mineral').first()).toBeVisible();
  });
 
   // 7. PREÇO MÍNIMO VÁLIDO (R$ 0.01)
  test('deve adicionar item com preço mínimo válido', async ({ page }) => {
    test.setTimeout(60000);
    
    await page.getByRole('button', { name: /Adicionar Item/i }).click();
    await page.waitForTimeout(3000);
    
    await page.getByRole('textbox', { name: 'Nome do Item' }).fill('Item Promocional');
    await page.waitForTimeout(3000);
    
    await page.getByPlaceholder('Escreva a descrição do item').fill('Item com preço simbólico');
    await page.waitForTimeout(3000);
    
    await page.getByRole('spinbutton', { name: 'Preço (R$)' }).fill('0.01');
    await page.waitForTimeout(3000);
    
    await page.locator('div:has-text("Categoria")').getByRole('combobox').click();
    await page.waitForTimeout(3000);
    
    await page.getByRole('option', { name: 'Teste' }).click();
    await page.waitForTimeout(3000);
    
    await page.getByRole('button', { name: 'Salvar' }).click();
    await page.waitForTimeout(5000);
    
    await expect(page.getByText('Item Promocional').first()).toBeVisible();

  // CORREÇÃO: Use first() e foque apenas na verificação principal
  await expect(page.getByText('Item Promocional').first()).toBeVisible();
  
  // Opcional: Se quiser verificar o preço, use first() também
  await expect(page.getByText('R$ 0.01').first()).toBeVisible();
  });

   // 7. PREÇO ALTO (LIMITE SUPERIOR)
  test('deve adicionar item com preço alto', async ({ page }) => {
    test.setTimeout(60000);
    
    await page.getByRole('button', { name: /Adicionar Item/i }).click();
    await page.waitForTimeout(3000);
    
    await page.getByRole('textbox', { name: 'Nome do Item' }).fill('Menu Degustação Premium');
    await page.waitForTimeout(3000);
    
    await page.getByPlaceholder('Escreva a descrição do item').fill('Menu especial com 7 pratos');
    await page.waitForTimeout(3000);
    
    await page.getByRole('spinbutton', { name: 'Preço (R$)' }).fill('999.99');
    await page.waitForTimeout(3000);
    
    await page.locator('div:has-text("Categoria")').getByRole('combobox').click();
    await page.waitForTimeout(3000);
    
    await page.getByRole('option', { name: 'Teste' }).click();
    await page.waitForTimeout(3000);
    
    await page.getByRole('button', { name: 'Salvar' }).click();
    await page.waitForTimeout(5000);
    
    await expect(page.getByText('Menu Degustação Premium').first()).toBeVisible();
    await expect(page.getByText('R$ 999.99')).toBeVisible();
  });

});