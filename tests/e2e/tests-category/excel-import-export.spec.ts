import { test, expect } from '@playwright/test';
import * as ExcelJS from 'exceljs';

test.describe('Importação e Exportação Excel', () => {

  test.beforeEach(async ({ page }) => {
    test.setTimeout(120000);
    await page.goto('http://localhost:3001/login');
    await page.waitForTimeout(2000);
    await page.getByRole('textbox', { name: /e-mail/i }).fill('usuario@teste.com');
    await page.getByRole('textbox', { name: /senha/i }).fill('senhatesteA1');
    await page.locator('button.bg-blue-600').click();
    await page.waitForURL('**/auth/**', { timeout: 120000 });
    await page.waitForTimeout(3000);

    await page.goto('http://localhost:3001/auth/menu');
    await page.waitForTimeout(3000);
  });

  test('deve exibir o botão Ferramentas e as opções de Exportar e Importar', async ({ page }) => {
    const toolsButton = page.getByRole('button', { name: /Ferramentas/i });
    await expect(toolsButton).toBeVisible();

    await toolsButton.click();

    const exportOption = page.getByRole('button', { name: /Exportar Cardápio/i });
    const importOption = page.getByRole('button', { name: /Importar Cardápio/i });

    await expect(exportOption).toBeVisible();
    await expect(importOption).toBeVisible();
  });

  test('deve baixar o arquivo excel de cardápio', async ({ page }) => {
    const toolsButton = page.getByRole('button', { name: /Ferramentas/i });
    await toolsButton.click();

    const exportOption = page.getByRole('button', { name: /Exportar Cardápio/i });
    
    // Start waiting for download before clicking. Note no await.
    const downloadPromise = page.waitForEvent('download');
    await exportOption.click();
    const download = await downloadPromise;

    // Check filename starts with cardapio_ and ends with .xlsx
    expect(download.suggestedFilename()).toMatch(/^cardapio_.*\.xlsx$/);
  });

  test('deve importar um arquivo excel de cardápio com sucesso', async ({ page }) => {
    // 1. Criar o Excel falso na memória
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Cardápio');
    sheet.addRow(['ID (Não alterar)', 'Categoria', 'Nome', 'Descrição', 'Preço']);
    sheet.addRow(['', 'Lanches E2E', 'Hambúrguer E2E', 'Teste E2E Import', 25.50]);
    
    // Obter buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // 2. Navegar e clicar em Ferramentas
    const toolsButton = page.getByRole('button', { name: /Ferramentas/i });
    await expect(toolsButton).toBeVisible();
    await toolsButton.click();
    
    // Configurar o file chooser ANTES de clicar na opção que abre o input
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: /Importar Cardápio/i }).click();
    const fileChooser = await fileChooserPromise;

    // 3. Injetar o arquivo no input via Playwright
    await fileChooser.setFiles({
      name: 'cardapio_teste_e2e.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer: Buffer.from(buffer)
    });

    // 4. Como a página faz window.location.reload(), o toast some muito rápido.
    // Vamos esperar a página recarregar e verificar se o novo item foi renderizado na tela.
    await page.waitForURL('**/auth/menu');
    const newItemLocator = page.getByText('Hambúrguer E2E');
    await expect(newItemLocator).toBeVisible({ timeout: 15000 });
  });
});
