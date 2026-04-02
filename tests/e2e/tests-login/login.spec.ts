import {test, expect} from '@playwright/test';

test.describe('Login', () => {

    test.beforeEach(async ({ page }) => {
    test.setTimeout(30000);
    await page.goto('http://localhost:3000/login');
    })

    test.describe('Valid Cases', () => {

            // 1. LOGIN COM CREDENCIAIS VÁLIDAS
    test('deve realizar login com credenciais válidas', async ({ page }) => {
      await page.getByRole('textbox', { name: /e-mail/i }).fill('usuario@teste.com');
      await page.waitForTimeout(500);
      await page.getByRole('textbox', { name: /senha/i }).fill('senhatesteA1');
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: /entrar/i }).click();
 
      await page.waitForURL('**/auth/orders**', { timeout: 30000 });
      await page.waitForTimeout(3000);
      await expect(page).toHaveURL(/\/auth\//);
    });
    });
});