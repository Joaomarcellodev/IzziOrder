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
 
 
  });