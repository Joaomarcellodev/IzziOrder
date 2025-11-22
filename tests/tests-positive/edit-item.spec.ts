import { test, expect, Page } from '@playwright/test';

test.describe('Editar Item do Cardápio - Testes Positivos', () => {
  let itemDeTeste: string = '';

// Preparar teste
  test.beforeEach(async ({ page }) => {
    console.log('Preparando ambiente de teste...');

    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(2000);

    await page.getByRole('textbox', { name: /e-mail/i }).fill('usuario@teste.com');
    await page.getByRole('textbox', { name: /senha/i }).fill('senhateste');
    await page.locator('button.bg-blue-600').click();
    
    
    await page.waitForURL('**/auth/**', { timeout: 15000 });
    await page.waitForTimeout(3000);

    console.log('Login realizado com sucesso - URL atual:', page.url());


    const urlAtual = page.url();
    if (urlAtual.includes('/menu')) {
      console.log('Já está na página do menu');
    } else {
      console.log('Navegando para o menu');
      await page.goto('http://localhost:3000/auth/menu');
      await page.waitForTimeout(2000);
    }

    
    if (!itemDeTeste) {
      console.log('PRIMEIRA EXECUÇÃO - Criando item compartilhado');
      await limparItensDeTesteAnteriores(page);

    
      itemDeTeste = `Item Teste`;

      await page.getByRole('button', { name: /Adicionar Item/i }).click();
      await page.waitForTimeout(2000);
      await page.getByRole('textbox', { name: 'Nome do Item' }).fill(itemDeTeste);
      await page.getByPlaceholder('Escreva a descrição do item').fill('Descrição Teste');
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

  // Limpeza depois de cada teste
  test.afterEach(async ({ page }) => {
    console.log(`AFTEREACH - Removendo item de teste: ${itemDeTeste}`);
    
    if (!page.url().includes('/auth/menu')) {
      await page.goto('http://localhost:3000/auth/menu');
      await page.waitForTimeout(2000);
    }

    if (itemDeTeste) {
      await excluirItemEspecifico(page, itemDeTeste);
      itemDeTeste = ''; 
    }
  });

  // 1. EDITAR NOME DO ITEM
  test('deve editar nome do item existente', async ({ page }) => {
    test.setTimeout(60000);
    console.log(`Teste 1 - Editando NOME do item: ${itemDeTeste}`);

    const novoNome = `Item Editado`;

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
    console.log(`NOME EDITADO: ${nomeAnterior} -> ${itemDeTeste}`);
  });

  // 2. EDITAR PREÇO DO ITEM
  test('deve editar preço do item existente', async ({ page }) => {
    test.setTimeout(60000);
    console.log(`Teste 2 - Editando PREÇO do item: ${itemDeTeste}`);

    const novoPreco = '45.90';

    const itemContainer = await encontrarItemRecemCriado(page, itemDeTeste);
    await itemContainer.locator('button:has(svg.lucide-square-pen)').first().click();
    await page.waitForTimeout(3000);
    await page.getByRole('spinbutton', { name: 'Preço (R$)' }).clear();
    await page.getByRole('spinbutton', { name: 'Preço (R$)' }).fill(novoPreco);
    await page.getByRole('button', { name: 'Salvar' }).click();
    await page.waitForTimeout(5000);

    
    const itemAtualizado = page.locator('div, li, article, section')
      .filter({ hasText: itemDeTeste })
      .filter({ hasText: new RegExp(`R\\$\\s*${novoPreco}`) });
    
    await expect(itemAtualizado.first()).toBeVisible();
    console.log(`PREÇO EDITADO: R$ ${novoPreco} no item: ${itemDeTeste}`);
  });

  // 3. EDITAR DESCRIÇÃO DO ITEM
  test('deve editar descrição do item existente', async ({ page }) => {
    test.setTimeout(60000);
    console.log(`Teste 3 - Editando DESCRIÇÃO do item: ${itemDeTeste}`);

    const novaDescricao = 'Nova descrição do item atualizada';

    const itemContainer = await encontrarItemRecemCriado(page, itemDeTeste);
    await itemContainer.locator('button:has(svg.lucide-square-pen)').first().click();
    await page.waitForTimeout(3000);
    await page.getByPlaceholder('Escreva a descrição do item').clear();
    await page.getByPlaceholder('Escreva a descrição do item').fill(novaDescricao);
    await page.getByRole('button', { name: 'Salvar' }).click();
    await page.waitForTimeout(5000);
    
    
    await itemContainer.locator('button:has(svg.lucide-square-pen)').first().click();
    await page.waitForTimeout(3000);
    
    const descricaoSalva = await page.getByPlaceholder('Escreva a descrição do item').inputValue();
    await page.getByRole('button', { name: 'Cancelar' }).click();
    
    expect(descricaoSalva).toBe(novaDescricao);
    console.log(`DESCRIÇÃO EDITADA no item: ${itemDeTeste}`);
  });

  // 4. EDITAR CATEGORIA DO ITEM
  test('deve editar categoria do item existente', async ({ page }) => {
    test.setTimeout(60000);
    console.log(`Teste 4 - Editando CATEGORIA do item: ${itemDeTeste}`);

    const itemContainer = await encontrarItemRecemCriado(page, itemDeTeste);
    await itemContainer.locator('button:has(svg.lucide-square-pen)').first().click();
    await page.waitForTimeout(3000);
    
  
    await page.locator('div:has-text("Categoria")').getByRole('combobox').click();
    await page.waitForTimeout(2000);

    
    const todasOpcoes = await page.getByRole('option').all();
    
    if (todasOpcoes.length > 1) {
    
      await todasOpcoes[1].click();
      await page.waitForTimeout(1000);
      await page.getByRole('button', { name: 'Salvar' }).click();
      await page.waitForTimeout(5000);
      
      await expect(page.getByText(itemDeTeste).first()).toBeVisible();
      console.log(`CATEGORIA EDITADA no item: ${itemDeTeste}`);
    } else {
      console.log('Apenas uma categoria disponível, teste pulado');
      await page.getByRole('button', { name: /cancelar/i }).click();
    }
  });
});

// FUNÇÕES AUXILIARES SIMPLIFICADAS
async function encontrarItemRecemCriado(page: Page, nomeItem: string) {

  const itens = page.locator('div, li, article, section')
    .filter({ hasText: nomeItem })
    .filter({ has: page.locator('button:has(svg.lucide-square-pen)') });
  

  const quantidade = await itens.count();
  return itens.nth(quantidade - 1);
}

async function excluirItemEspecifico(page: Page, nomeItem: string) {
  console.log(`Excluindo item: ${nomeItem}`);
  
  
  const item = page.locator('div, li, article, section')
    .filter({ hasText: nomeItem })
    .filter({ has: page.locator('button:has(svg.lucide-trash)') })
    .last();
  

  if (await item.isVisible()) {
    await item.locator('button:has(svg.lucide-trash)').click();
    await page.waitForTimeout(1000);
    
  
    const botaoConfirmar = page.getByRole('button', { name: /excluir/i });
    if (await botaoConfirmar.isVisible({ timeout: 2000 })) {
      await botaoConfirmar.click();
      await page.waitForTimeout(1000);
    }
  }
}

async function limparItensDeTesteAnteriores(page: Page) {
  console.log('Limpando itens de teste antigos');
  
  
  await excluirItemEspecifico(page, 'Item Teste');
  await excluirItemEspecifico(page, 'Item Editado');
}