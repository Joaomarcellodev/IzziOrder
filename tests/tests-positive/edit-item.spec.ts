import { test, expect, Page } from '@playwright/test';

test.describe('Editar Item do Cardápio - Testes Positivos', () => {
  let itemDeTeste: string = '';

  // PREPARAÇÃO (executa antes de CADA teste)
  test.beforeEach(async ({ page }) => {
    console.log('🔄 Preparando ambiente de teste...');

    await page.goto('http://localhost:3001/menu');
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
      await page.getByPlaceholder('Escreva a descrição do item').fill('Item compartilhado para todos os testes');
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
    await page.goto('http://localhost:3001/menu');
    await page.waitForTimeout(2000);

    if (itemDeTeste) {
      await excluirItemEspecifico(page, itemDeTeste);
      itemDeTeste = ''; // zera para o próximo beforeEach criar outro
    }
  });

  // 1. EDITAR NOME DO ITEM
  test('deve editar nome do item existente', async ({ page }) => {
    test.setTimeout(60000);
    console.log(`📝 Teste 1 - Editando NOME do item: ${itemDeTeste}`);

    const novosNomes = [
      'Pizza Especial ',
      'Hambúrguer Premium ',
      
    ];
    const novoNome = novosNomes[Math.floor(Math.random() * novosNomes.length)];

    const itemContainer = await encontrarItemRecemCriado(page, itemDeTeste);
    await itemContainer.locator('button:has(svg.lucide-square-pen)').first().click();
    await page.waitForTimeout(3000);
    await page.getByRole('textbox', { name: 'Nome do Item' }).clear();
    await page.getByRole('textbox', { name: 'Nome do Item' }).fill(novoNome);
    await page.getByRole('button', { name: 'Salvar' }).click();
    await page.waitForTimeout(5000);
    await expect(page.getByText(novoNome).first()).toBeVisible();

    const nomeAnterior = itemDeTeste;
    itemDeTeste = novoNome;
    console.log(`✅ NOME EDITADO: ${nomeAnterior} → ${itemDeTeste}`);
  });

  // 2. EDITAR PREÇO DO ITEM
  test('deve editar preço do item existente', async ({ page }) => {
    test.setTimeout(60000);
    console.log(`💰 Teste 2 - Editando PREÇO do item: ${itemDeTeste}`);

    const novoPreco = (Math.random() * 150 + 50).toFixed(2);
    const itemContainer = await encontrarItemRecemCriado(page, itemDeTeste);
    await itemContainer.locator('button:has(svg.lucide-square-pen)').first().click();
    await page.waitForTimeout(3000);
    await page.getByRole('spinbutton', { name: 'Preço (R$)' }).clear();
    await page.getByRole('spinbutton', { name: 'Preço (R$)' }).fill(novoPreco);
    await page.getByRole('button', { name: 'Salvar' }).click();
    await page.waitForTimeout(5000);

    const precoExibido = novoPreco.endsWith('.00') ? novoPreco.replace('.00', '') : novoPreco;
    const itemComNovoPreco = page.locator('div, li, article, section')
      .filter({ hasText: itemDeTeste })
      .filter({ hasText: new RegExp(`R\\$\\s*${precoExibido.replace('.', '\\.')}`) });

    await expect(itemComNovoPreco.first()).toBeVisible();
    console.log(`✅ PREÇO EDITADO: R$ ${novoPreco} no item: ${itemDeTeste}`);
  });

  // 3. EDITAR DESCRIÇÃO DO ITEM
  test('deve editar descrição do item existente', async ({ page }) => {
    test.setTimeout(60000);
    console.log(`📄 Teste 3 - Editando DESCRIÇÃO do item: ${itemDeTeste}`);

    const novasDescricoes = [
      'Preparo especial com temperos frescos',
      'Ingredientes orgânicos e selecionados',
      'Sabor único e textura incrível'
    ];
    const novaDescricao = novasDescricoes[Math.floor(Math.random() * novasDescricoes.length)];

    const itemContainer = await encontrarItemRecemCriado(page, itemDeTeste);
    await itemContainer.locator('button:has(svg.lucide-square-pen)').first().click();
    await page.waitForTimeout(3000);
    await page.getByPlaceholder('Escreva a descrição do item').clear();
    await page.getByPlaceholder('Escreva a descrição do item').fill(novaDescricao);
    await page.getByRole('button', { name: 'Salvar' }).click();
    await page.waitForTimeout(5000);
    await expect(page.getByText(itemDeTeste).first()).toBeVisible();
    console.log(`✅ DESCRIÇÃO EDITADA no item: ${itemDeTeste}`);
  });

  // 4. EDITAR CATEGORIA DO ITEM
  test('deve editar categoria do item existente', async ({ page }) => {
    test.setTimeout(60000);
    console.log(`🔄 Teste 4 - Editando CATEGORIA do item: ${itemDeTeste}`);

    const itemContainer = await encontrarItemRecemCriado(page, itemDeTeste);
    await itemContainer.locator('button:has(svg.lucide-square-pen)').first().click();
    await page.waitForTimeout(3000);
    await page.locator('div:has-text("Categoria")').getByRole('combobox').click();
    await page.waitForTimeout(2000);

    const todasOpcoes = await page.getByRole('option').all();
    if (todasOpcoes.length > 3) {
      await todasOpcoes[3].click();
      await page.waitForTimeout(1000);
      await page.getByRole('button', { name: 'Salvar' }).click();
      await page.waitForTimeout(5000);
      await expect(page.getByText(itemDeTeste).first()).toBeVisible();
      console.log(`✅ CATEGORIA EDITADA no item: ${itemDeTeste}`);
    } else {
      console.log('⚠️  Apenas uma categoria disponível, teste pulado');
      await page.getByRole('button', { name: /cancelar/i }).click();
    }
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