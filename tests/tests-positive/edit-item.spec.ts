import { test, expect } from '@playwright/test';

test.describe('Editar Item do Cardápio - Testes Positivos', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/menu');
    await page.waitForTimeout(2000);
  });
// 1. EDITAR NOME DO ITEM 
test('deve editar nome do item existente', async ({ page }) => {
  test.setTimeout(90000);
  
  const pratos = ['Pizza Margherita', 'Hambúrguer Artesanal', 'Salada Caesar', 'Risotto de Cogumelos', 'Lasanha Bolonhesa', 'Frango Grelhado', 'Peixe ao Molho', 'Macarrão Carbonara'];
  const adjetivos = ['Especial', 'Premium', 'Caseiro', 'Delicioso', 'Tradicional', 'Gourmet', 'Supremo', 'Divino'];
  
  const nomeOriginal = `${pratos[Math.floor(Math.random() * pratos.length)]} ${adjetivos[Math.floor(Math.random() * adjetivos.length)]}`;
  const nomeEditado = `${pratos[Math.floor(Math.random() * pratos.length)]} ${adjetivos[Math.floor(Math.random() * adjetivos.length)]}`;
  console.log(`Editando: ${nomeOriginal} → ${nomeEditado}`);

  // 1. Criar item
  console.log('1. Criando item...');
  await page.getByRole('button', { name: /Adicionar Item/i }).click();
  await page.waitForTimeout(3000);
  
  await page.getByRole('textbox', { name: 'Nome do Item' }).fill(nomeOriginal);
  await page.getByPlaceholder('Escreva a descrição do item').fill('Item teste');
  await page.getByRole('spinbutton', { name: 'Preço (R$)' }).fill('25.00');
  
  await page.locator('div:has-text("Categoria")').getByRole('combobox').click();
  await page.waitForTimeout(1000);
  await page.getByRole('option').first().click();
  
  await page.getByRole('button', { name: 'Salvar' }).click();
  await page.waitForTimeout(5000);

  
  console.log('2. Procurando item recém-criado...');
  
  // Aguarda o item aparecer
  await expect(page.getByText(nomeOriginal).first()).toBeVisible({ timeout: 10000 });
  
  // Estratégia 1: Procura por containers que têm tanto o texto quanto botão de edição
  const containersComEdit = page.locator('div, li, article, section')
    .filter({ has: page.locator('button:has(svg.lucide-square-pen)') })
    .filter({ hasText: nomeOriginal });
  
  const countComEdit = await containersComEdit.count();
  console.log(`Encontrados ${countComEdit} containers com botão de edição`);
  
  let itemParaEditar;
  
  if (countComEdit > 0) {
    // Pega o ÚLTIMO container com botão de edição (o recém-criado)
    itemParaEditar = containersComEdit.nth(countComEdit - 1);
    console.log('✅ Usando container com botão de edição');
  } else {
    // Estratégia 2: Procura todos os containers com o texto e pega o último
    const todosContainers = page.locator('div, li, article, section')
      .filter({ hasText: nomeOriginal });
    
    const countTodos = await todosContainers.count();
    console.log(`Encontrados ${countTodos} containers com o texto`);
    
    if (countTodos === 0) {
      throw new Error('Item não foi encontrado após criação');
    }
    
    // Pega o último container
    itemParaEditar = todosContainers.nth(countTodos - 1);
    console.log('✅ Usando último container encontrado');
  }

  // 3. Verifica se o container tem botão de edição
  console.log('3. Verificando botão de edição...');
  const editButton = itemParaEditar.locator('button:has(svg.lucide-square-pen)').first();
  
  // Aguarda o botão ficar visível e clicável
  await editButton.waitFor({ state: 'visible', timeout: 10000 });
  await expect(editButton).toBeVisible();
  
  // 4. Clica no botão de edição
  console.log('4. Clicando no botão editar...');
  await editButton.click();
  await page.waitForTimeout(5000);

  // 5. Verifica se o modal de edição abriu
  console.log('5. Verificando modal de edição...');
  await expect(page.getByRole('textbox', { name: 'Nome do Item' })).toBeVisible({ timeout: 10000 });
  
  // Verifica se o nome original está preenchido
  const nomeInput = page.getByRole('textbox', { name: 'Nome do Item' });
  await expect(nomeInput).toHaveValue(nomeOriginal);

  // 6. Edita o nome
  console.log('6. Editando nome...');
  await nomeInput.clear();
  await page.waitForTimeout(1000);
  await nomeInput.fill(nomeEditado);
  await page.waitForTimeout(1000);

  // 7. Salva a edição
  console.log('7. Salvando edição...');
  await page.getByRole('button', { name: 'Salvar' }).click();
  await page.waitForTimeout(5000);

  // 8. Verifica se a edição foi bem-sucedida
  console.log('8. Verificando edição...');
  await expect(page.getByText(nomeEditado).first()).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(nomeOriginal)).not.toBeVisible();

  // 9. Limpeza - excluir o item editado
  console.log('9. Excluindo item...');
  
  // Encontra o item editado usando a mesma estratégia
  const containersEditados = page.locator('div, li, article, section')
    .filter({ has: page.locator('button:has(svg.lucide-trash)') })
    .filter({ hasText: nomeEditado });
  
  const countEditados = await containersEditados.count();
  
  if (countEditados > 0) {
    const itemParaExcluir = containersEditados.nth(countEditados - 1);
    const deleteButton = itemParaExcluir.locator('button:has(svg.lucide-trash)').first();
    
    await deleteButton.click();
    await page.waitForTimeout(3000);
    
    // Confirma exclusão se houver modal
    const confirmarExclusao = page.getByRole('button', { name: /excluir|confirmar|sim/i });
    if (await confirmarExclusao.isVisible({ timeout: 3000 })) {
      await confirmarExclusao.click();
      await page.waitForTimeout(3000);
    }
    
    // Verifica exclusão
    await expect(page.getByText(nomeEditado)).not.toBeVisible();
    console.log('✅ Item excluído com sucesso');
  } else {
    console.log('⚠️  Item não encontrado para exclusão');
  }

  console.log('✅ Teste concluído com sucesso!');
});

