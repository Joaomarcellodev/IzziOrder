import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

test.describe("Sign Up", () => {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let email: string

    test.beforeEach(async ({ page }) => {
        await page.goto("/login");

        await page.getByText("Não tem conta?").click()
        await page.waitForURL("**/sign-up")
    })

    test.afterEach(async ({ page }) => {
        if (email) {
            const { data } = await supabaseAdmin.auth.admin.listUsers();
            const user = data.users.find(u => u.email === email);
            
            if (user) {
                await supabaseAdmin.auth.admin.deleteUser(user.id);
            }
        }
    })

    test.describe("Valid Cases", () => {
        test("should register a new user whith success", async ({ page }) => {
            email = `teste_${Date.now()}@email.com`;

            await page.fill('input[name="user_name"]', "Test User");
            await page.fill('input[name="email"]', email);
            await page.fill('input[name="password"]', "12345678A");
            await page.fill('input[name="password_confirmation"]', "12345678A");

            await page.click('button[type="submit"]');
            await page.waitForURL("**/auth/menu")

            expect(page.url()).toContain("/auth/menu")
        });
    })

    test.describe("Invalid Cases", () => {
        test("should show error for password mismatch", async ({ page }) => {
            email = `teste_${Date.now()}@email.com`;

            await page.fill('input[name="user_name"]', "User Mismatch")
            await page.fill('input[name="email"]', email);
            await page.fill('input[name="password"]', "12345678A");
            await page.fill('input[name="password_confirmation"]', "12345678B");

            await page.click('button[type="submit"]');

            const notification = page.locator('span[role="status"]', { hasText: /As senhas não batem/i });
            await expect(notification).toBeVisible({ timeout: 5000 });
        });

        test("should show error for weak password", async ({ page }) => {
            email = `teste_${Date.now()}@email.com`;

            await page.fill('input[name="user_name"]', "User Weak")
            await page.fill('input[name="email"]', email);
            await page.fill('input[name="password"]', "123");
            await page.fill('input[name="password_confirmation"]', "123");

            await page.click('button[type="submit"]');

            const notification = page.locator('span[role="status"]', { hasText: /Senha deve ter no mínimo 8 caracteres/i });
            await expect(notification).toBeVisible({ timeout: 5000 });
        });

        test("should show error for duplicate email", async ({ page }) => {
            email = `teste_${Date.now()}@email.com`;

            for (let index = 0; index < 2; index++) {
                await page.goto("/sign-up")

                await page.fill('input[name="user_name"]', "User Duplicated")
                await page.fill('input[name="email"]', email);
                await page.fill('input[name="password"]', "12345678A");
                await page.fill('input[name="password_confirmation"]', "12345678A");

                await page.click('button[type="submit"]');
            }

            const notification = page.locator('span[role="status"]', { hasText: /User already registered/i });
            await expect(notification).toBeVisible({ timeout: 10000 });
        })
    })
});
