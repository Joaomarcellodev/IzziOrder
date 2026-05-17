import { test, expect } from '@playwright/test';

test.describe('Order Backlog Recovery', () => {

  test.beforeEach(async ({ page }) => {
    // Login padrão do projeto
    await page.goto('http://localhost:3000/login');
    await page.getByRole('textbox', { name: /e-mail/i }).fill('usuario@teste.com');
    await page.getByRole('textbox', { name: /senha/i }).fill('senhatesteA1');
    
    // Clica e aguarda a navegação de forma mais robusta
    await Promise.all([
      page.waitForURL('**/auth/orders**', { timeout: 30000 }),
      page.locator('button.bg-blue-600').click(),
    ]);

    await page.waitForTimeout(1000);
  });

  test('should toggle pending orders visibility using the counter button', async ({ page }) => {
    // 1. Localiza a coluna de pedidos abertos que está visível (evita erro de duplicidade mobile/desktop)
    const openColumn = page.locator('[data-testid="order-column-OPEN"]').filter({ visible: true }).first();
    await expect(openColumn).toBeVisible();

    // 2. Verifica se o contador está no estado de "pendência" (laranja e pulsante)
    const backlogButton = openColumn.locator('button.bg-orange-500');
    
    if (await backlogButton.isVisible()) {
      // 3. Valida se o botão tem a classe de pulso
      await expect(backlogButton).toHaveClass(/animate-pulse/);

      // 4. Clica no contador para abrir as pendências
      await backlogButton.click();

      // 5. Verifica se a seção de "Pendências" apareceu (flexível com regex)
      const backlogSection = page.getByText(/Pendência/i).first();
      await expect(backlogSection).toBeVisible();

      // 6. Verifica se o badge "Pendente" aparece em algum card
      const pendingBadge = page.locator('span:has-text("Pendente")').first();
      await expect(pendingBadge).toBeVisible();

      // 7. Clica no botão "Esconder Pendências" ao final da lista
      const hideButton = page.getByRole('button', { name: /Esconder Pendências/i });
      await expect(hideButton).toBeVisible();
      await hideButton.click();

      // 8. Valida que a seção de pendências foi escondida
      await expect(backlogSection).not.toBeVisible();
    } else {
      // Se não houver pendências no banco de teste, validamos o contador normal
      const normalCounter = openColumn.locator('span.bg-gray-200');
      await expect(normalCounter).toBeVisible();
    }
  });

  test('should display date on order cards', async ({ page }) => {
    const orderCard = page.locator('[data-testid="order-card"]').first();
    
    if (await orderCard.isVisible()) {
      // Procura pelo padrão de data XX/XX (ex: 10/05)
      const dateText = orderCard.locator('span', { hasText: /^\d{2}\/\d{2}$/ });
      await expect(dateText).toBeVisible();
    }
  });
});