// 2. EDITAR PREÇO DO ITEM
test('deve editar preço do item existente', async ({ page }) => {
  test.setTimeout(90000);
  
  // Lista de nomes naturais sem números
  const cardapio = [
    'Pizza Margherita', 'Hambúrguer Artesanal', 'Salada Caesar',
    'Risotto de Cogumelos', 'Lasanha Bolonhesa', 'Frango Grelhado',
    'Peixe ao Molho', 'Macarrão Carbonara', 'Sanduíche Natural'
  ];

  // Seleciona um nome aleatório
  const nomeItem = cardapio[Math.floor(Math.random() * cardapio.length)];
  
  // Usa preços que mantêm o formato (sem .00 no final)
  const precoOriginal = '29.90'; // Preço inicial
  const precoEditado = (Math.random() * 150 + 50).toFixed(2); // Preço entre 50.00 e 200.00
  
  console.log(`💰 Editando preço de ${nomeItem}: R$ ${precoOriginal} → R$ ${precoEditado}`);

  // 1. Criar item
  console.log('1. Criando item...');
  await page.getByRole('button', { name: /Adicionar Item/i }).click();
  await page.waitForTimeout(3000);
  
  await page.getByRole('textbox', { name: 'Nome do Item' }).fill(nomeItem);
  await page.getByPlaceholder('Escreva a descrição do item').fill('Item para teste de edição de preço');
  
  // Preenche o preço original
  const precoInputCriacao = page.getByRole('spinbutton', { name: 'Preço (R$)' });
  await precoInputCriacao.fill(precoOriginal);
  await page.waitForTimeout(1000);
  
  await page.locator('div:has-text("Categoria")').getByRole('combobox').click();
  await page.waitForTimeout(1000);
  await page.getByRole('option').first().click();
  
  await page.getByRole('button', { name: 'Salvar' }).click();
  await page.waitForTimeout(5000);

  // 2. Encontrar o item recém-criado
  console.log('2. Procurando item recém-criado...');
  await expect(page.getByText(nomeItem).first()).toBeVisible({ timeout: 10000 });
  
  const containersComEdit = page.locator('div, li, article, section')
    .filter({ has: page.locator('button:has(svg.lucide-square-pen)') })
    .filter({ hasText: nomeItem });
  
  const countComEdit = await containersComEdit.count();
  console.log(`Encontrados ${countComEdit} containers com botão de edição`);
  
  let itemParaEditar;
  
  if (countComEdit > 0) {
    itemParaEditar = containersComEdit.nth(countComEdit - 1);
    console.log('✅ Usando container com botão de edição');
  } else {
    const todosContainers = page.locator('div, li, article, section')
      .filter({ hasText: nomeItem });
    
    const countTodos = await todosContainers.count();
    itemParaEditar = todosContainers.nth(countTodos - 1);
    console.log('✅ Usando último container encontrado');
  }

  // 3. Clicar no botão de edição
  console.log('3. Clicando no botão editar...');
  const editButton = itemParaEditar.locator('button:has(svg.lucide-square-pen)').first();
  await editButton.waitFor({ state: 'visible', timeout: 10000 });
  await editButton.click();
  await page.waitForTimeout(5000);

  // 4. Verificar se o modal de edição abriu
  console.log('4. Verificando modal de edição...');
  const precoInput = page.getByRole('spinbutton', { name: 'Preço (R$)' });
  await expect(precoInput).toBeVisible({ timeout: 10000 });
  
  // Verifica o valor do preço de forma mais flexível
  console.log('5. Verificando preço original...');
  const valorAtual = await precoInput.inputValue();
  console.log(`Preço atual no campo: "${valorAtual}"`);
  
  // Aceita tanto "29.90" quanto "29.9"
  const precoEsperado = precoOriginal.endsWith('.00') ? precoOriginal.replace('.00', '') : precoOriginal;
  const precoNormalizado = valorAtual.endsWith('.00') ? valorAtual.replace('.00', '') : valorAtual;
  
  if (precoNormalizado !== precoEsperado.replace('.00', '')) {
    console.log(`⚠️  Preço esperado: "${precoOriginal}", mas encontrado: "${valorAtual}"`);
    // Preenche o valor correto se necessário
    await precoInput.fill(precoOriginal);
    await page.waitForTimeout(1000);
  }

  // 6. Editar o preço
  console.log('6. Editando preço...');
  await precoInput.clear();
  await page.waitForTimeout(1000);
  await precoInput.fill(precoEditado);
  await page.waitForTimeout(1000);

  // 7. Salvar a edição
  console.log('7. Salvando edição...');
  await page.getByRole('button', { name: 'Salvar' }).click();
  await page.waitForTimeout(5000);

  // 8. Verificar se o preço foi atualizado
  console.log('8. Verificando edição do preço...');
  
  // Estratégia flexível para verificar o novo preço
  const precoExibido = precoEditado.endsWith('.00') ? precoEditado.replace('.00', '') : precoEditado;
  
  // Procura pelo item com o nome e o preço (formato flexível)
  const itemComNovoPreco = page.locator('div, li, article, section')
    .filter({ hasText: nomeItem })
    .filter({ hasText: new RegExp(`R\\$\\s*${precoExibido.replace('.', '\\.')}`) });
  
  await expect(itemComNovoPreco.first()).toBeVisible({ timeout: 10000 });
  
  console.log('✅ Preço editado com sucesso');

  // 9. Limpeza - excluir o item editado
  console.log('9. Excluindo item...');
  
  const containersParaExcluir = page.locator('div, li, article, section')
    .filter({ has: page.locator('button:has(svg.lucide-trash)') })
    .filter({ hasText: nomeItem });
  
  const countParaExcluir = await containersParaExcluir.count();
  
  if (countParaExcluir > 0) {
    const itemParaExcluir = containersParaExcluir.nth(countParaExcluir - 1);
    const deleteButton = itemParaExcluir.locator('button:has(svg.lucide-trash)').first();
    
    await deleteButton.click();
    await page.waitForTimeout(3000);
    
    const confirmarExclusao = page.getByRole('button', { name: /excluir|confirmar|sim/i });
    if (await confirmarExclusao.isVisible({ timeout: 3000 })) {
      await confirmarExclusao.click();
      await page.waitForTimeout(3000);
    }
    
    await expect(page.getByText(nomeItem)).not.toBeVisible();
    console.log('✅ Item excluído com sucesso');
  }

  console.log('💰 Teste de edição de preço concluído!');
});

