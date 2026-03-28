import { test, expect } from '@playwright/test';

test.describe('should display user profile details correctly on every page', () => {
    let user = {
        name: "usuario",
        email: "usuario@teste.com",
        password: "senhatesteA1"
    };
    const pages = ['/auth/orders', '/auth/menu', '/auth/reports', '/auth/settings'];

    test.beforeEach(async ({ page }) => {
        await page.goto('/login');

        await page.getByRole('textbox', { name: 'e-mail' }).fill(user.email);
        await page.getByRole('textbox', { name: 'senha' }).fill(user.password);

        await page.getByRole('button', { name: 'Entrar' }).click()

        await page.waitForURL('**/auth/**', { timeout: 15000 });
        await page.waitForTimeout(3000);
    });

    for (const url of pages) {
        test(url, async ({ page }) => {
            await page.goto(url);
            await page.waitForURL(url);

            await expect(page.getByText(user.name, { exact: true })).toBeVisible();
            await expect(page.getByText(user.email)).toBeVisible();
        })
    }
});


