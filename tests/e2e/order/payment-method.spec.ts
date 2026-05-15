import { test, expect } from '@playwright/test';
 
test.describe('Payment Method - E2E', () => {
 
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(2000);
    await page.getByRole('textbox', { name: /e-mail/i }).fill('usuario@teste.com');
    await page.getByRole('textbox', { name: /senha/i }).fill('senhatesteA1');
    await page.locator('button.bg-blue-600').click();
    await page.waitForURL('**/auth/**', { timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.goto('http://localhost:3000/auth/orders');
    await page.waitForTimeout(2000);
  });
 
async function deleteOrder(page: any, orderCard: any) {
  const deleteButton = orderCard.getByTestId('delete-order-button');

  await expect(deleteButton).toBeVisible();

  await deleteButton.click();

  // modal de confirmação
  const confirmButton = page.getByRole('button', {
    name: /^Excluir$/i,
  });

  await expect(confirmButton).toBeVisible({
    timeout: 10000,
  });

  await confirmButton.click();

  // espera o pedido sumir da tela
  await expect(orderCard).not.toBeVisible({
    timeout: 10000,
  });
}

  async function selectPaymentMethod(page: any, paymentOption: string) {
    const modalContent = page.locator('[role="dialog"]');
    await modalContent.evaluate((el: Element) => {
      (el as HTMLElement).scrollTop = (el as HTMLElement).scrollHeight;
    });
  
    await page.waitForTimeout(500);
    const paymentCombobox = page.locator('[role="dialog"]').getByRole('combobox').last();
    await paymentCombobox.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await paymentCombobox.click();
    await page.getByRole('option', { name: paymentOption }).click();
    await page.waitForTimeout(500);
  }

  // ─────────────────────────────────────────────
  // VALID CASES
  // ─────────────────────────────────────────────
 
  test.describe('Valid Cases', () => {
 
    test('should create PICKUP order with PIX payment method', async ({ page }) => {
      const cliente = `Cliente ${Math.floor(Math.random() * 1000)}`;
      await page.getByRole('button', { name: /Novo Pedido/i }).click();
      await page.waitForTimeout(1000);
      await page.locator('div:has-text("Tipo de Pedido")').getByRole('combobox').first()
  .click();
      await page.getByRole('option', { name: 'Retirada' }).click();
      await page.waitForTimeout(500);
      await page.getByPlaceholder('Ex: João').fill(cliente);
      await page.locator('button.justify-start.h-auto').first().click();
      await page.waitForTimeout(500);
      await selectPaymentMethod(page, 'Pix');
      await page.getByRole('button', { name: 'Criar Pedido' }).click();
      await page.waitForTimeout(3000);
      const orderCard = page.locator('[data-testid="order-card"]', { hasText: `Cliente: ${cliente}` }).last();
      await expect(orderCard).toBeVisible({ timeout: 100000 });
      await expect(orderCard.getByText(/Pagamento: Pix/i)).toBeVisible();
      await deleteOrder(page, orderCard);
    });


 
    test('should create PICKUP order with ESPECIE_COM_TROCO and show change value', async ({ page }) => {
      test.setTimeout(60000);
      const cliente = `Cliente ${Math.floor(Math.random() * 1000)}`;
      await page.getByRole('button', { name: /Novo Pedido/i }).click();
      await page.waitForTimeout(1000);
      await page.locator('div:has-text("Tipo de Pedido")').getByRole('combobox').first()
  .click();
      await page.getByRole('option', { name: 'Retirada' }).click();
      await page.waitForTimeout(500);
      await page.getByPlaceholder('Ex: João').fill(cliente);
      await page.locator('button.justify-start.h-auto').first().click();
      await page.waitForTimeout(500);
      await selectPaymentMethod(page, 'Espécie com troco');

      // Scrolla novamente para preencher o campo de troco
      const modalContent = page.locator('[role="dialog"]');
      await modalContent.evaluate((el: Element) => {
        (el as HTMLElement).scrollTop = (el as HTMLElement).scrollHeight;
      });
      await page.waitForTimeout(500);
      await page.getByPlaceholder('R$').fill('50');
      await page.waitForTimeout(500);
      await expect(page.getByText(/Troco: R\$/i).last()).toBeVisible();
      await page.getByRole('button', { name: 'Criar Pedido' }).click();
      await page.waitForTimeout(2000);
      const orderCard = page.locator('[data-testid="order-card"]', { hasText: `Cliente: ${cliente}` }).last();;
      await expect(orderCard).toBeVisible({timeout: 100000});
      await expect(orderCard.getByText(/Pagamento: Espécie com troco/i)).toBeVisible();
      await expect(orderCard.getByText(/Troco: R\$/i)).toBeVisible();
      await deleteOrder(page, orderCard);
    });
 
    test('should create LOCAL order without payment and block finish button', async ({ page }) => {
      test.setTimeout(60000);
      const mesa = `${Math.floor(Math.random() * 1000)}`;
      await page.getByRole('button', { name: /Novo Pedido/i }).click();
      await page.waitForTimeout(1000);
      await page.getByPlaceholder('Ex: 5').fill(mesa);
      await page.locator('button.justify-start.h-auto').first().click();
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: 'Criar Pedido' }).click();
      await page.waitForTimeout(2000);
      const orderCard = page.locator('[data-testid="order-card"]', { hasText: `Mesa: ${mesa}` }).last();;
      await expect(orderCard).toBeVisible({timeout: 10000},);
      
      const finishButton = orderCard.getByTestId('finish-order-button');
      await expect(finishButton).toBeDisabled();
      await deleteOrder(page, orderCard);
    });
 
    test('should add payment method to LOCAL order via edit and enable finish button', async ({ page }) => {
      test.setTimeout(60000);
      const mesa = `${Math.floor(Math.random() * 1000)}`;
      await page.getByRole('button', { name: /Novo Pedido/i }).click();
      await page.waitForTimeout(1000);
      await page.getByPlaceholder('Ex: 5').fill(mesa);
      await page.locator('button.justify-start.h-auto').first().click();
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: 'Criar Pedido' }).click();
      await page.waitForTimeout(2000);
      const orderCard = page.locator('[data-testid="order-card"]', { hasText: `Mesa: ${mesa}` }).last();;
      await expect(orderCard).toBeVisible();

      // Edita o pedido para adicionar forma de pagamento
const editButton =
  orderCard.getByTestId('edit-order-button');

await expect(editButton).toBeVisible();

await editButton.click();

const modal = page.getByRole('dialog');

await expect(modal).toBeVisible({
  timeout: 10000,
});

      // Scrolla dentro do modal de edição e seleciona PIX
      await modal.evaluate((el: Element) => {
        (el as HTMLElement).scrollTop = (el as HTMLElement).scrollHeight;
      });
      await page.waitForTimeout(500);
      const paymentCombobox = modal.getByRole('combobox').last();
      await paymentCombobox.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await paymentCombobox.click();
      await page.getByRole('option', { name: 'Pix' }).click();
      await page.waitForTimeout(500);

      await modal.getByRole('button', { name: 'Salvar Edição' }).click();
      await page.waitForTimeout(2000);
      const finishButton = orderCard.getByTestId('finish-order-button');
      await expect(finishButton).toBeEnabled();
      await deleteOrder(page, orderCard);
    });
  });

  // ─────────────────────────────────────────────
  // INVALID CASES
  // ─────────────────────────────────────────────

  test.describe('Invalid Cases', () => {

    test('should not create PICKUP order without payment method', async ({ page }) => {
      test.setTimeout(60000);
      await page.getByRole('button', { name: /Novo Pedido/i }).click();
      await page.waitForTimeout(1000);
      await page.locator('div:has-text("Tipo de Pedido")').getByRole('combobox') .first()
  .click();
      await page.getByRole('option', { name: 'Retirada' }).click();
      await page.waitForTimeout(500);
      await page.getByPlaceholder('Ex: João').fill('João Silva');
      await page.locator('button.justify-start.h-auto').first().click();
      await page.waitForTimeout(500);
      // Não seleciona forma de pagamento
      await page.getByRole('button', { name: 'Criar Pedido' }).click();
      await page.waitForTimeout(1000);
      await expect(page.getByText(/Selecione sua forma de pagamento/i).first()).toBeVisible();
    });

    test('should not create PICKUP order with ESPECIE_COM_TROCO without filling change value', async ({ page }) => {
      test.setTimeout(60000);
      await page.getByRole('button', { name: /Novo Pedido/i }).click();
      await page.waitForTimeout(1000);
      await page.locator('div:has-text("Tipo de Pedido")').getByRole('combobox').first()
  .click();
      await page.getByRole('option', { name: 'Retirada' }).click();
      await page.waitForTimeout(500);
      await page.getByPlaceholder('Ex: João').fill('João Silva');
      await page.locator('button.justify-start.h-auto').first().click();
      await page.waitForTimeout(500);
      await selectPaymentMethod(page, 'Espécie com troco');
      // Não preenche o campo de troco
      await page.getByRole('button', { name: 'Criar Pedido' }).click();
      await page.waitForTimeout(1000);
      await expect(page.getByText(/Informe o valor recebido/i).first()).toBeVisible();
    });

    test('should not show payment method selector for LOCAL order', async ({ page }) => {
      test.setTimeout(60000);
      await page.getByRole('button', { name: /Novo Pedido/i }).click();
      await page.waitForTimeout(1000);
      // Tipo LOCAL é o padrão — card de pagamento não deve aparecer
      await expect(page.getByText('Forma de Pagamento')).not.toBeVisible();
    });
  });
});