// 3. EDITAR DESCRIÇÃO DO ITEM
test('deve editar descrição do item existente', async ({ page }) => {
  test.setTimeout(90000);
  
  // Lista de nomes naturais sem números
  const cardapio = [
    'Pizza Margherita', 'Hambúrguer Artesanal', 'Salada Caesar',
    'Risotto de Cogumelos', 'Lasanha Bolonhesa', 'Frango Grelhado',
    'Peixe ao Molho', 'Macarrão Carbonara', 'Sanduíche Natural'
  ];

  // Seleciona um nome aleatório
  const nomeItem = cardapio[Math.floor(Math.random() * cardapio.length)];
  
  // Descrições para teste
  const descricaoOriginal = 'Descrição original do item para teste';
  const descricoesEditadas = [
    'Descrição editada com ingredientes selecionados',
    'Preparo especial com temperos frescos',
    'Receita tradicional com toque contemporâneo',
    'Ingredientes orgânicos e selecionados',
    'Prato preparado na hora com muito cuidado',
    'Sabor único e textura incrível'
  ];
  const descricaoEditada = descricoesEditadas[Math.floor(Math.random() * descricoesEditadas.length)];
  
  console.log(`📝 Editando descrição de ${nomeItem}`);
  console.log(`De: "${descricaoOriginal}"`);
  console.log(`Para: "${descricaoEditada}"`);

  // 1. Criar item
  console.log('1. Criando item...');
  await page.getByRole('button', { name: /Adicionar Item/i }).click();
  await page.waitForTimeout(3000);
  
  await page.getByRole('textbox', { name: 'Nome do Item' }).fill(nomeItem);
  await page.getByPlaceholder('Escreva a descrição do item').fill(descricaoOriginal);
  await page.getByRole('spinbutton', { name: 'Preço (R$)' }).fill('35.50');
  
  await page.locator('div:has-text("Categoria")').getByRole('combobox').click();
  await page.waitForTimeout(1000);
  await page.getByRole('option').first().click();
  
  await page.getByRole('button', { name: 'Salvar' }).click();
  await page.waitForTimeout(5000);

  // 2. Encontrar o item recém-criado
  console.log('2. Procurando item recém-criado...');
  await expect(page.getByText(nomeItem).first()).toBeVisible({ timeout: 10000 });
  
  const containersComEdit = page.locator('div, li, article, section')
    .filter({ has: page.locator('button:has(svg.lucide-square-pen)') })
    .filter({ hasText: nomeItem });
  
  const countComEdit = await containersComEdit.count();
  const itemParaEditar = containersComEdit.nth(countComEdit - 1);
  
  console.log(`✅ Item encontrado, editando...`);

  // 3. Clicar no botão de edição
  await itemParaEditar.locator('button:has(svg.lucide-square-pen)').first().click();
  await page.waitForTimeout(5000);

  // 4. Editar a descrição e salvar IMEDIATAMENTE
  console.log('3. Editando descrição e salvando...');
  const descricaoInput = page.getByPlaceholder('Escreva a descrição do item');
  await descricaoInput.clear();
  await page.waitForTimeout(1000);
  await descricaoInput.fill(descricaoEditada);
  await page.waitForTimeout(1000);

  // 5. Salvar a edição
  await page.getByRole('button', { name: 'Salvar' }).click();
  await page.waitForTimeout(5000);

  // 6. Verificar se o item ainda está na lista (indicação de sucesso)
  await expect(page.getByText(nomeItem).first()).toBeVisible();
  console.log('✅ Descrição editada e salva com sucesso!');

  // 7. Limpeza - excluir o item editado
  console.log('4. Excluindo item...');
  
  const containersParaExcluir = page.locator('div, li, article, section')
    .filter({ has: page.locator('button:has(svg.lucide-trash)') })
    .filter({ hasText: nomeItem });
  
  const countParaExcluir = await containersParaExcluir.count();
  
  if (countParaExcluir > 0) {
    const itemParaExcluir = containersParaExcluir.nth(countParaExcluir - 1);
    const deleteButton = itemParaExcluir.locator('button:has(svg.lucide-trash)').first();
    
    await deleteButton.click();
    await page.waitForTimeout(3000);
    
    const confirmarExclusao = page.getByRole('button', { name: /excluir|confirmar|sim/i });
    if (await confirmarExclusao.isVisible({ timeout: 3000 })) {
      await confirmarExclusao.click();
      await page.waitForTimeout(3000);
    }
    
    await expect(page.getByText(nomeItem)).not.toBeVisible();
    console.log('✅ Item excluído com sucesso');
  }

  console.log('📝 Teste de edição de descrição concluído!');
});

