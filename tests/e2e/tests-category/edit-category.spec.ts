import { test, expect, Page } from '@playwright/test';

test.describe('Editar Categoria', () => {
  let categoriaDeTeste: string = '';

  // Helper para fechar toasts que bloqueiam a UI
  async function fecharToasts(page: Page) {
    // Aguarda os toasts desaparecerem ou tenta fechá-los
    const toasts = page.locator('[role="status"][data-state="open"]');
    const count = await toasts.count();
    for (let i = 0; i < count; i++) {
      try {
        const closeBtn = toasts.nth(i).locator('button[data-dismiss]');
        if (await closeBtn.isVisible({ timeout: 500 }).catch(() => false)) {
          await closeBtn.click();
        }
      } catch { /* toast já desapareceu */ }
    }
    // Espera os toasts sumirem completamente
    await page.waitForTimeout(2000);
  }

  // Helper para excluir a categoria residual se existir
  async function excluirCategoriaSeExistir(page: Page, nome: string) {
    let categoriaLocator = page.locator('div.flex.items-center.p-2').filter({ hasText: nome });

    while (await categoriaLocator.first().isVisible({ timeout: 1500 }).catch(() => false)) {
      await categoriaLocator.first().locator('button:has(svg.lucide-trash)').click();
      await page.waitForTimeout(1000);

      const botaoExcluir = page.getByRole('button', { name: /excluir/i }).last();
      if (await botaoExcluir.isVisible({ timeout: 3000 }).catch(() => false)) {
        await botaoExcluir.click();
        await page.waitForTimeout(3000); // Espera toast sumir
        console.log('Categoria residual excluída: ' + nome);
      }

      await fecharToasts(page);
      // Re-fetch the locator
      categoriaLocator = page.locator('div.flex.items-center.p-2').filter({ hasText: nome });
    }
  }

  test.beforeEach(async ({ page }) => {
    test.setTimeout(120000);
    console.log('Preparando ambiente de teste para categorias...');

    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(2000);
    await page.getByRole('textbox', { name: /e-mail/i }).fill('usuario@teste.com');
    await page.getByRole('textbox', { name: /senha/i }).fill('senhatesteA1');
    await page.locator('button.bg-blue-600').click();
    await page.waitForURL('**/auth/**', { timeout: 20000 });
    await page.waitForTimeout(3000);

    await page.goto('http://localhost:3000/auth/menu');
    await page.waitForTimeout(3000);

    categoriaDeTeste = 'Categoria Para Editar';

    // Limpa categorias residuais de rodadas anteriores
    await excluirCategoriaSeExistir(page, categoriaDeTeste);
    await excluirCategoriaSeExistir(page, 'Categoria Editada');
    await excluirCategoriaSeExistir(page, 'Categoria Com Nome Extremamente Longo Para Teste');

    // Recarrega a página para garantir estado limpo (sem overlays, sem toasts)
    await page.goto('http://localhost:3000/auth/menu');
    await page.waitForTimeout(3000);

    await page.getByRole('button', { name: /Adicionar Categoria/i }).click();
    await page.waitForTimeout(2000);
    await page.getByRole('textbox', { name: /nome da categoria/i }).fill(categoriaDeTeste);
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: /salvar|criar|adicionar/i }).click();
    await page.waitForTimeout(3000);

    // VERIFICAR SE CATEGORIA FOI CRIADA
    await expect(page.getByText(categoriaDeTeste).first()).toBeVisible({ timeout: 5000 });
    console.log('Categoria criada: ' + categoriaDeTeste);
  });


  test.afterEach(async ({ page }) => {
    console.log('Limpando categorias...');

    // Recarrega a página para estado limpo
    await page.goto('http://localhost:3000/auth/menu');
    await page.waitForTimeout(3000);

    await excluirCategoriaSeExistir(page, categoriaDeTeste);
    await excluirCategoriaSeExistir(page, 'Categoria Editada');
    await excluirCategoriaSeExistir(page, 'Categoria Com Nome Extremamente Longo Para Teste');

    console.log('Limpeza concluída');
  });

  // 1. EDITAR NOME DA CATEGORIA
  test('deve editar nome da categoria existente', async ({ page }) => {
    test.setTimeout(60000);
    const novoNome = 'Categoria Editada';

    const categoriaRow = page.locator('div.flex.items-center.p-2').filter({ hasText: categoriaDeTeste });
    await categoriaRow.locator('button:has(svg.lucide-square-pen)').click();
    await page.waitForTimeout(2000);

    await page.getByRole('textbox', { name: /nome da categoria/i }).clear();
    await page.getByRole('textbox', { name: /nome da categoria/i }).fill(novoNome);
    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: /salvar|atualizar/i }).click();
    await page.waitForTimeout(3000);

    await expect(page.getByText(novoNome, { exact: true }).first()).toBeVisible();
    await expect(page.locator('span.text-sm.font-medium').filter({ hasText: new RegExp(`^${categoriaDeTeste}$`) })).toHaveCount(0);

    console.log('Editada: ' + categoriaDeTeste + ' -> ' + novoNome);
  });

  // 2. EDITAR CATEGORIA COM NOME LONGO
  test('deve editar categoria com nome longo', async ({ page }) => {
    test.setTimeout(60000);
    const nomeLongo = 'Categoria Com Nome Extremamente Longo Para Teste';

    const categoriaRow = page.locator('div.flex.items-center.p-2').filter({ hasText: categoriaDeTeste });
    await categoriaRow.locator('button:has(svg.lucide-square-pen)').click();
    await page.waitForTimeout(2000);

    await page.getByRole('textbox', { name: /nome da categoria/i }).clear();
    await page.getByRole('textbox', { name: /nome da categoria/i }).fill(nomeLongo);
    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: /salvar|atualizar/i }).click();
    await page.waitForTimeout(3000);

    await expect(page.getByText(nomeLongo, { exact: true }).first()).toBeVisible();
    console.log('Nome longo editado: ' + nomeLongo);
  });

  // 3. CANCELAR EDIÇÃO
  test('deve cancelar edição sem salvar alterações', async ({ page }) => {
    test.setTimeout(60000);

    const categoriaRow = page.locator('div.flex.items-center.p-2').filter({ hasText: categoriaDeTeste });
    await categoriaRow.locator('button:has(svg.lucide-square-pen)').click();
    await page.waitForTimeout(2000);

    await page.getByRole('textbox', { name: /nome da categoria/i }).clear();
    await page.getByRole('textbox', { name: /nome da categoria/i }).fill('Nome Alterado Cancelado');
    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: /cancelar/i }).click();
    await page.waitForTimeout(2000);

    await expect(page.getByText(categoriaDeTeste, { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Nome Alterado Cancelado', { exact: true })).toHaveCount(0);

    console.log('Edição cancelada - nome mantido: ' + categoriaDeTeste);
  });
});