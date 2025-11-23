import { test, expect, Page } from '@playwright/test';

test.describe('Editar Item do Cardápio - Testes Negativos', () => {
  let itemDeTeste: string = '';

  // PREPARAÇÃO (executa antes de CADA teste)
  test.beforeEach(async ({ page }) => {
    console.log('Preparando ambiente de teste...');

    // FAZER LOGIN
    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(2000);
    await page.getByRole('textbox', { name: /e-mail/i }).fill('usuario@teste.com');
    await page.getByRole('textbox', { name: /senha/i }).fill('senhateste');
    await page.locator('button.bg-blue-600').click();
    await page.waitForURL('**/auth/**', { timeout: 15000 });
    await page.waitForTimeout(3000);

    // IR PARA O MENU E CRIAR ITEM
    await page.goto('http://localhost:3000/auth/menu');
    await page.waitForTimeout(2000);

    itemDeTeste = 'Item Para Teste Negativo';

    await page.getByRole('button', { name: /Adicionar Item/i }).click();
    await page.waitForTimeout(2000);
    await page.getByRole('textbox', { name: 'Nome do Item' }).fill(itemDeTeste);
    await page.getByPlaceholder('Escreva a descrição do item').fill('Item para testes negativos');
    await page.getByRole('spinbutton', { name: 'Preço (R$)' }).fill('35.50');
    await page.locator('div:has-text("Categoria")').getByRole('combobox').click();
    await page.waitForTimeout(1000);
    await page.getByRole('option').first().click();
    await page.getByRole('button', { name: 'Salvar' }).click();
    await page.waitForTimeout(5000);

    console.log('Item criado: ' + itemDeTeste);
  });

  // LIMPEZA SIMPLIFICADA
  test.afterEach(async ({ page }) => {
    console.log('Limpando item de teste: ' + itemDeTeste);
    
    if (!page.url().includes('/auth/menu')) {
      await page.goto('http://localhost:3000/auth/menu');
      await page.waitForTimeout(2000);
    }

    if (itemDeTeste) {
      await page.locator('button:has(svg.lucide-trash)').last().click();
      await page.waitForTimeout(1000);

      const botaoConfirmar = page.getByRole('button', { name: /excluir|confirmar|sim/i });
      if (await botaoConfirmar.isVisible({ timeout: 2000 })) {
        await botaoConfirmar.click();
        await page.waitForTimeout(1000);
        console.log('Item excluído: ' + itemDeTeste);
      }
    }
  });

  // 1. EDITAR COM NOME VAZIO
  test('deve bloquear edição com nome vazio', async ({ page }) => {
    test.setTimeout(60000);
    console.log('Teste 1 - Tentando editar com NOME VAZIO');

    const itemContainer = page.locator('div, li, article, section')
      .filter({ hasText: itemDeTeste })
      .filter({ hasText: /R\$/ })
      .filter({ has: page.locator('button:has(svg.lucide-square-pen)') })
      .last();

    await itemContainer.locator('button:has(svg.lucide-square-pen)').first().click();
    await page.waitForTimeout(2000);

    await page.getByRole('textbox', { name: 'Nome do Item' }).clear();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'Salvar' }).click();
    await page.waitForTimeout(3000);

    const aindaNoModal = await page.getByRole('textbox', { name: 'Nome do Item' }).isVisible();
    expect(aindaNoModal).toBeTruthy();

    console.log('Edição com nome vazio foi bloqueada corretamente');
    await page.getByRole('button', { name: /cancelar/i }).first().click();
    await page.waitForTimeout(2000);
  });

  // 2. EDITAR COM PREÇO ZERO
  test('deve bloquear edição com preço zero', async ({ page }) => {
    test.setTimeout(60000);
    console.log('Teste 2 - Tentando editar com PREÇO ZERO');

    const itemContainer = page.locator('div, li, article, section')
      .filter({ hasText: itemDeTeste })
      .filter({ hasText: /R\$/ })
      .filter({ has: page.locator('button:has(svg.lucide-square-pen)') })
      .last();

    await itemContainer.locator('button:has(svg.lucide-square-pen)').first().click();
    await page.waitForTimeout(2000);

    await page.getByRole('spinbutton', { name: 'Preço (R$)' }).clear();
    await page.getByRole('spinbutton', { name: 'Preço (R$)' }).fill('0');
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'Salvar' }).click();
    await page.waitForTimeout(3000);

    const aindaNoModal = await page.getByRole('spinbutton', { name: 'Preço (R$)' }).isVisible();
    expect(aindaNoModal).toBeTruthy();

    console.log('Edição com preço zero foi bloqueada corretamente');
    await page.getByRole('button', { name: /cancelar/i }).first().click();
    await page.waitForTimeout(2000);
  });

  // 3. EDITAR COM PREÇO NEGATIVO
  test('deve bloquear edição com preço negativo', async ({ page }) => {
    test.setTimeout(60000);
    console.log('Teste 3 - Tentando editar com PREÇO NEGATIVO');

    const itemContainer = page.locator('div, li, article, section')
      .filter({ hasText: itemDeTeste })
      .filter({ hasText: /R\$/ })
      .filter({ has: page.locator('button:has(svg.lucide-square-pen)') })
      .last();

    await itemContainer.locator('button:has(svg.lucide-square-pen)').first().click();
    await page.waitForTimeout(2000);

    await page.getByRole('spinbutton', { name: 'Preço (R$)' }).clear();
    await page.getByRole('spinbutton', { name: 'Preço (R$)' }).fill('-10');
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'Salvar' }).click();
    await page.waitForTimeout(3000);

    const aindaNoModal = await page.getByRole('spinbutton', { name: 'Preço (R$)' }).isVisible();
    expect(aindaNoModal).toBeTruthy();

    console.log('Edição com preço negativo foi bloqueada corretamente');
    await page.getByRole('button', { name: /cancelar/i }).first().click();
    await page.waitForTimeout(2000);
  });
});