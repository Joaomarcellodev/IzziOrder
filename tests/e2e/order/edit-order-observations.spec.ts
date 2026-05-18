import { test, expect } from '@playwright/test';

test.describe('Edit Order Observations', () => {

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
    const confirmButton = page.getByRole('button', { name: /^Excluir$/i });
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();
    await expect(orderCard).not.toBeVisible({ timeout: 10000 });
  }

  test('should add and edit observations in an order', async ({ page }) => {
    test.setTimeout(90000);
    const mesa = `OBS${Math.floor(Math.random() * 1000)}`;

    // 1. Abre modal de novo pedido
    await page.getByRole('button', { name: /Novo Pedido/i }).click();
    await page.waitForTimeout(1000);

    // 2. Preenche mesa
    await page.getByPlaceholder('Ex: 5').fill(mesa);
    await page.waitForTimeout(500);

    // 3. Adiciona item
    await page.locator('button.justify-start.h-auto').first().click();
    await page.waitForTimeout(1000);

    // 4. Seleciona forma de pagamento
    await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (dialog) dialog.scrollTop = dialog.scrollHeight;
    });
    await page.waitForTimeout(1000);

    const paymentCombobox = page.locator('[role="dialog"]').getByRole('combobox').last();
    await expect(paymentCombobox).toBeVisible({ timeout: 10000 });
    await paymentCombobox.click();
    await page.waitForTimeout(500);
    await page.getByRole('option', { name: 'Pix' }).click();
    await page.waitForTimeout(1000);

    // 5. Cria pedido
    await page.getByRole('button', { name: 'Criar Pedido' }).click();
    await page.waitForTimeout(4000);

    // 6. Aguarda o toast de sucesso aparecer
  // ✅ COLOQUE isso no lugar
await page.waitForTimeout(2000);

// 6. Aguarda o toast correto
await expect(
  page.locator('li[role="status"]').filter({ hasText: /Novo Pedido Adicionado/i }).first()
).toBeVisible({ timeout: 10000 });
await page.waitForTimeout(1000);

// 7. Rola a coluna até o final e busca o card
// 7. Rola a coluna até o final e busca o card
const openColumn = page.getByTestId('order-column-OPEN').first(); // 👈 .first() adicionado
await openColumn.evaluate((el: Element) => {
  el.scrollTop = el.scrollHeight;
});
await page.waitForTimeout(500);

const orderCard = openColumn
  .locator('[data-testid="order-card"]')
  .filter({ hasText: `Mesa: ${mesa}` })
  .last();

await expect(orderCard).toBeVisible({ timeout: 15000 });

await expect(orderCard).toBeVisible({ timeout: 15000 });

    // 8. Abre edição
    await orderCard.getByTestId('edit-order-button').click();
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await page.waitForTimeout(500);

    // 9. Clica no lápis para abrir observação
    const pencilButton = modal.locator('button.text-yellow-600').first();
    await expect(pencilButton).toBeVisible({ timeout: 10000 });
    await pencilButton.click();
    await page.waitForTimeout(500);

    // 10. Preenche observação
    const obsInput = modal.getByPlaceholder('Observação');
    await expect(obsInput).toBeVisible();
    await obsInput.fill('Sem cebola');

    await modal.getByRole('button', { name: 'Salvar Edição' }).click();
    await page.waitForTimeout(2000);

    // 11. Abre edição novamente e verifica observação
    await orderCard.getByTestId('edit-order-button').click();
    const modal2 = page.getByRole('dialog');
    await expect(modal2.getByPlaceholder('Observação')).toHaveValue('Sem cebola', { timeout: 10000 });

    // 12. Altera observação
    await modal2.getByPlaceholder('Observação').fill('Com cebola extra');
    await modal2.getByRole('button', { name: 'Salvar Edição' }).click();
    await page.waitForTimeout(2000);

    // 13. Verifica alteração
    await orderCard.getByTestId('edit-order-button').click();
    const modal3 = page.getByRole('dialog');
    await expect(modal3.getByPlaceholder('Observação')).toHaveValue('Com cebola extra', { timeout: 10000 });
    await modal3.getByRole('button', { name: 'Cancelar' }).click();

    // Cleanup
    await deleteOrder(page, orderCard);
  });
});