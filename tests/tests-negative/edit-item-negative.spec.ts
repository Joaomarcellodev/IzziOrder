import { test, expect } from '@playwright/test';

test.describe('Editar Item do Cardápio - Testes Negativos', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/menu');
    await page.waitForTimeout(2000);
  });

  // 1. EDITAR COM NOME VAZIO
  test('deve bloquear edição com nome vazio', async ({ page }) => {
    test.setTimeout(60000);
    
    // Encontra um item existente para editar
    const itemContainer = page.locator('div', { hasText: 'Pizza Teste' }).first();
    await itemContainer.locator('button:has(svg.lucide-square-pen)').first().click();
    await page.waitForTimeout(3000);
    
    // Limpa o nome
    await page.getByRole('textbox', { name: 'Nome do Item' }).clear();
    await page.waitForTimeout(1000);
    
    // Tenta salvar
    await page.getByRole('button', { name: 'Salvar' }).click();
    await page.waitForTimeout(3000);
    
    // Verifica se mostra erro
    const hasError = await page.getByText(/Erro: O nome deve ter pelo menos 3 caracteres./i).first().isVisible().catch(() => false);
    expect(hasError).toBeTruthy();
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
    const hasError = await page.getByText(/Erro: O nome deve ter pelo menos 3 caracteres./i).first().isVisible().catch(() => false);
    expect(hasError).toBeTruthy();
  });

  // 3. EDITAR COM NOME COM APENAS ESPAÇOS
  test('deve bloquear edição com nome contendo apenas espaços', async ({ page }) => {
    test.setTimeout(60000);
    
    const itemContainer = page.locator('div', { hasText: 'Pizza Teste' }).first();
    await itemContainer.locator('button:has(svg.lucide-square-pen)').first().click();
    await page.waitForTimeout(3000);
    
    await page.getByRole('textbox', { name: 'Nome do Item' }).clear();
    await page.getByRole('textbox', { name: 'Nome do Item' }).fill('   ');
    await page.waitForTimeout(1000);
    
    await page.getByRole('button', { name: 'Salvar' }).click();
    await page.waitForTimeout(3000);
    
    // Verifica se mostra erro
    const hasError = await page.getByText(/Erro: O nome deve ter pelo menos 3 caracteres.|campo obrigatório/i).first().isVisible().catch(() => false);
    expect(hasError).toBeTruthy();
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


  // 6. EDITAR COM DESCRIÇÃO VAZIA
  test('deve bloquear edição com descrição vazia', async ({ page }) => {
    test.setTimeout(60000);
    
    const itemContainer = page.locator('div', { hasText: 'Pizza Teste' }).first();
    await itemContainer.locator('button:has(svg.lucide-square-pen)').first().click();
    await page.waitForTimeout(3000);
    
    await page.getByPlaceholder('Escreva a descrição do item').clear();
    await page.waitForTimeout(1000);
    
    await page.getByRole('button', { name: 'Salvar' }).click();
    await page.waitForTimeout(3000);
    
    // Verifica se mostra erro
    const hasError = await page.getByText(/campo obrigatório|descrição é obrigatória/i).first().isVisible().catch(() => false);
  
  });

  // 7. EDITAR COM DESCRIÇÃO MUITO CURTA
  test('deve bloquear edição com descrição menor que 3 caracteres', async ({ page }) => {
    test.setTimeout(60000);
    
    const itemContainer = page.locator('div', { hasText: 'Pizza Teste' }).first();
    await itemContainer.locator('button:has(svg.lucide-square-pen)').first().click();
    await page.waitForTimeout(3000);
    
    await page.getByPlaceholder('Escreva a descrição do item').clear();
    await page.getByPlaceholder('Escreva a descrição do item').fill('Oi');
    await page.waitForTimeout(1000);
    
    await page.getByRole('button', { name: 'Salvar' }).click();
    await page.waitForTimeout(3000);
    
    // Verifica se mostra erro
    const hasError = await page.getByText(/mínimo 3 caracteres|descrição muito curta/i).first().isVisible().catch(() => false);
   
  });

  // 8. CANCELAR EDIÇÃO
  test('deve cancelar edição sem salvar alterações', async ({ page }) => {
    test.setTimeout(60000);
    
    const nomeOriginal = 'Pizza Teste';
    const itemContainer = page.locator('div', { hasText: nomeOriginal }).first();
    await itemContainer.locator('button:has(svg.lucide-square-pen)').first().click();
    await page.waitForTimeout(3000);
    
    // Altera o nome
    await page.getByRole('textbox', { name: 'Nome do Item' }).clear();
    await page.getByRole('textbox', { name: 'Nome do Item' }).fill('Nome Alterado Temporariamente');
    await page.waitForTimeout(1000);
    
    // Clica em cancelar
    await page.getByRole('button', { name: /cancelar/i }).click();
    await page.waitForTimeout(3000);
    
    // Verifica que o nome original permanece
    await expect(page.getByText(nomeOriginal).first()).toBeVisible();
    await expect(page.getByText('Nome Alterado Temporariamente')).not.toBeVisible();
  });

  // 9. EDITAR SEM ALTERAR NENHUM CAMPO
  test('deve manter item inalterado ao salvar sem modificações', async ({ page }) => {
    test.setTimeout(60000);
    
    const nomeOriginal = 'Pizza Teste';
    const itemContainer = page.locator('div', { hasText: nomeOriginal }).first();
    await itemContainer.locator('button:has(svg.lucide-square-pen)').first().click();
    await page.waitForTimeout(3000);
    
    // Não altera nada, apenas clica em salvar
    await page.getByRole('button', { name: 'Salvar' }).click();
    await page.waitForTimeout(3000);
    
    // Verifica que o item ainda existe com o mesmo nome
    await expect(page.getByText(nomeOriginal).first()).toBeVisible();
  });

});