import { test, expect } from '@playwright/test';

test.describe('Order operations', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    await page.getByRole('textbox', {
      name: /e-mail/i
    }).fill('usuario@teste.com');

    await page.getByRole('textbox', {
      name: /senha/i
    }).fill('senhatesteA1');

    await page.locator('button.bg-blue-600').click();

    await page.waitForURL('**/auth/**', {
      timeout: 30000
    });

    await page.goto(
      'http://localhost:3000/auth/orders'
    );
  });

  async function deleteOrder(
    page: any,
    orderCard: any
  ) {
    const deleteButton =
      orderCard.getByTestId(
        'delete-order-button'
      );

    await expect(deleteButton)
      .toBeVisible();

    await deleteButton.click();

    const confirmButton =
      page.getByRole('button', {
        name: /^Excluir$/i,
      });

    await expect(confirmButton)
      .toBeVisible({
        timeout: 10000,
      });

    await confirmButton.click();

    await expect(orderCard)
      .not.toBeVisible({
        timeout: 10000,
      });
  }

  test.describe('Valid Cases', () => {

    test(
      'should create a new local order',
      async ({ page }) => {

      test.setTimeout(60000);

      const mesa =
        `10${Math.floor(Math.random()*1000)}`;

      // criar pedido
      await page.getByRole(
        'button',
        {
          name:/Novo Pedido/i
        }
      ).click();

      await page
      .getByPlaceholder('Ex: 5')
      .fill(mesa);

      // adicionar produto
      const menuItemButton =
        page.locator(
          'button.justify-start.h-auto'
        ).first();

      await expect(menuItemButton)
      .toBeVisible();

      await menuItemButton.click();

      // criar
      await page.getByRole(
        'button',
        {
          name:'Criar Pedido'
        }
      ).click();

      // pega último pedido criado
      const orderCard =
        page.locator(
          '[data-testid="order-card"]',
          {
            hasText:`Mesa: ${mesa}`
          }
        ).last();

      await expect(orderCard)
      .toBeVisible({
        timeout:10000
      });

      // valida botão finalizar
      const finishButton =
        orderCard.getByTestId(
          'finish-order-button'
        );

      await expect(
        finishButton
      ).toBeDisabled();

      // cleanup
      await deleteOrder(
        page,
        orderCard
      );
    });

  });

});