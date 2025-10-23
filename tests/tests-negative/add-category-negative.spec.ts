import { test, expect } from '@playwright/test';

test.describe('Adicionar Categoria - Testes Negativos', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/menu');
    await page.waitForTimeout(2000);
  });

  // 1. CATEGORIA COM NOME VAZIO
  test('deve bloquear categoria com nome vazio', async ({ page }) => {
    await page.getByRole('button', { name: /Adicionar Categoria/i }).click();
    await page.waitForTimeout(2000);
    
    await page.getByRole('textbox', { name: /nome da categoria/i }).fill('');
    await page.waitForTimeout(1000);
    
    await page.getByRole('button', { name: /salvar|criar|adicionar/i }).click();
    await page.waitForTimeout(2000);
    
    // Verifica se mostra mensagem de erro ou botão continua disabled
    await expect(page.getByText(/Categoria precisa de nome!/i).first()).toBeVisible();
  });

   // 4. CATEGORIA COM NOME DUPLICADO
  test('deve bloquear categoria com nome duplicado', async ({ page }) => {
    // Primeiro cria uma categoria
    await page.getByRole('button', { name: /Adicionar Categoria/i }).click();
    await page.waitForTimeout(2000);
    
    await page.getByRole('textbox', { name: /nome da categoria/i }).fill('Categoria Duplicada');
    await page.waitForTimeout(1000);
    
    await page.getByRole('button', { name: /salvar|criar|adicionar/i }).click();
    await page.waitForTimeout(3000);
    
    // Tenta criar outra com o mesmo nome
    await page.getByRole('button', { name: /Adicionar Categoria/i }).click();
    await page.waitForTimeout(2000);
    
    await page.getByRole('textbox', { name: /nome da categoria/i }).fill('Categoria Duplicada');
    await page.waitForTimeout(1000);
    
    await page.getByRole('button', { name: /salvar|criar|adicionar/i }).click();
    await page.waitForTimeout(2000);
    
    // Verifica mensagem de duplicação
    await expect(page.getByText(/Erro ao adicionar a categoria "Categoria Duplicada"!/i).first()).toBeVisible();
  });
});