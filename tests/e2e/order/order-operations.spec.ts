import { test, expect } from '@playwright/test';

test.describe('Order operations', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    await page.getByRole('textbox', { name: /e-mail/i })
      .fill('usuario@teste.com');

    await page.getByRole('textbox', { name: /senha/i })
      .fill('senhatesteA1');

    await page.locator('button.bg-blue-600').click();

// espera algum elemento real da área autenticada
await expect(
  page.getByRole('button', {
    name: /Novo Pedido/i
  })
).toBeVisible({
  timeout: 30000
});

// garante que está em pedidos
await page.goto(
  'http://localhost:3000/auth/orders'
);

await expect(
  page.getByRole('button', {
    name: /Novo Pedido/i
  })
).toBeVisible({
  timeout: 30000
});
  });

  async function deleteOrder(page: any, orderCard: any) {
    const deleteButton = orderCard.getByTestId('delete-order-button');

    await expect(deleteButton).toBeVisible();

    await deleteButton.click();

    const confirmButton = page.getByRole('button', {
      name: /^Excluir$/i
    });

    await expect(confirmButton).toBeVisible();

    await confirmButton.click();

    await expect(orderCard).not.toBeVisible({
      timeout: 10000
    });
  }

  async function selectPaymentMethod(
    page: any,
    paymentOption: string
  ) {
    const modal = page.locator('[role="dialog"]');

    await modal.evaluate((el: Element) => {
      (el as HTMLElement).scrollTop =
        (el as HTMLElement).scrollHeight;
    });

    const paymentCombobox = modal
      .getByRole('combobox')
      .last();

    await paymentCombobox.click();

    await page.getByRole('option', {
      name: paymentOption
    }).click();
  }

  async function getOrderCard(
    page: any,
    text: string
  ) {
    const openColumn = page.getByTestId(
      'order-column-OPEN'
    );

    return openColumn
      .locator('[data-testid="order-card"]')
      .filter({
        hasText: text
      })
      .last();
  }

  test.describe('Valid Cases', () => {

    test('should create a new local order', async ({ page }) => {
      const mesa = `10${Math.floor(Math.random() * 1000)}`;

      await page.getByRole('button', {
        name: /Novo Pedido/i
      }).click();

      await page.getByPlaceholder('Ex: 5')
        .fill(mesa);

      const item = page
        .locator('button.justify-start.h-auto')
        .first();

      await item.click();

      await page.getByRole('button', {
        name: 'Criar Pedido'
      }).click();

      const orderCard = await getOrderCard(
        page,
        `Mesa: ${mesa}`
      );

      await expect(orderCard).toBeVisible({
        timeout: 10000
      });

      await deleteOrder(page, orderCard);
    });


    test('should edit an order', async ({ page }) => {
  test.setTimeout(60000);

  const mesa =
    `77${Math.floor(Math.random() * 1000)}`;

  const novaMesa =
    `77${Math.floor(Math.random() * 1000)}`;

  await page.getByRole('button', {
    name: /Novo Pedido/i
  }).click();

  await page.getByPlaceholder('Ex: 5')
    .fill(mesa);

  await page.locator(
    'button.justify-start.h-auto'
  )
  .first()
  .click();

  // adiciona pagamento antes de criar
  await selectPaymentMethod(
    page,
    'Pix'
  );

  await page.getByRole('button', {
    name: 'Criar Pedido'
  }).click();

  const orderCard =
    await getOrderCard(
      page,
      `Mesa: ${mesa}`
    );

  await expect(
    orderCard
  ).toBeVisible({
    timeout: 10000
  });

  // editar
  await orderCard
    .getByTestId(
      'edit-order-button'
    )
    .click();

  const modal =
    page.getByRole(
      'dialog'
    );

  await expect(
    modal
  ).toBeVisible();

  await modal
    .getByPlaceholder(
      'Ex: 5'
    )
    .fill(
      novaMesa
    );

  await modal.getByRole(
    'button',
    {
      name: 'Salvar Edição'
    }
  ).click();

  const editedCard =
    await getOrderCard(
      page,
      `Mesa: ${novaMesa}`
    );

  await expect(
    editedCard
  ).toBeVisible({
    timeout: 10000
  });

  await deleteOrder(
    page,
    editedCard
  );
});

    test('should delete an order', async ({ page }) => {
      const mesa =
        `88${Math.floor(Math.random() * 1000)}`;

      await page.getByRole('button', {
        name: /Novo Pedido/i
      }).click();

      await page.getByPlaceholder('Ex: 5')
        .fill(mesa);

      await page.locator(
        'button.justify-start.h-auto'
      )
      .first()
      .click();

      await page.getByRole('button', {
        name: 'Criar Pedido'
      }).click();

      const orderCard = await getOrderCard(
        page,
        `Mesa: ${mesa}`
      );

      await expect(orderCard).toBeVisible();

      await deleteOrder(page, orderCard);
    });

  });

});