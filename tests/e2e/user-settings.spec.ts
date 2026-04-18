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


    // VALID CASES 
test.describe("Valid Cases ", () => {

        test("Deve alterar as informações de perfil (Nome)", async ({ page }) => {
        // Salva valores originais para restaurar ao final
        const campoNome = page.locator("#name");

        const nomeOriginal = await campoNome.inputValue();
        await page.waitForTimeout(800);

    
        await campoNome.clear();
        await page.waitForTimeout(500);
        await campoNome.fill("Nome Editado E2E");
        await page.waitForTimeout(800);

        
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



        test("Deve realizar a troca de senha ", async ({ page }) => {
        const senhaAtual = senhaPadrao;
        const novaSenha = "SenhaNova123";

        const campoSenhaAtual = page.locator("#current");
        const campoNovaSenha = page.locator("#new");
        const campoConfirmarSenha = page.locator("#confirm");
        const botao = page.getByRole('button', { name: 'Atualizar Senha' });

        const toast = page.locator('li[role="status"]');

        await campoSenhaAtual.waitFor({ state: 'visible' });


        await campoSenhaAtual.fill(senhaAtual);
        await campoNovaSenha.fill(novaSenha);
        await campoConfirmarSenha.fill(novaSenha);

        await botao.click();

        await expect(toast).toContainText(/senha alterada/i);


        await expect(toast).not.toBeVisible();

       // Voltar senha padrão
        await campoSenhaAtual.fill(novaSenha);
        await campoNovaSenha.fill(senhaAtual);
        await campoConfirmarSenha.fill(senhaAtual);

        await botao.click();

        await expect(toast).toContainText(/senha alterada/i);
});

})

    // INVALID CASES 
test.describe("Invalid Cases ", () => {

        test("Deve validar erro ao tentar trocar senha com a senha atual incorreta", async ({ page }) => {
        await page.waitForSelector("#current", { timeout: 15000 });
        await page.waitForTimeout(500);
        
        const campoSenhaAtual = page.locator("#current")
        const campoNovaSenha = page.locator("#new")
        const campoConfirmarSenha = page.locator("#confirm")

        await campoSenhaAtual.fill("SenhaErrada123")
        await page.waitForTimeout(500)
        await campoNovaSenha.fill("Minhanovasenha123")
        await page.waitForTimeout(500)
        await campoConfirmarSenha.fill("Minhanovasenha123")
        await page.waitForTimeout(500)

        await page.click('button:has-text("Atualizar Senha")');
        await page.waitForTimeout(1000);

        const erro = page
        .locator('li[role="status"]')
        .filter({ hasText: /Senha atual incorreta/i })
        .first();

        await expect(erro).toBeVisible({ timeout: 15000 });
        await page.waitForTimeout(2000);

        await campoSenhaAtual.clear();
        await campoNovaSenha.clear();
        await campoConfirmarSenha.clear();
        await page.waitForTimeout(500);


    });
})
});