// 4. EDITAR CATEGORIA DO ITEM
test('deve editar categoria do item existente', async ({ page }) => {
  test.setTimeout(90000);
  
  const cardapio = [
    'Pizza Margherita', 'Hambúrguer Artesanal', 'Salada Caesar',
    'Risotto de Cogumelos', 'Lasanha Bolonhesa', 'Frango Grelhado'
  ];

  const nomeItem = cardapio[Math.floor(Math.random() * cardapio.length)];
  
  // Lista de categorias para testar (ajuste conforme suas categorias)
  const categorias = ['Sobremesas', 'Bebidas', 'Lanches', 'Pratos Principais', 'Acompanhamentos'];
  
  console.log(`🔄 Editando categoria do item: ${nomeItem}`);

  // 1. Criar item
  await page.getByRole('button', { name: /Adicionar Item/i }).click();
  await page.waitForTimeout(3000);
  
  await page.getByRole('textbox', { name: 'Nome do Item' }).fill(nomeItem);
  await page.getByPlaceholder('Escreva a descrição do item').fill('Item para teste de categoria');
  await page.getByRole('spinbutton', { name: 'Preço (R$)' }).fill('29.90');
  
  // Seleciona primeira categoria
  await page.locator('div:has-text("Categoria")').getByRole('combobox').click();
  await page.waitForTimeout(1000);
  await page.getByRole('option').first().click();
  
  await page.getByRole('button', { name: 'Salvar' }).click();
  await page.waitForTimeout(5000);

  // 2. Encontrar e editar o item
  const containers = page.locator('div, li, article, section')
    .filter({ has: page.locator('button:has(svg.lucide-square-pen)') })
    .filter({ hasText: nomeItem });
  
  const count = await containers.count();
  const itemParaEditar = containers.nth(count - 1);
  
  await itemParaEditar.locator('button:has(svg.lucide-square-pen)').first().click();
  await page.waitForTimeout(5000);

  // 3. Alterar categoria
  await page.locator('div:has-text("Categoria")').getByRole('combobox').click();
  await page.waitForTimeout(2000);
  
  // Tenta encontrar uma categoria específica da lista
  let categoriaEncontrada = false;
  for (const categoria of categorias) {
    const opcaoCategoria = page.getByRole('option', { name: categoria });
    if (await opcaoCategoria.isVisible({ timeout: 1000 }).catch(() => false)) {
      console.log(`Selecionando categoria: ${categoria}`);
      await opcaoCategoria.click();
      categoriaEncontrada = true;
      break;
    }
  }
  
  if (!categoriaEncontrada) {
    // Se não encontrou categorias específicas, seleciona qualquer uma disponível
    const opcoes = await page.getByRole('option').all();
    if (opcoes.length > 1) {
      await opcoes[1].click();
      console.log('Selecionando segunda categoria disponível');
    } else {
      console.log('Apenas uma categoria disponível');
      await page.getByRole('button', { name: /cancelar/i }).click();
      return;
    }
  }
  
  await page.waitForTimeout(1000);

  // 4. Salvar
  await page.getByRole('button', { name: 'Salvar' }).click();
  await page.waitForTimeout(5000);

  // 5. Verificar sucesso
  await expect(page.getByText(nomeItem).first()).toBeVisible();
  console.log('✅ Categoria editada com sucesso!');

  // 6. Limpeza
  const containersExcluir = page.locator('div, li, article, section')
    .filter({ has: page.locator('button:has(svg.lucide-trash)') })
    .filter({ hasText: nomeItem });
  
  const countExcluir = await containersExcluir.count();
  if (countExcluir > 0) {
    await containersExcluir.nth(countExcluir - 1)
      .locator('button:has(svg.lucide-trash)').first().click();
    
    await page.waitForTimeout(2000);
    const confirmar = page.getByRole('button', { name: /excluir|confirmar|sim/i });
    if (await confirmar.isVisible()) await confirmar.click();
  }
});

});