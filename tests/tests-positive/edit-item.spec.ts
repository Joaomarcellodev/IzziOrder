import { test, expect } from '@playwright/test';

test.describe('Editar Item do Cardápio - Testes Positivos', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/menu');
    await page.waitForTimeout(2000);
  });

    // 1. EDITAR NOME DO ITEM - CORRIGIDO
  test('deve editar nome do item existente', async ({ page }) => {
    test.setTimeout(60000);
    
    // Encontra o container específico do item "Pizza Teste"
    const itemContainer = page.locator('div', { hasText: 'Pizza Teste' }).first();
    
    // Clica no primeiro botão de edição dentro desse container específico
    await itemContainer.locator('button:has(svg.lucide-square-pen)').first().click();
    await page.waitForTimeout(3000);
    
    // Agora preenche o formulário de edição
    await page.getByRole('textbox', { name: 'Nome do Item' }).click();
    await page.waitForTimeout(1000);
    
    await page.getByRole('textbox', { name: 'Nome do Item' }).clear();
    await page.waitForTimeout(1000);
    
    await page.getByRole('textbox', { name: 'Nome do Item' }).fill('Pizza Teste Atualizada');
    await page.waitForTimeout(1000);
    
    await page.getByRole('button', { name: 'Salvar' }).click();
    await page.waitForTimeout(5000);
    
    // Verifica se o nome foi atualizado
    await expect(page.getByText('Pizza Teste Atualizada').first()).toBeVisible();
  });

  // 2. EDITAR PREÇO DO ITEM
  test('deve editar preço do item existente', async ({ page }) => {
    test.setTimeout(60000);
    
    const itemContainer = page.locator('div', { hasText: 'Pizza Teste' }).first();
    await itemContainer.locator('button:has(svg.lucide-square-pen)').first().click();
    await page.waitForTimeout(3000);
    
    await page.getByRole('spinbutton', { name: 'Preço (R$)' }).clear();
    await page.waitForTimeout(1000);
    
    await page.getByRole('spinbutton', { name: 'Preço (R$)' }).fill('45.90');
    await page.waitForTimeout(1000);
    
    await page.getByRole('button', { name: 'Salvar' }).click();
    await page.waitForTimeout(5000);
    
    await expect(page.getByText('Pizza Teste Atualizada').first()).toBeVisible();
  });

  // 3. EDITAR DESCRIÇÃO DO ITEM
  test('deve editar descrição do item existentee', async ({ page }) => {
    test.setTimeout(60000);
    
    await page.getByText('Pizza Teste').first().click();
    await page.waitForTimeout(2000);
    
    await page.getByPlaceholder('Escreva a descrição do item').clear();
    await page.waitForTimeout(1000);
    
    await page.getByPlaceholder('Escreva a descrição do item').fill('Pizza atualizada com novos ingredientes');
    await page.waitForTimeout(1000);
    
    await page.getByRole('button', { name: 'Salvar' }).click();
    await page.waitForTimeout(3000);
    
    // Verifica se a descrição foi atualizada (pode precisar abrir detalhes do item)
    await expect(page.getByText('Pizza atualizada com novos ingredientes')).toBeVisible();
  });

});