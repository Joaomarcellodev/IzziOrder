import { test, expect } from '@playwright/test';

test.describe('Reports PDF and Unified Data', () => {
  // Aumenta o timeout global para este describe devido à lentidão de compilação
  test.slow();

  test.beforeEach(async ({ page }) => {
    // Login com timeout estendido
    await page.goto('http://localhost:3000/login', { timeout: 60000 });
    await page.getByRole('textbox', { name: /e-mail/i }).fill('usuario@teste.com');
    await page.getByRole('textbox', { name: /senha/i }).fill('senhatesteA1');
    await page.getByRole('button', { name: /entrar/i }).click();
    
    await page.waitForURL('**/auth/orders**', { timeout: 60000 });
    await page.goto('http://localhost:3000/auth/reports', { timeout: 60000 });
    await page.waitForLoadState('networkidle');
  });

  test('should show PDF Export button and trigger download', async ({ page }) => {
    // Espera os dados carregarem para o botão aparecer
    await expect(page.getByText(/Total de Vendas/i)).toBeVisible({ timeout: 30000 });
    
    const exportButton = page.getByText(/Exportar PDF/i);
    await expect(exportButton).toBeVisible();
    
    // Verifica se o botão não está em estado de "Gerando..."
    await expect(page.getByText(/Gerando.../i)).not.toBeVisible({ timeout: 15000 });

    const downloadPromise = page.waitForEvent('download');
    await exportButton.click();
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toContain('relatorio-vendas');
    expect(download.suggestedFilename()).toContain('.pdf');
  });

  test('should unify Cash and Dinheiro into Espécie in filters', async ({ page }) => {
    await page.getByRole('button', { name: /Filtrar/i }).click();
    
    // Localiza o Select de Pagamento
    const container = page.locator('div.space-y-2').filter({ has: page.getByText(/^Pagamento$/, { exact: true }) });
    const selectTrigger = container.getByRole('combobox');
    await selectTrigger.click();
    
    // Procura pela opção "Espécie" (que unifica as outras no banco)
    const optionEspecie = page.locator('[role="option"]').filter({ hasText: /^Espécie$/ });
    await expect(optionEspecie).toBeVisible({ timeout: 15000 });
    
    // Verifica que as opções brutas do banco não aparecem diretamente aqui
    await expect(page.locator('[role="option"]').filter({ hasText: /^ESPECIE_COM_TROCO$/ })).not.toBeVisible();
    
    await optionEspecie.click();
    
    // Garante que a tela atualizou
    await expect(page.getByText(/Total de Vendas/i)).toBeVisible();
  });

  test('should display correct unified specie values in KPI stats', async ({ page }) => {
     await page.getByRole('button', { name: /Filtrar/i }).click();
     const container = page.locator('div.space-y-2').filter({ has: page.getByText(/^Pagamento$/, { exact: true }) });
     await container.getByRole('combobox').click();
     
     const optionEspecie = page.locator('[role="option"]').filter({ hasText: /^Espécie$/ });
     await optionEspecie.click();

     // Pequena espera para os dados processarem e a UI estabilizar
     await page.waitForTimeout(1000);

     // Procura pelo card que contém o título exato e pega o valor text-2xl
     const valueDisplay = page.locator('div').filter({ hasText: /^Total de Vendas$/ }).locator('..').locator('.text-2xl');
     
     await expect(valueDisplay).toBeVisible({ timeout: 20000 });
     
     const textValue = await valueDisplay.innerText();
     console.log('Valor do KPI unificado (Espécie):', textValue);
     
     // Garantir que não está vazio nem zerado (se houver dados)
     expect(textValue).not.toBe('R$ 0,00');
     expect(textValue).toMatch(/R\$ [0-9]/);
  });
});
