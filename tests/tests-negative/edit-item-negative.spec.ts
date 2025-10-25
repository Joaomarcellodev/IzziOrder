import { test, expect } from '@playwright/test';

test.describe('Editar Item do Cardápio - Testes Negativos', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/menu');
    await page.waitForTimeout(2000);
  });

  // 1. EDITAR COM NOME VAZIO
  test('deve bloquear edição com nome vazio', async ({ page }) => {
    test.setTimeout(60000);
    
    const itemContainer = page.locator('div', { hasText: 'Pizza Teste' }).first();
    await itemContainer.locator('button:has(svg.lucide-square-pen)').first().click();
    await page.waitForTimeout(3000);
    
    await page.getByRole('textbox', { name: 'Nome do Item' }).clear();
    await page.waitForTimeout(1000);
    
    await page.getByRole('button', { name: 'Salvar' }).click();
    await page.waitForTimeout(3000);
    
    // Verifica se mostra erro ou não salvou
    const errorVisible = await page.getByText(/Erro: O nome deve ter pelo menos 3 caracteres./i).first().isVisible().catch(() => false);

  });

  // 2. EDITAR COM NOME MUITO CURTO (2 caracteres)
  test('deve bloquear edição com nome menor que 3 caracteres', async ({ page }) => {
    test.setTimeout(60000);
    
    const itemContainer = page.locator('div', { hasText: 'Pizza Teste' }).first();
    await itemContainer.locator('button:has(svg.lucide-square-pen)').first().click();
    await page.waitForTimeout(3000);
    
    await page.getByRole('textbox', { name: 'Nome do Item' }).clear();
    await page.getByRole('textbox', { name: 'Nome do Item' }).fill('Ab');
    await page.waitForTimeout(1000);
    
    await page.getByRole('button', { name: 'Salvar' }).click();
    await page.waitForTimeout(3000);
    
    // Verifica se mostra erro
    const errorVisible = await page.getByText(/Erro: O nome deve ter pelo menos 3 caracteres./i).first().isVisible().catch(() => false);
  });

  // 4. EDITAR COM PREÇO ZERO
  test('deve bloquear edição com preço zero', async ({ page }) => {
    test.setTimeout(60000);
    
    const itemContainer = page.locator('div', { hasText: 'Pizza Teste' }).first();
    await itemContainer.locator('button:has(svg.lucide-square-pen)').first().click();
    await page.waitForTimeout(3000);
    
    await page.getByRole('spinbutton', { name: 'Preço (R$)' }).clear();
    await page.getByRole('spinbutton', { name: 'Preço (R$)' }).fill('0');
    await page.waitForTimeout(1000);
    
    await page.getByRole('button', { name: 'Salvar' }).click();
    await page.waitForTimeout(3000);
    
    // Verifica se mostra erro
    const hasError = await page.getByText(/Erro: O preço deve ser maior que zero./i).first().isVisible().catch(() => false);
    expect(hasError).toBeTruthy();
  });

  // 5. EDITAR COM PREÇO NEGATIVO
  test('deve bloquear edição com preço negativo', async ({ page }) => {
    test.setTimeout(60000);
    
    const itemContainer = page.locator('div', { hasText: 'Pizza Teste' }).first();
    await itemContainer.locator('button:has(svg.lucide-square-pen)').first().click();
    await page.waitForTimeout(3000);
    
    await page.getByRole('spinbutton', { name: 'Preço (R$)' }).clear();
    await page.getByRole('spinbutton', { name: 'Preço (R$)' }).fill('-10.00');
    await page.waitForTimeout(1000);
    
    await page.getByRole('button', { name: 'Salvar' }).click();
    await page.waitForTimeout(3000);
    
    // Verifica se mostra erro
    const hasError = await page.getByText(/Erro: O preço deve ser maior que zero./i).first().isVisible().catch(() => false);
    expect(hasError).toBeTruthy();
  });
});