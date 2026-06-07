import { test, expect } from '@playwright/test';

test.describe('Imprimir Cardápio', () => {

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

  test('deve exibir o botão de imprimir cardápio', async ({ page }) => {
    await page.getByRole('button', { name: /Ferramentas/i }).click();
    const printButton = page.getByRole('button', { name: /Imprimir Cardápio/i });
    await expect(printButton).toBeVisible();
  });

  test('deve abrir nova janela exibindo o carregamento e depois o PDF gerado', async ({ page, context }) => {
    await page.getByRole('button', { name: /Ferramentas/i }).click();

    // Escuta a abertura de nova página/aba
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('button', { name: /Imprimir Cardápio/i }).click(),
    ]);

    await newPage.waitForLoadState();

    // 1. Verifica se a página começa mostrando o loader de "Gerando Cardápio..."
    const title = await newPage.title();
    expect(title).toBe('Gerando Cardápio...');
    
    // Verifica se a mensagem de carregamento aparece no body original
    await expect(newPage.locator('h2')).toContainText('Gerando seu cardápio...');

    // 2. Aguarda a conversão do PDF que vai trocar a URL para um blob:
    // O timeout é maior porque gerar PDF em testes de CI pode demorar um pouquinho
    await expect(async () => {
      const url = newPage.url();
      expect(url).toMatch(/^blob:http:\/\/localhost:3001\/.+/);
    }).toPass({ timeout: 15000 });
  });


});
