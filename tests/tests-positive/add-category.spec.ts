import { test, expect } from '@playwright/test';

test.describe('Adicionar Categoria', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/menu');
    await page.waitForTimeout(2000);
  });

  // 1. ADICIONAR CATEGORIA BÁSICA
  test('deve adicionar categoria com nome válido', async ({ page }) => {
    test.setTimeout(60000);
    
    await page.getByRole('button', { name: /Adicionar Categoria/i }).click();
    await page.waitForTimeout(3000);
    
    await page.getByRole('textbox', { name: /nome da categoria/i }).fill('Sobremesas');
    await page.waitForTimeout(3000);
    
    await page.getByRole('button', { name: /salvar|criar|adicionar/i }).click();
    await page.waitForTimeout(5000);
    
    await expect(page.getByText('Sobremesas').first()).toBeVisible();
  });
    // 2. CATEGORIA COM NOME CONTENDO NÚMEROS
  test('deve adicionar categoria com nome contendo números', async ({ page }) => {
    test.setTimeout(60000);
    
    await page.getByRole('button', { name: /Adicionar Categoria/i }).click();
    await page.waitForTimeout(3000);
    
    await page.getByRole('textbox', { name: /nome da categoria/i }).fill('Lanches 2024');
    await page.waitForTimeout(3000);
    
    await page.getByRole('button', { name: /salvar|criar|adicionar/i }).click();
    await page.waitForTimeout(5000);
    
    await expect(page.getByText('Lanches 2024').first()).toBeVisible();
  });
      // 3. CATEGORIA COM NOME LONGO
  test('deve adicionar categoria com nome longo', async ({ page }) => {
    test.setTimeout(60000);
    
    await page.getByRole('button', { name: /Adicionar Categoria/i }).click();
    await page.waitForTimeout(3000);
    
    await page.getByRole('textbox', { name: /nome da categoria/i }).fill('Pratos Veganos e Vegetarianos');
    await page.waitForTimeout(3000);
    
    await page.getByRole('button', { name: /salvar|criar|adicionar/i }).click();
    await page.waitForTimeout(5000);
    
    await expect(page.getByText('Pratos Veganos e Vegetarianos').first()).toBeVisible();
  });

      // 4. CATEGORIA COM NOME CONTENDO HÍFEN
  test('deve adicionar categoria com nome contendo hífen', async ({ page }) => {
    test.setTimeout(60000);
    
    await page.getByRole('button', { name: /Adicionar Categoria/i }).click();
    await page.waitForTimeout(3000);
    
    await page.getByRole('textbox', { name: /nome da categoria/i }).fill('Pratos Self-Service');
    await page.waitForTimeout(3000);
    
    await page.getByRole('button', { name: /salvar|criar|adicionar/i }).click();
    await page.waitForTimeout(5000);
    
    await expect(page.getByText('Pratos Self-Service').first()).toBeVisible();
  });
        // 5. CATEGORIA COM NOME EM CAIXA ALTA
  test('deve adicionar categoria com nome em caixa alta', async ({ page }) => {
    test.setTimeout(60000);
    
    await page.getByRole('button', { name: /Adicionar Categoria/i }).click();
    await page.waitForTimeout(3000);
    
    await page.getByRole('textbox', { name: /nome da categoria/i }).fill('BEBIDAS QUENTES');
    await page.waitForTimeout(3000);
    
    await page.getByRole('button', { name: /salvar|criar|adicionar/i }).click();
    await page.waitForTimeout(5000);
    
    await expect(page.getByText('BEBIDAS QUENTES').first()).toBeVisible();
  });

     // 6. CATEGORIA COM NOME CONTENDO CARACTERES ESPECIAIS
  test('deve adicionar categoria com nome contendo caracteres especiais', async ({ page }) => {
    test.setTimeout(60000);
    
    await page.getByRole('button', { name: /Adicionar Categoria/i }).click();
    await page.waitForTimeout(3000);
    
    await page.getByRole('textbox', { name: /nome da categoria/i }).fill('Café & Chá');
    await page.waitForTimeout(3000);
    
    await page.getByRole('button', { name: /salvar|criar|adicionar/i }).click();
    await page.waitForTimeout(5000);
    
    await expect(page.getByText('Café & Chá').first()).toBeVisible();
  });

    // 7. ADICIONAR CATEGORIA E DEPOIS ITEM NELA
  test('deve adicionar categoria e depois item nela', async ({ page }) => {
    test.setTimeout(90000);
    
    
    await page.getByRole('button', { name: /Adicionar Categoria/i }).click();
    await page.waitForTimeout(3000);
    
    await page.getByRole('textbox', { name: /nome da categoria/i }).fill('Desconto');
    await page.waitForTimeout(3000);
    
    await page.getByRole('button', { name: /salvar|criar|adicionar/i }).click();
    await page.waitForTimeout(5000);
    
    await expect(page.getByText('Desconto').first()).toBeVisible();
    
    
    await page.getByRole('button', { name: /Adicionar Item/i }).click();
    await page.waitForTimeout(3000);
    
    await page.getByRole('textbox', { name: 'Nome do Item' }).fill('Item com Desconto');
    await page.waitForTimeout(3000);
    
    await page.getByPlaceholder('Escreva a descrição do item').fill('Desconto de 60%');
    await page.waitForTimeout(3000);
    
    await page.getByRole('spinbutton', { name: 'Preço (R$)' }).fill('19.90');
    await page.waitForTimeout(3000);
    
    await page.locator('div:has-text("Categoria")').getByRole('combobox').click();
    await page.waitForTimeout(3000);
    
    await page.getByRole('option', { name: 'Desconto' }).click();
    await page.waitForTimeout(3000);
    
    await page.getByRole('button', { name: 'Salvar' }).click();
    await page.waitForTimeout(5000);
    
    await expect(page.getByText('Item com Desconto').first()).toBeVisible();
  });
 
 
  });