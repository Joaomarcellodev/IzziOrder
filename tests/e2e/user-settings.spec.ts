import { test, expect } from "@playwright/test";

test.describe("Configurações do Usuário - E2E", () => {
    // Timeout estendido para garantir que o teste não falhe por lentidão do sistema
    test.setTimeout(120000);

    const emailPadrao = "usuarionovo@teste.com";
    const senhaPadrao = "Novasenha123";

    test.beforeEach(async ({ page }) => {
        // Configura um timeout de 30s para cada ação individual
        page.setDefaultTimeout(60000);

        // 1. Realiza o Login
        await page.goto("/login", { waitUntil: 'networkidle' });
        await page.fill('input[name="email"]', emailPadrao);
        await page.fill('input[name="password"]', senhaPadrao);
        await page.click('button[type="submit"]');
        
        // 2. Aguarda o redirecionamento para a área logada
        await page.waitForURL("**/auth/**", { timeout: 30000 });
        
        // 3. Navega para a página de configurações
        await page.goto("/auth/services", { waitUntil: 'networkidle' });

        await page.waitForSelector("#name", { timeout: 15000 });
    });

     test("Deve alterar as informações de perfil (Nome)", async ({ page }) => {
        // Salva valores originais para restaurar ao final
        const campoNome = page.locator("#name");

        const nomeOriginal = await campoNome.inputValue();
        await page.waitForTimeout(800);

        // Limpa e digita o novo nome
        await campoNome.clear();
        await page.waitForTimeout(500);
        await campoNome.fill("Nome Editado E2E");
        await page.waitForTimeout(800);

        // Salva
        await page.click('button:has-text("Salvar Alterações")');
        await page.waitForTimeout(1000);

        const toast = page
            .locator('li[role="status"]')
            .filter({ hasText: /Perfil atualizado com sucesso/i })
            .first();

        await expect(toast).toBeVisible({ timeout: 15000 });
        await page.waitForTimeout(2000); // tempo para ler o toast

        // Restaura nome original
        await campoNome.clear();
        await page.waitForTimeout(500);
        await campoNome.fill(nomeOriginal);
        await page.waitForTimeout(800);

        await page.click('button:has-text("Salvar Alterações")');
        await page.waitForTimeout(1000);

        await expect(
            page.locator('li[role="status"]').filter({ hasText: /Perfil atualizado com sucesso/i })
            .first()
        ).toBeVisible({ timeout: 15000 });
        await page.waitForTimeout(2000);
    });

    test("Deve iniciar processo de alteração de E-mail", async ({ page }) => {
        // Nota: No Supabase, a alteração de e-mail geralmente exige confirmação no e-mail novo.
        // Este teste verifica apenas se o sistema processa o pedido.
        
        await page.fill('input[name="email"]', "novo_email_teste@gmail.com");
        await page.click('button:has-text("Salvar Alterações")');

        // Verifica se aparece mensagem de sucesso ou de confirmação enviada
        const mensagem = page.locator('span[role="status"]').filter({ hasText: /sucesso|confirmação|enviado/i });
        await expect(mensagem).toBeVisible({ timeout: 15000 });
    });

    test("Deve validar erro ao tentar trocar senha com a senha atual incorreta", async ({ page }) => {
        // Abre o modal/seção de troca de senha
        const btnTrocar = page.getByRole('button', { name: /Trocar Senha|Alterar Senha/i });
        await btnTrocar.click();
        
        await page.fill('input[name="currentPassword"]', "SenhaErrada123!");
        await page.fill('input[name="newPassword"]', "MinhaNovaSenha456!");
        await page.fill('input[name="confirmPassword"]', "MinhaNovaSenha456!");
        
        await page.click('button:has-text("Atualizar Senha")');

        // Verifica se a mensagem de erro aparece
        const erro = page.locator('span[role="status"]').filter({ hasText: /Senha atual incorreta/i });
        await expect(erro).toBeVisible({ timeout: 15000 });
    });

    test("Deve realizar a troca de senha com sucesso", async ({ page }) => {
        const btnTrocar = page.getByRole('button', { name: /Trocar Senha|Alterar Senha/i });
        await btnTrocar.click();
        
        await page.fill('input[name="currentPassword"]', senhaPadrao);
        await page.fill('input[name="newPassword"]', senhaPadrao); // Mantendo a mesma para não travar seu próximo login
        await page.fill('input[name="confirmPassword"]', senhaPadrao);
        
        await page.click('button:has-text("Atualizar Senha")');

        const sucesso = page.locator('span[role="status"]').filter({ hasText: /Senha atualizada com sucesso/i });
        await expect(sucesso).toBeVisible({ timeout: 15000 });
    });
});
