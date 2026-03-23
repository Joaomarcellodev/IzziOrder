import { test, expect, Page } from '@playwright/test';

test.describe('Testes Negativos - Adicionar Item', () => {

  test.beforeEach(async ({ page }) => {

    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(2000);
    await page.getByRole('textbox', { name: /e-mail/i }).fill('usuario@teste.com');
    await page.getByRole('textbox', { name: /senha/i }).fill('senhatesteA1');
    await page.locator('button.bg-blue-600').click();
    await page.waitForURL('**/auth/**', { timeout: 15000 });
    await page.waitForTimeout(3000);

    await page.goto('http://localhost:3000/auth/menu');
    await page.waitForTimeout(2000);
  });

  // 1. NOME COM MENOS DE 3 CARACTERES
  test('deve bloquear item com nome menor que 3 caracteres', async ({ page }) => {
    test.setTimeout(60000);

    await page.getByRole('button', { name: /Adicionar Item/i }).click();
    await page.waitForTimeout(1000);

    await page.getByRole('textbox', { name: 'Nome do Item' }).fill('Ab');
    await page.getByPlaceholder('Escreva a descrição do item').fill('Descrição válida');
    await page.getByRole('spinbutton', { name: 'Preço (R$)' }).fill('25.00');

    await page.locator('div:has-text("Categoria")').getByRole('combobox').click();
    await page.waitForTimeout(500);
    await page.getByRole('option').first().click();

    await page.getByRole('button', { name: 'Salvar' }).click();
    await page.waitForTimeout(2000);

    const aindaNoModal = await page.getByRole('textbox', { name: 'Nome do Item' }).isVisible();
    expect(aindaNoModal).toBeTruthy();

    await page.getByRole('button', { name: /cancelar/i }).click();
  });

  // 2. ITEM COM NOME VAZIO
  test('deve bloquear item com nome vazio', async ({ page }) => {
    test.setTimeout(60000);

    await page.getByRole('button', { name: /Adicionar Item/i }).click();
    await page.waitForTimeout(1000);

    await page.getByRole('textbox', { name: 'Nome do Item' }).fill('');
    await page.getByPlaceholder('Escreva a descrição do item').fill('Descrição válida');
    await page.getByRole('spinbutton', { name: 'Preço (R$)' }).fill('25.00');

    await page.locator('div:has-text("Categoria")').getByRole('combobox').click();
    await page.waitForTimeout(500);
    await page.getByRole('option').first().click();

    await page.getByRole('button', { name: 'Salvar' }).click();
    await page.waitForTimeout(2000);

    const aindaNoModal = await page.getByRole('textbox', { name: 'Nome do Item' }).isVisible();
    expect(aindaNoModal).toBeTruthy();

    await page.getByRole('button', { name: /cancelar/i }).click();
  });

  // 3. DESCRIÇÃO VAZIA
  test('deve bloquear item com descrição vazia', async ({ page }) => {
    await page.getByRole('button', { name: /Adicionar Item/i }).click();
    await page.waitForTimeout(1000);

    await page.getByRole('textbox', { name: 'Nome do Item' }).fill('Item Válido');
    await page.getByPlaceholder('Escreva a descrição do item').fill('');
    await page.getByRole('spinbutton', { name: 'Preço (R$)' }).fill('25.00');

    await page.locator('div:has-text("Categoria")').getByRole('combobox').click();
    await page.waitForTimeout(500);
    await page.getByRole('option').first().click();

    await page.getByRole('button', { name: 'Salvar' }).click();
    await page.waitForTimeout(2000);

    const aindaNoModal = await page.getByPlaceholder('Escreva a descrição do item').isVisible();
    expect(aindaNoModal).toBeTruthy();

    await page.getByRole('button', { name: /cancelar/i }).click();
  });

  // 4. DESCRIÇÃO COM MENOS DE 3 CARACTERES
  test('deve bloquear item com descrição menor que 3 caracteres', async ({ page }) => {
    await page.getByRole('button', { name: /Adicionar Item/i }).click();
    await page.waitForTimeout(1000);

    await page.getByRole('textbox', { name: 'Nome do Item' }).fill('Item Válido');
    await page.getByPlaceholder('Escreva a descrição do item').fill('De');
    await page.getByRole('spinbutton', { name: 'Preço (R$)' }).fill('25.00');

    await page.locator('div:has-text("Categoria")').getByRole('combobox').click();
    await page.waitForTimeout(500);
    await page.getByRole('option').first().click();

    await page.getByRole('button', { name: 'Salvar' }).click();
    await page.waitForTimeout(2000);

    const aindaNoModal = await page.getByPlaceholder('Escreva a descrição do item').isVisible();
    expect(aindaNoModal).toBeTruthy();

    await page.getByRole('button', { name: /cancelar/i }).click();
  });

  // 5. PREÇO ZERO
  test('deve bloquear item com preço zero', async ({ page }) => {
    await page.getByRole('button', { name: /Adicionar Item/i }).click();
    await page.waitForTimeout(1000);

    await page.getByRole('textbox', { name: 'Nome do Item' }).fill('Item com Preço Zero');
    await page.getByPlaceholder('Escreva a descrição do item').fill('Descrição válida');
    await page.getByRole('spinbutton', { name: 'Preço (R$)' }).fill('0');

    await page.locator('div:has-text("Categoria")').getByRole('combobox').click();
    await page.waitForTimeout(500);
    await page.getByRole('option').first().click();

    await page.getByRole('button', { name: 'Salvar' }).click();
    await page.waitForTimeout(2000);

    const aindaNoModal = await page.getByRole('spinbutton', { name: 'Preço (R$)' }).isVisible();
    expect(aindaNoModal).toBeTruthy();

    await page.getByRole('button', { name: /cancelar/i }).click();
  });

  // 6. PREÇO NEGATIVO
  test('deve bloquear item com preço negativo', async ({ page }) => {
    await page.getByRole('button', { name: /Adicionar Item/i }).click();
    await page.waitForTimeout(1000);

    await page.getByRole('textbox', { name: 'Nome do Item' }).fill('Item com Preço Negativo');
    await page.getByPlaceholder('Escreva a descrição do item').fill('Descrição válida');
    await page.getByRole('spinbutton', { name: 'Preço (R$)' }).fill('-10.00');

    await page.locator('div:has-text("Categoria")').getByRole('combobox').click();
    await page.waitForTimeout(500);
    await page.getByRole('option').first().click();

    await page.getByRole('button', { name: 'Salvar' }).click();
    await page.waitForTimeout(2000);

    const aindaNoModal = await page.getByRole('spinbutton', { name: 'Preço (R$)' }).isVisible();
    expect(aindaNoModal).toBeTruthy();

    await page.getByRole('button', { name: /cancelar/i }).click();
  });

  // 7. SEM CATEGORIA SELECIONADA
  test('deve bloquear item sem categoria selecionada', async ({ page }) => {
    await page.getByRole('button', { name: /Adicionar Item/i }).click();
    await page.waitForTimeout(1000);

    await page.getByRole('textbox', { name: 'Nome do Item' }).fill('Item Sem Categoria');
    await page.getByPlaceholder('Escreva a descrição do item').fill('Descrição válida');
    await page.getByRole('spinbutton', { name: 'Preço (R$)' }).fill('30.00');

    await page.getByRole('button', { name: 'Salvar' }).click();
    await page.waitForTimeout(2000);

    const aindaNoModal = await page.getByRole('textbox', { name: 'Nome do Item' }).isVisible();
    expect(aindaNoModal).toBeTruthy();

    await page.getByRole('button', { name: /cancelar/i }).click();
  });
});