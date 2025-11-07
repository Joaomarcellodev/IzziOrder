import { test, expect } from '@playwright/test';

test.describe('Editar Categoria - Testes Positivos', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/menu');
    await page.waitForTimeout(2000);
  });

  // 1. EDITAR NOME DA CATEGORIA
  test('deve editar nome da categoria existente', async ({ page }) => {
    // Primeiro cria uma categoria para editar
    const categoriaOriginal = `Categoria Editar ${Date.now()}`;
    await page.getByRole('button', { name: /Adicionar Categoria/i }).click();
    await page.waitForTimeout(2000);
    
    await page.getByRole('textbox', { name: /nome da categoria/i }).fill(categoriaOriginal);
    await page.waitForTimeout(1000);
    
    await page.getByRole('button', { name: /salvar|criar|adicionar/i }).click();
    await page.waitForTimeout(3000);

    // Agora edita a categoria
    const novoNome = `Categoria Editada ${Date.now()}`;
    
    // Encontra e clica no botão de editar da categoria criada
    const categoriaItem = page.locator('div').filter({ hasText: categoriaOriginal }).first();
    await categoriaItem.getByRole('button', { name: /editar/i }).click();
    await page.waitForTimeout(2000);
    
    // Altera o nome
    await page.getByRole('textbox', { name: /nome da categoria/i }).fill(novoNome);
    await page.waitForTimeout(1000);
    
    await page.getByRole('button', { name: /salvar|atualizar/i }).click();
    await page.waitForTimeout(3000);
    
    // Verifica se o nome foi atualizado
    await expect(page.getByText(novoNome).first()).toBeVisible();
    await expect(page.getByText(categoriaOriginal)).not.toBeVisible();
  });

  // 2. EDITAR CATEGORIA COM NOME LONGO
  test('deve editar categoria com nome longo', async ({ page }) => {
    // Cria categoria temporária
    const categoriaOriginal = `Cat ${Date.now()}`;
    await page.getByRole('button', { name: /Adicionar Categoria/i }).click();
    await page.waitForTimeout(2000);
    
    await page.getByRole('textbox', { name: /nome da categoria/i }).fill(categoriaOriginal);
    await page.waitForTimeout(1000);
    
    await page.getByRole('button', { name: /salvar|criar|adicionar/i }).click();
    await page.waitForTimeout(3000);

    // Edita para nome longo
    const nomeLongo = 'Categoria com Nome Muito Longo para Teste de Edição';
    
    const categoriaItem = page.locator('div').filter({ hasText: categoriaOriginal }).first();
    await categoriaItem.getByRole('button', { name: /editar/i }).click();
    await page.waitForTimeout(2000);
    
    await page.getByRole('textbox', { name: /nome da categoria/i }).fill(nomeLongo);
    await page.waitForTimeout(1000);
    
    await page.getByRole('button', { name: /salvar|atualizar/i }).click();
    await page.waitForTimeout(3000);
    
    // Verifica se aceitou o nome longo
    await expect(page.getByText(nomeLongo).first()).toBeVisible();
  });

  // 3. CANCELAR EDIÇÃO DE CATEGORIA
  test('deve cancelar edição sem salvar alterações', async ({ page }) => {
    // Cria categoria temporária
    const categoriaOriginal = `Categoria Cancelar ${Date.now()}`;
    await page.getByRole('button', { name: /Adicionar Categoria/i }).click();
    await page.waitForTimeout(2000);
    
    await page.getByRole('textbox', { name: /nome da categoria/i }).fill(categoriaOriginal);
    await page.waitForTimeout(1000);
    
    await page.getByRole('button', { name: /salvar|criar|adicionar/i }).click();
    await page.waitForTimeout(3000);

    // Abre edição e cancela
    const categoriaItem = page.locator('div').filter({ hasText: categoriaOriginal }).first();
    await categoriaItem.getByRole('button', { name: /editar/i }).click();
    await page.waitForTimeout(2000);
    
    await page.getByRole('textbox', { name: /nome da categoria/i }).fill('Nome Alterado Cancelado');
    await page.waitForTimeout(1000);
    
    await page.getByRole('button', { name: /cancelar/i }).click();
    await page.waitForTimeout(2000);
    
    // Verifica que o nome original permanece
    await expect(page.getByText(categoriaOriginal).first()).toBeVisible();
    await expect(page.getByText('Nome Alterado Cancelado')).not.toBeVisible();
  });
});