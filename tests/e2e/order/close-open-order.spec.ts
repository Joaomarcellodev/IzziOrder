import { test, expect } from '@playwright/test';

test.describe('Close and reopen order', () => {

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

    async function deleteOrder(page: any, locator: any) {
        const deleteButton = locator.getByTestId("delete-order-button");
        await expect(deleteButton).toBeVisible({ timeout: 10000 });
        await deleteButton.click();
        await page.waitForTimeout(1000);
    }

    test('should finish and reopen an order', async ({ page }) => {
        test.setTimeout(60000);

        const mesa = `99${Math.floor(Math.random() * 1000)}`;

        // Criar Pedido
        await page.getByRole('button', { name: /Novo Pedido/i }).click();
        await page.getByPlaceholder('Ex: 5').fill(mesa);

        const menuItemBtn = page.locator('button.justify-start.h-auto').first();
        await expect(menuItemBtn).toBeVisible();
        await menuItemBtn.click();
        await page.waitForTimeout(500);

        // Seleciona forma de pagamento antes de criar
        const modalContent = page.locator('[role="dialog"]');
        await modalContent.evaluate((el: Element) => {
            (el as HTMLElement).scrollTop = (el as HTMLElement).scrollHeight;
        });
        await page.waitForTimeout(500);

        const paymentCombobox = page.locator('[role="dialog"]').getByRole('combobox').last();
        await paymentCombobox.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        await paymentCombobox.click();
        await page.getByRole('option', { name: 'Pix' }).click();
        await page.waitForTimeout(500);

        await page.getByRole('button', { name: 'Criar Pedido' }).click();
        await page.waitForTimeout(2000);

        const openColumn = page.getByTestId('order-column-OPEN');
        const orderCard = openColumn
            .locator('[data-testid="order-card"]', { hasText: `Mesa: ${mesa}` })
            .first();

        await expect(orderCard).toBeVisible();

        // Finalizar Pedido
        await orderCard.getByTestId('finish-order-button').click();
        await page.waitForTimeout(1000);

        const closedColumn = page.getByTestId('order-column-CLOSED');
        const finishedCard = closedColumn.locator(
            '[data-testid="order-card"]',
            { hasText: `Mesa: ${mesa}` }
        ).first();

        await expect(finishedCard).toBeVisible();

        // Reabrir Pedido
        await finishedCard.getByTestId('reopen-order-button').click();
        await page.waitForTimeout(1000);

        // Verificar se voltou para abertos
        const reopenedCard = openColumn.locator(
            '[data-testid="order-card"]',
            { hasText: `Mesa: ${mesa}` }
        ).first();

        await expect(reopenedCard).toBeVisible();

        // Cleanup
        await deleteOrder(page, reopenedCard);
        await expect(reopenedCard).not.toBeVisible();
    });
});