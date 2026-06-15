import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('Drag and Drop de Imagem no Cardápio', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.getByRole('textbox', { name: /e-mail/i }).fill('usuario@teste.com');
    await page.getByRole('textbox', { name: /senha/i }).fill('senhatesteA1');
    await page.locator('button.bg-blue-600').click();
    await page.waitForURL('**/auth/**', { timeout: 15000 });
    await page.goto('http://localhost:3000/auth/menu');
    await page.waitForTimeout(2000);
  });

  test('deve atualizar a pré-visualização ao arrastar e soltar uma imagem', async ({ page }) => {
    await page.getByRole('button', { name: /Adicionar Item/i }).click();
    await page.waitForSelector('text=Novo Item');

    const filePath = path.resolve('public/x-calabresa.png');
    const buffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);

    const dropZone = page.locator('div.border-dashed');

    await dropZone.evaluate(async (node, { buffer, fileName }) => {
      const dataTransfer = new DataTransfer();
      const file = new File([new Uint8Array(buffer)], fileName, { type: 'image/png' });
      dataTransfer.items.add(file);
      
      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer
      });
      
      node.dispatchEvent(dropEvent);
    }, { buffer: Array.from(buffer), fileName });

    const previewImage = page.locator('img[alt="Pré-visualização da imagem"]');
    await expect(previewImage).toBeVisible({ timeout: 5000 });
    await expect(dropZone).not.toHaveClass(/border-\[#FD7E14\]/);
  });

  test('deve mostrar feedback visual ao arrastar imagem sobre a área', async ({ page }) => {
    await page.getByRole('button', { name: /Adicionar Item/i }).click();
    
    const dropZone = page.locator('div.border-dashed');

    // Simula o dragover dentro do navegador
    await dropZone.evaluate((node) => {
      const dragOverEvent = new DragEvent('dragover', {
        bubbles: true,
        cancelable: true,
        dataTransfer: new DataTransfer()
      });
      node.dispatchEvent(dragOverEvent);
    });

    await expect(dropZone).toHaveClass(/border-\[#FD7E14\]/);
    await expect(dropZone).toHaveClass(/bg-\[#FD7E14\]\/10/);

    // Simula o dragleave dentro do navegador
    await dropZone.evaluate((node) => {
      const dragLeaveEvent = new DragEvent('dragleave', {
        bubbles: true,
        cancelable: true
      });
      node.dispatchEvent(dragLeaveEvent);
    });

    await expect(dropZone).not.toHaveClass(/border-\[#FD7E14\]/);
  });
});
