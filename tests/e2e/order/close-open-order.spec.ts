import { test, expect } from '@playwright/test';

test.describe('Close and reopen order', () => {

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

        const pizzaBtn = page.getByRole('button', { name: /Pizza Teste/i }).first();
        await expect(pizzaBtn).toBeVisible();
        await pizzaBtn.click();

        await page.getByRole('button', { name: 'Criar Pedido' }).click();

        const orderCard = page
            .locator('div.p-3.border.rounded-lg', { hasText: `Mesa: ${mesa}` })
            .first();

        await expect(orderCard).toBeVisible();

        // Finalizar Pedido
        await orderCard.getByRole('button', { name: 'Finalizar' }).click();

        const finalizadosSection = page.locator(
            'div.bg-white.p-4.rounded-xl.shadow',
            { hasText: 'Finalizados' }
        );

        const finishedCard = finalizadosSection.locator(
            'div.p-3.border.rounded-lg',
            { hasText: `Mesa: ${mesa}` }
        ).first();

        await expect(finishedCard).toBeVisible();

        // Reabrir Pedido
        await finishedCard.getByRole('button', { name: 'Reabrir' }).click();

        // Verificar se voltou para abertos
        const abertosSection = page.locator(
            'div.bg-white.p-4.rounded-xl.shadow',
            { hasText: 'Abertos' }
        );

        const reopenedCard = abertosSection.locator(
            'div.p-3.border.rounded-lg',
            { hasText: `Mesa: ${mesa}` }
        ).first();

        await expect(reopenedCard).toBeVisible();

        // Limpar do banco (via UI)
        await deleteOrder(page, reopenedCard);
        await expect(reopenedCard).not.toBeVisible();
    });

});