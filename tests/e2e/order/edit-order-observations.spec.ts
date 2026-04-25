import { test, expect } from '@playwright/test';

test.describe('Edit Order Observations', () => {

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
    const deleteButton = locator.getByTestId("delete-order-button")
    await expect(deleteButton).toBeVisible({ timeout: 10000 });
    await deleteButton.click();
    await page.waitForTimeout(1000);
  }

  test('should add and edit observations in an order', async ({ page }) => {
    test.setTimeout(60000);
    const mesa = `OBS${Math.floor(Math.random() * 1000)}`;

    // 1. Criar um novo pedido
    await page.getByRole('button', { name: /Novo Pedido/i }).click();
    await page.getByPlaceholder('Ex: 5').fill(mesa);
    
    // Adicionar um item
    const menuItemButton = page.locator('button.justify-start.h-auto').first();
    await expect(menuItemButton).toBeVisible();
    await menuItemButton.click();
    
    await page.getByRole('button', { name: 'Criar Pedido' }).click();
    await page.waitForTimeout(2000);

    const orderCard = page.locator('[data-testid="order-card"]', { hasText: `Mesa: ${mesa}` }).first();
    await expect(orderCard).toBeVisible();

    // 2. Editar o pedido para adicionar observação
    await orderCard.getByTestId('edit-order-button').click();
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();

    // Clica no botão de lápis para abrir o campo de observação
    // Usamos o modal como escopo para não pegar o botão do card no fundo
    const pencilButton = modal.locator('button.text-yellow-600').first();
    await pencilButton.click();

    // Preenche a observação
    const obsInput = modal.getByPlaceholder('Observação');
    await expect(obsInput).toBeVisible();
    await obsInput.fill('Sem cebola');

    await modal.getByRole('button', { name: 'Salvar Edição' }).click();
    await page.waitForTimeout(2000);

    // 3. Verificar se a observação foi salva
    await orderCard.getByTestId('edit-order-button').click();
    await expect(modal).toBeVisible();
    
    // O campo de observação deve estar visível e conter o texto
    await expect(modal.getByPlaceholder('Observação')).toHaveValue('Sem cebola');

    // 4. Alterar a observação
    await modal.getByPlaceholder('Observação').fill('Com cebola extra');
    await modal.getByRole('button', { name: 'Salvar Edição' }).click();
    await page.waitForTimeout(2000);

    // 5. Verificar alteração
    await orderCard.getByTestId('edit-order-button').click();
    await expect(modal.getByPlaceholder('Observação')).toHaveValue('Com cebola extra');
    
    await modal.getByRole('button', { name: 'Cancelar' }).click();

    // Cleanup
    await deleteOrder(page, orderCard);
  });
});
