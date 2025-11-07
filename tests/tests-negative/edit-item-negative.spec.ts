import { test, expect, Page } from '@playwright/test';

test.describe('Editar Item do Cardápio - Testes Negativos', () => {
  let itemDeTeste: string = '';

  // PREPARAÇÃO (executa antes de CADA teste)
  test.beforeEach(async ({ page }) => {
    console.log('🔄 Preparando ambiente de teste...');

    await page.goto('http://localhost:3000/menu');
    await page.waitForTimeout(2000);

    if (!itemDeTeste) {
      console.log('🎯 PRIMEIRA EXECUÇÃO - Criando item compartilhado');
      await limparItensDeTesteAnteriores(page);

      const prefixos = ['Pizza', 'Hambúrguer', 'Salada', 'Risotto', 'Lasanha', 'Frango'];
      const sufixos = ['Margherita', 'Artesanal', 'Caesar', 'Cogumelos', 'Bolonhesa', 'Grelhado'];
      const prefixo = prefixos[Math.floor(Math.random() * prefixos.length)];
      const sufixo = sufixos[Math.floor(Math.random() * sufixos.length)];
      itemDeTeste = `${prefixo} ${sufixo} Compartilhado`;

      await page.getByRole('button', { name: /Adicionar Item/i }).click();
      await page.waitForTimeout(2000);
      await page.getByRole('textbox', { name: 'Nome do Item' }).fill(itemDeTeste);
      await page.getByPlaceholder('Escreva a descrição do item').fill('Item compartilhado para testes negativos');
      await page.getByRole('spinbutton', { name: 'Preço (R$)' }).fill('35.50');
      await page.locator('div:has-text("Categoria")').getByRole('combobox').click();
      await page.waitForTimeout(1000);
      await page.getByRole('option').first().click();
      await page.getByRole('button', { name: 'Salvar' }).click();
      await page.waitForTimeout(5000);

      await expect(page.getByText(itemDeTeste).first()).toBeVisible({ timeout: 10000 });
      
    } else {
      
      await expect(page.getByText(itemDeTeste).first()).toBeVisible({ timeout: 10000 });
      
    }
  });

  // LIMPEZA (executa depois de CADA teste)
  test.afterEach(async ({ page }) => {
    console.log(`🧹 AFTEREACH - Removendo item de teste: ${itemDeTeste}`);
    await page.goto('http://localhost:3000/menu');
    await page.waitForTimeout(2000);

    if (itemDeTeste) {
      await excluirItemEspecifico(page, itemDeTeste);
      itemDeTeste = ''; // zera para o próximo beforeEach criar outro
    }
  });

  // 1. EDITAR COM NOME VAZIO
  test('deve bloquear edição com nome vazio', async ({ page }) => {
    test.setTimeout(60000);
    console.log(`❌ Teste 1 - Tentando editar com NOME VAZIO: ${itemDeTeste}`);

    const itemContainer = await encontrarItemRecemCriado(page, itemDeTeste);
    await itemContainer.locator('button:has(svg.lucide-square-pen)').first().click();
    await page.waitForTimeout(3000);

    // Limpa o nome completamente
    await page.getByRole('textbox', { name: 'Nome do Item' }).clear();
    await page.waitForTimeout(1000);

    // Tenta salvar com nome vazio
    await page.getByRole('button', { name: 'Salvar' }).click();
    await page.waitForTimeout(3000);

    // Verifica se ainda está no modal (não salvou) ou se mostra erro
    const aindaNoModal = await page.getByRole('textbox', { name: 'Nome do Item' }).isVisible();
    const temErro = await page.getByText(/erro|obrigatório|nome deve ter|inválido/i).first().isVisible().catch(() => false);
    
    expect(aindaNoModal || temErro).toBeTruthy();
    console.log('✅ Edição com nome vazio foi bloqueada corretamente');

    // Cancela a edição
    await page.getByRole('button', { name: /cancelar/i }).first().click();
    await page.waitForTimeout(2000);
  });

  // 2. EDITAR COM PREÇO ZERO
  test('deve bloquear edição com preço zero', async ({ page }) => {
    test.setTimeout(60000);
    console.log(`❌ Teste 2 - Tentando editar com PREÇO ZERO: ${itemDeTeste}`);

    const itemContainer = await encontrarItemRecemCriado(page, itemDeTeste);
    await itemContainer.locator('button:has(svg.lucide-square-pen)').first().click();
    await page.waitForTimeout(3000);

    // Define preço como zero
    await page.getByRole('spinbutton', { name: 'Preço (R$)' }).clear();
    await page.getByRole('spinbutton', { name: 'Preço (R$)' }).fill('0');
    await page.waitForTimeout(1000);

    // Tenta salvar com preço zero
    await page.getByRole('button', { name: 'Salvar' }).click();
    await page.waitForTimeout(3000);

    // Verifica se ainda está no modal (não salvou) ou se mostra erro
    const aindaNoModal = await page.getByRole('spinbutton', { name: 'Preço (R$)' }).isVisible();
    const temErro = await page.getByText(/erro|preço deve ser maior|inválido|zero/i).first().isVisible().catch(() => false);
    
    expect(aindaNoModal || temErro).toBeTruthy();
    console.log('✅ Edição com preço zero foi bloqueada corretamente');

    // Cancela a edição
    await page.getByRole('button', { name: /cancelar/i }).first().click();
    await page.waitForTimeout(2000);
  });
});

/* ------------------ FUNÇÕES AUXILIARES ------------------ */

async function encontrarItemRecemCriado(page: Page, nomeItem: string) {
  const containersComEdit = page.locator('div, li, article, section')
    .filter({ has: page.locator('button:has(svg.lucide-square-pen)') })
    .filter({ hasText: nomeItem });
  const countComEdit = await containersComEdit.count();
  return containersComEdit.nth(countComEdit - 1);
}

async function excluirItemEspecifico(page: Page, nomeItem: string) {
  console.log(`🗑️  Tentando excluir item: ${nomeItem}`);
  const itens = page.locator('div, li, article, section')
    .filter({ has: page.locator('button:has(svg.lucide-trash)') })
    .filter({ hasText: nomeItem });
  const count = await itens.count();

  if (count > 0) {
    const item = itens.nth(count - 1);
    const deleteButton = item.locator('button:has(svg.lucide-trash)').first();

    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      await page.waitForTimeout(1000);

      const confirmarExclusao = page.getByRole('button', { name: /excluir|confirmar|sim/i });
      if (await confirmarExclusao.isVisible({ timeout: 2000 })) {
        await confirmarExclusao.click();
        await page.waitForTimeout(1000);
        console.log(`✅ Item excluído: ${nomeItem}`);
      }
    }
  } else {
    console.log(`ℹ️  Item não encontrado para exclusão: ${nomeItem}`);
  }
}

async function limparItensDeTesteAnteriores(page: Page) {
  console.log('🧹 Procurando itens de teste anteriores...');
  const nomesTeste = [
    'Pizza Margherita Compartilhado',
    'Hambúrguer Artesanal Compartilhado',
    'Salada Caesar Compartilhado',
    'Risotto Cogumelos Compartilhado',
    'Lasanha Bolonhesa Compartilhado',
    'Frango Grelhado Compartilhado',
    'Pizza Especial Editada',
    'Hambúrguer Premium Editado',
    'Salada Gourmet Editada',
    'Risotto Cremoso Editado',
    'Lasanha Tradicional Editada',
    'Frango Temperado Editado'
  ];
  for (const nome of nomesTeste) {
    await excluirItemEspecifico(page, nome);
  }
}