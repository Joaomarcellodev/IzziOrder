import { test, expect } from '@playwright/test';

test.describe('Imprimir Cardápio', () => {

  test.beforeEach(async ({ page }) => {
    test.setTimeout(120000);
    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(2000);
    await page.getByRole('textbox', { name: /e-mail/i }).fill('usuario@teste.com');
    await page.getByRole('textbox', { name: /senha/i }).fill('senhatesteA1');
    await page.locator('button.bg-blue-600').click();
    await page.waitForURL('**/auth/**', { timeout: 120000 });
    await page.waitForTimeout(3000);

    await page.goto('http://localhost:3000/auth/menu');
    await page.waitForTimeout(3000);
  });

  test('deve exibir o botão de imprimir cardápio', async ({ page }) => {
    const printButton = page.getByRole('button', { name: /Imprimir Cardápio/i });
    await expect(printButton).toBeVisible();
  });

  test('deve abrir nova janela ao clicar em Imprimir Cardápio', async ({ page, context }) => {
    // Escuta a abertura de nova página/aba
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('button', { name: /Imprimir Cardápio/i }).click(),
    ]);

    await newPage.waitForLoadState('domcontentloaded');
    await newPage.waitForTimeout(2000);

    // Verifica que a nova página tem o título do cardápio
    const title = await newPage.title();
    expect(title).toBe('Cardápio');
  });

  test('deve exibir o cabeçalho do cardápio na página de impressão', async ({ page, context }) => {
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('button', { name: /Imprimir Cardápio/i }).click(),
    ]);

    await newPage.waitForLoadState('domcontentloaded');
    await newPage.waitForTimeout(2000);

    // Verifica cabeçalho
    await expect(newPage.locator('.header h1')).toContainText('Cardápio');

    // Verifica data de atualização
    await expect(newPage.locator('.header p')).toContainText('Atualizado em');
  });

  test('deve exibir itens do menu agrupados por categoria', async ({ page, context }) => {
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('button', { name: /Imprimir Cardápio/i }).click(),
    ]);

    await newPage.waitForLoadState('domcontentloaded');
    await newPage.waitForTimeout(2000);

    // Verifica que existem seções de categoria
    const categorySections = newPage.locator('.category-section');
    const count = await categorySections.count();
    expect(count).toBeGreaterThan(0);

    // Verifica que existem itens de menu
    const menuItems = newPage.locator('.menu-item');
    const itemCount = await menuItems.count();
    expect(itemCount).toBeGreaterThan(0);
  });

  test('deve exibir nomes e preços dos itens', async ({ page, context }) => {
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('button', { name: /Imprimir Cardápio/i }).click(),
    ]);

    await newPage.waitForLoadState('domcontentloaded');
    await newPage.waitForTimeout(2000);

    // Verifica que todos os itens têm nome e preço
    const firstItem = newPage.locator('.menu-item').first();
    await expect(firstItem.locator('.item-name')).not.toBeEmpty();
    await expect(firstItem.locator('.item-price')).toContainText('R$');
  });

  test('deve exibir botão de imprimir na página de impressão', async ({ page, context }) => {
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('button', { name: /Imprimir Cardápio/i }).click(),
    ]);

    await newPage.waitForLoadState('domcontentloaded');
    await newPage.waitForTimeout(2000);

    // Verifica que o botão de imprimir existe na nova página
    const printBtn = newPage.locator('.print-btn');
    await expect(printBtn).toBeVisible();
    await expect(printBtn).toContainText('Imprimir Cardápio');
  });

  test('deve exibir o rodapé com créditos do IzziOrder', async ({ page, context }) => {
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('button', { name: /Imprimir Cardápio/i }).click(),
    ]);

    await newPage.waitForLoadState('domcontentloaded');
    await newPage.waitForTimeout(2000);

    await expect(newPage.locator('.footer')).toContainText('IzziOrder');
  });
});
