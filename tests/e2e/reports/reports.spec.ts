import { test, expect } from '@playwright/test';

test.describe('Reports Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.getByRole('textbox', { name: /e-mail/i }).fill('usuario@teste.com');
    await page.getByRole('textbox', { name: /senha/i }).fill('senhatesteA1');
    await page.getByRole('button', { name: /entrar/i }).click();
    
    await page.waitForURL('**/auth/orders**');
    await page.goto('http://localhost:3000/auth/reports');
    await page.waitForLoadState('networkidle');
  });

  test('should load sales analysis page correctly', async ({ page }) => {
    await expect(page.getByText(/Análise de Vendas/i)).toBeVisible();
    await expect(page.getByText(/Total de Vendas/i)).toBeVisible({ timeout: 10000 });
  });

  test('should toggle filters panel', async ({ page }) => {
    const filterButton = page.getByRole('button', { name: /Filtrar/i });
    await filterButton.click();
    await expect(page.getByText(/Filtrar por datas/i)).toBeVisible();
    await filterButton.click();
    await expect(page.getByText(/Filtrar por datas/i)).not.toBeVisible();
  });

  test('should navigate between tabs', async ({ page }) => {
    await page.getByRole('tab', { name: /Produtos/i }).click();
    await expect(page.getByText(/Análise de Performance por Item/i)).toBeVisible();
    await page.getByRole('tab', { name: /Pedidos/i }).click();
    await expect(page.getByText(/Histórico de Pedidos/i)).toBeVisible();
  });

  test('should apply payment filter', async ({ page }) => {
    await page.getByRole('button', { name: /Filtrar/i }).click();
    const container = page.locator('div.space-y-2').filter({ has: page.getByText(/^Pagamento$/, { exact: true }) });
    await container.getByRole('combobox').click();
    await page.getByRole('option', { name: 'PIX' }).click();
    await expect(page.getByText(/Total de Vendas/i)).toBeVisible();
  });

  test('should apply date filters', async ({ page }) => {
    await page.getByRole('button', { name: /Filtrar/i }).click();
    await page.locator('input[type="date"]').first().fill('2024-01-01');
    await page.locator('input[type="date"]').last().fill('2024-12-31');
    await expect(page.getByText(/Total de Vendas/i)).toBeVisible();
  });

  test('should apply product filter', async ({ page }) => {
    await page.getByRole('button', { name: /Filtrar/i }).click();
    const container = page.locator('div.space-y-2').filter({ has: page.getByText(/^Produto$/, { exact: true }) });
    await container.getByRole('combobox').click();
    await page.getByRole('option').nth(1).click();
    await expect(page.getByText(/Total de Vendas/i)).toBeVisible();
  });

  test('should apply order type filter', async ({ page }) => {
    await page.getByRole('button', { name: /Filtrar/i }).click();
    const container = page.locator('div.space-y-2').filter({ has: page.getByText(/^Tipo de Entrega$/, { exact: true }) });
    await container.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Local' }).click();
    await expect(page.getByText(/Total de Vendas/i)).toBeVisible();
  });

  test('should combine multiple filters', async ({ page }) => {
    await page.getByRole('button', { name: /Filtrar/i }).click();
    await page.locator('div.space-y-2').filter({ has: page.getByText(/^Pagamento$/, { exact: true }) }).getByRole('combobox').click();
    await page.getByRole('option', { name: 'PIX' }).click();
    await page.locator('div.space-y-2').filter({ has: page.getByText(/^Tipo de Entrega$/, { exact: true }) }).getByRole('combobox').click();
    await page.getByRole('option', { name: 'Local' }).click();
    await expect(page.getByText(/Total de Vendas/i)).toBeVisible();
  });

  test('should render charts in general tab', async ({ page }) => {
    await expect(page.locator('.recharts-responsive-container')).toHaveCount(2, { timeout: 10000 });
  });

  test('should persist filters when switching tabs', async ({ page }) => {
    await page.getByRole('button', { name: /Filtrar/i }).click();
    await page.locator('div.space-y-2').filter({ has: page.getByText(/^Pagamento$/, { exact: true }) }).getByRole('combobox').click();
    await page.getByRole('option', { name: 'PIX' }).click();

    await page.getByRole('tab', { name: /Produtos/i }).click();
    await page.getByRole('button', { name: /Filtrar/i }).click();
    await expect(page.locator('[data-slot="select-value"]').filter({ hasText: 'PIX' })).toBeVisible();
  });

  test('should filter using MonthYearPicker', async ({ page }) => {
    await page.getByRole('button', { name: /Filtrar/i }).click();
    await page.locator('div.space-y-2').filter({ has: page.getByText(/Filtrar por mês/) }).getByRole('button', { name: /Selecionar/i }).click();
    await page.getByRole('button', { name: /jan/i }).click();
    await expect(page.getByText(/Total de Vendas/i)).toBeVisible();
  });

  test('should navigate years in MonthYearPicker', async ({ page }) => {
    await page.getByRole('button', { name: /Filtrar/i }).click();
    await page.locator('div.space-y-2').filter({ has: page.getByText(/Filtrar por mês/) }).getByRole('button', { name: /Selecionar/i }).click();
    const currentYear = await page.locator('div.font-semibold').innerText();
    await page.locator('button').filter({ has: page.locator('svg.lucide-chevron-left') }).click();
    await expect(page.getByText((parseInt(currentYear) - 1).toString())).toBeVisible();
  });

  test('should expand day in order history table', async ({ page }) => {
    await page.getByRole('tab', { name: /Pedidos/i }).click();
    const dayButton = page.locator('button').filter({ has: page.locator('svg.lucide-chevron-right') }).first();
    if (await dayButton.isVisible()) {
      await dayButton.click();
      await expect(page.locator('svg.lucide-chevron-down').first()).toBeVisible();
    }
  });
});
