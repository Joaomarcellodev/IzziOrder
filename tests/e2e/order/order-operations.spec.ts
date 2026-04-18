import { test, expect } from '@playwright/test';

test.describe('Order operations', () => {

  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(2000);
    await page.getByRole('textbox', { name: /e-mail/i }).fill('usuario@teste.com');
    await page.getByRole('textbox', { name: /senha/i }).fill('senhatesteA1');
    await page.locator('button.bg-blue-600').click();
    await page.waitForURL('**/auth/**', { timeout: 15000 });
    await page.waitForTimeout(3000);

    // Ir para a página de pedidos
    await page.goto('http://localhost:3000/auth/orders');
    await page.waitForTimeout(2000);
  });

  async function deleteOrder(page: any, locator: any) {
    // Tenta encontrar o botão de lixeira dentro do card
    const deleteButton = locator.getByTestId("delete-order-button")
    await expect(deleteButton).toBeVisible({ timeout: 10000 });
    await deleteButton.click();
    await page.waitForTimeout(1000);
  }

  test.describe("Valid Cases", () => {
    test('should create a new local order', async ({ page }) => {
      test.setTimeout(60000);
      const mesa = `10${Math.floor(Math.random() * 1000)}`;

      await page.getByRole('button', { name: /Novo Pedido/i }).click();
      await page.waitForTimeout(1000);

      await page.getByPlaceholder('Ex: 5').fill(mesa);

      const menuItemButton = page.locator('button.justify-start.h-auto').first();
      await expect(menuItemButton).toBeVisible();
      await menuItemButton.click();
      await page.waitForTimeout(500);

      await page.getByRole('button', { name: 'Criar Pedido' }).click();
      await page.waitForTimeout(2000);

      const orderCard = page.locator('[data-testid="order-card"]', { hasText: `Mesa: ${mesa}` }).first();
      await expect(orderCard).toBeVisible();

      // Cleanup
      await deleteOrder(page, orderCard);
      await expect(orderCard).not.toBeVisible();
    });

    test('should create a new pickup order', async ({ page }) => {
      test.setTimeout(60000);
      const cliente = `Cliente ${Math.floor(Math.random() * 1000)}`;

      await page.getByRole('button', { name: /Novo Pedido/i }).click();
      await page.waitForTimeout(1000);

      await page.locator('div:has-text("Tipo de Pedido")').getByRole('combobox').click();
      await page.getByRole('option', { name: 'Retirada' }).click();
      await page.waitForTimeout(500);

      await page.getByPlaceholder('Ex: João').fill(cliente);

      const menuItemButton = page.locator('button.justify-start.h-auto').first();
      await expect(menuItemButton).toBeVisible();
      await menuItemButton.click();
      await page.waitForTimeout(500);

      await page.getByRole('button', { name: 'Criar Pedido' }).click();
      await page.waitForTimeout(2000);

      const orderCard = page.locator('[data-testid="order-card"]', { hasText: `Cliente: ${cliente}` }).first();
      await expect(orderCard).toBeVisible();

      // Cleanup
      await deleteOrder(page, orderCard);
      await expect(orderCard).not.toBeVisible();
    });

    test('should edit an order', async ({ page }) => {
      test.setTimeout(60000);
      const mesa = `77${Math.floor(Math.random() * 1000)}`;
      const novaMesa = `77${Math.floor(Math.random() * 1000)}`;

      // Criar
      await page.getByRole('button', { name: /Novo Pedido/i }).click();
      await page.getByPlaceholder('Ex: 5').fill(mesa);
      await page.locator('button.justify-start.h-auto').first().click();
      await page.getByRole('button', { name: 'Criar Pedido' }).click();
      await page.waitForTimeout(2000);

      const orderCard = page.locator('[data-testid="order-card"]', { hasText: `Mesa: ${mesa}` }).first();
      await expect(orderCard).toBeVisible();

      // Editar
      await orderCard.getByTestId('edit-order-button').click();
      await expect(page.getByText(/Editar Pedido/i)).toBeVisible();

      await page.getByPlaceholder('Ex: 5').fill(novaMesa);
      await page.getByRole('button', { name: 'Salvar Edição' }).click();
      await page.waitForTimeout(2000);

      const editedCard = page.locator('[data-testid="order-card"]', { hasText: `Mesa: ${novaMesa}` }).first();
      await expect(editedCard).toBeVisible();

      // Cleanup
      await deleteOrder(page, editedCard);
    });

    test('shold delete a order', async ({ page }) => {
      test.setTimeout(60000);
      const mesa = `88${Math.floor(Math.random() * 1000)}`;

      await page.getByRole('button', { name: /Novo Pedido/i }).click();
      await page.getByPlaceholder('Ex: 5').fill(mesa);
      const menuItemButton = page.locator('button.justify-start.h-auto').first();
      await menuItemButton.click();
      await page.getByRole('button', { name: 'Criar Pedido' }).click();
      await page.waitForTimeout(2000);

      const orderCard = page.locator('[data-testid="order-card"]', { hasText: `Mesa: ${mesa}` }).first();
      await expect(orderCard).toBeVisible();

      await deleteOrder(page, orderCard);
      await expect(orderCard).not.toBeVisible();
    });
  });

  test.describe("Invalid Cases", () => {
    test('should not create local order without mesa', async ({ page }) => {
      await page.getByRole('button', { name: /Novo Pedido/i }).click();
      // Não preenche a mesa
      await page.locator('button.justify-start.h-auto').first().click();
      await page.getByRole('button', { name: 'Criar Pedido' }).click();

      // Verifica se o toast de erro apareceu
      await expect(page.getByText("Por favor, insira o número da mesa").first()).toBeVisible();
    });

    test('should not create order without items', async ({ page }) => {
      await page.getByRole('button', { name: /Novo Pedido/i }).click();
      await page.getByPlaceholder('Ex: 5').fill("123");
      // Não adiciona itens
      await page.getByRole('button', { name: 'Criar Pedido' }).click();

      await expect(page.getByText("O pedido deve conter pelo menos um item.").first()).toBeVisible();
    });
  });
});
