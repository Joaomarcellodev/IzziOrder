import { test, expect, Page } from '@playwright/test';

test.describe('Editar Categoria', () => {
  let categoriaDeTeste: string = '';

  
  test.beforeEach(async ({ page }) => {
    console.log('Preparando ambiente de teste para categorias...');

    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(2000);
    await page.getByRole('textbox', { name: /e-mail/i }).fill('usuario@teste.com');
    await page.getByRole('textbox', { name: /senha/i }).fill('senhatesteA1');
    await page.locator('button.bg-blue-600').click();
    await page.waitForURL('**/auth/**', { timeout: 20000 });
    await page.waitForTimeout(3000);


    await page.goto('http://localhost:3000/auth/menu');
    await page.waitForTimeout(2000);

    categoriaDeTeste = 'Categoria Para Editar';

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
    console.log('Limpando categoria: ' + categoriaDeTeste);

    if (!page.url().includes('/auth/menu')) {
      await page.goto('http://localhost:3000/auth/menu');
      await page.waitForTimeout(2000);
    }

    if (categoriaDeTeste) {
      try {
        await page.locator('button:has(svg.lucide-trash)').last().click();
        await page.waitForTimeout(1000);

        const botaoConfirmar = page.getByRole('button', { name: /excluir|confirmar|sim/i });
        if (await botaoConfirmar.isVisible({ timeout: 2000 })) {
          await botaoConfirmar.click();
          await page.waitForTimeout(1000);
          console.log('Ultima categoria excluída: ' + categoriaDeTeste);
        }
      } catch (error) {
        console.log('Categoria não encontrada para exclusão: ' + categoriaDeTeste);
      }
    }
  });

  // 1. EDITAR NOME DA CATEGORIA
  test('deve editar nome da categoria existente', async ({ page }) => {
    test.setTimeout(60000);
    const novoNome = 'Categoria Editada';

    await page.locator('button:has(svg.lucide-square-pen)').last().click();
    await page.waitForTimeout(2000);

    await page.getByRole('textbox', { name: /nome da categoria/i }).clear();
    await page.getByRole('textbox', { name: /nome da categoria/i }).fill(novoNome);
    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: /salvar|atualizar/i }).click();
    await page.waitForTimeout(3000);

    await expect(page.getByText(novoNome).first()).toBeVisible();
    await expect(page.locator('span.text-sm.font-medium').getByText(categoriaDeTeste)).not.toBeVisible();

    console.log('Editada: ' + categoriaDeTeste + ' -> ' + novoNome);
  });

  // 2. EDITAR CATEGORIA COM NOME LONGO
  test('deve editar categoria com nome longo', async ({ page }) => {
    test.setTimeout(60000);
    const nomeLongo = 'Categoria Com Nome Extremamente Longo Para Teste';

    await page.locator('button:has(svg.lucide-square-pen)').last().click();
    await page.waitForTimeout(2000);

    await page.getByRole('textbox', { name: /nome da categoria/i }).clear();
    await page.getByRole('textbox', { name: /nome da categoria/i }).fill(nomeLongo);
    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: /salvar|atualizar/i }).click();
    await page.waitForTimeout(3000);

    await expect(page.getByText(nomeLongo).first()).toBeVisible();
    console.log('Nome longo editado: ' + nomeLongo);
  });

  // 3. CANCELAR EDIÇÃO
  test('deve cancelar edição sem salvar alterações', async ({ page }) => {
    test.setTimeout(60000);

    await page.locator('button:has(svg.lucide-square-pen)').last().click();
    await page.waitForTimeout(2000);

    await page.getByRole('textbox', { name: /nome da categoria/i }).clear();
    await page.getByRole('textbox', { name: /nome da categoria/i }).fill('Nome Alterado Cancelado');
    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: /cancelar/i }).click();
    await page.waitForTimeout(2000);

    await expect(page.getByText(categoriaDeTeste).first()).toBeVisible();
    await expect(page.getByText('Nome Alterado Cancelado')).not.toBeVisible();

    console.log('Edição cancelada - nome mantido: ' + categoriaDeTeste);
  });
});