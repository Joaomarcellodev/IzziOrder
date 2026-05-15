"use client";

import { MenuItem } from "@/app/actions/menu-item-actions";

interface Category {
  id: string | null;
  name: string;
}

interface PrintableMenuProps {
  menuItems: MenuItem[];
  categories: Category[];
}

/**
 * Agrupa itens do menu por categoria, filtrando apenas os disponíveis.
 * Itens sem categoria válida são agrupados em "Outros".
 */
export function groupItemsByCategory(
  menuItems: MenuItem[],
  categories: Category[]
): Map<string, MenuItem[]> {
  const itemsByCategory = new Map<string, MenuItem[]>();

  for (const category of categories) {
    const items = menuItems.filter(
      (item) => item.categoryId === category.id && item.available
    );
    if (items.length > 0) {
      itemsByCategory.set(category.name, items);
    }
  }

  // Itens sem categoria
  const uncategorized = menuItems.filter(
    (item) =>
      item.available &&
      !categories.some((cat) => cat.id === item.categoryId)
  );
  if (uncategorized.length > 0) {
    itemsByCategory.set("Outros", uncategorized);
  }

  return itemsByCategory;
}

export function printMenu({ menuItems, categories }: PrintableMenuProps) {
  const itemsByCategory = groupItemsByCategory(menuItems, categories);

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cardápio</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Lato:wght@300;400;700&display=swap');

    :root {
      --primary-color: #1a1a1a;
      --accent-color: #FD7E14;
      --text-color: #333;
      --bg-color: #FDFBF7;
      --border-color: #E5E0D8;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Lato', -apple-system, sans-serif;
      color: var(--text-color);
      background-color: var(--bg-color);
      line-height: 1.5;
      padding: 40px 20px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .menu-container {
      max-width: 850px;
      margin: 0 auto;
      background: #fff;
      padding: 60px 50px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.05);
      border: 1px solid var(--border-color);
      position: relative;
    }

    .menu-container::before {
      content: '';
      position: absolute;
      top: 15px; left: 15px; right: 15px; bottom: 15px;
      border: 1px solid var(--border-color);
      pointer-events: none;
    }

    .header {
      text-align: center;
      margin-bottom: 50px;
      position: relative;
      z-index: 1;
    }

    .header-icon {
      margin-bottom: 15px;
    }
    
    .header-icon svg {
      width: 48px;
      height: 48px;
      color: var(--accent-color);
    }

    .header h1 {
      font-family: 'Playfair Display', serif;
      font-size: 42px;
      font-weight: 700;
      color: var(--primary-color);
      text-transform: uppercase;
      letter-spacing: 3px;
      margin-bottom: 10px;
    }

    .header p {
      font-family: 'Lato', sans-serif;
      color: #888;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }

    .header::after {
      content: '♦';
      display: block;
      text-align: center;
      color: var(--accent-color);
      font-size: 14px;
      margin-top: 25px;
      letter-spacing: 15px;
    }

    .menu-content {
      column-count: 2;
      column-gap: 60px;
      position: relative;
      z-index: 1;
    }

    @media (max-width: 768px) {
      .menu-content {
        column-count: 1;
      }
    }

    .category-section {
      break-inside: avoid;
      margin-bottom: 40px;
    }

    .category-title {
      font-family: 'Playfair Display', serif;
      font-size: 22px;
      font-weight: 700;
      color: var(--primary-color);
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 25px;
      position: relative;
    }

    .category-title::after {
      content: '';
      display: block;
      width: 40px;
      height: 2px;
      background-color: var(--accent-color);
      margin: 12px auto 0;
    }

    .menu-item {
      margin-bottom: 24px;
      break-inside: avoid;
    }

    .item-header {
      display: flex;
      align-items: baseline;
      margin-bottom: 6px;
    }

    .item-name {
      font-family: 'Playfair Display', serif;
      font-size: 17px;
      font-weight: 600;
      color: var(--primary-color);
      background: #fff;
      padding-right: 8px;
      z-index: 2;
      position: relative;
    }

    .item-leader {
      flex-grow: 1;
      border-bottom: 1px dotted #ccc;
      margin: 0 5px;
      position: relative;
      top: -4px;
    }

    .item-price {
      font-family: 'Lato', sans-serif;
      font-size: 16px;
      font-weight: 700;
      color: var(--primary-color);
      background: #fff;
      padding-left: 8px;
      z-index: 2;
      position: relative;
      white-space: nowrap;
    }

    .item-description {
      font-family: 'Lato', sans-serif;
      font-size: 13px;
      color: #666;
      font-style: italic;
      line-height: 1.5;
      padding-right: 20px;
    }

    .footer {
      text-align: center;
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid var(--border-color);
      font-size: 11px;
      color: #aaa;
      text-transform: uppercase;
      letter-spacing: 1px;
      position: relative;
      z-index: 1;
    }

    .no-print {
      text-align: center;
      margin-bottom: 30px;
    }

    .print-btn {
      background: var(--primary-color);
      color: white;
      border: none;
      padding: 12px 32px;
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      border-radius: 6px;
      cursor: pointer;
      font-family: 'Lato', sans-serif;
      transition: all 0.3s ease;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .print-btn:hover {
      background: var(--accent-color);
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(253, 126, 20, 0.2);
    }

    .print-btn svg {
      width: 18px;
      height: 18px;
      margin-right: 8px;
    }

    @media print {
      @page {
        size: A4;
        margin: 15mm;
      }
      
      body {
        background-color: transparent;
        padding: 0;
      }
      
      .menu-container {
        box-shadow: none;
        border: none;
        padding: 0;
        max-width: 100%;
      }

      .menu-container::before {
        display: none;
      }

      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button class="print-btn" onclick="window.print()">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg>
      Imprimir Cardápio
    </button>
  </div>

  <div class="menu-container">
    <div class="header">
      <div class="header-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
      </div>
      <h1>Cardápio</h1>
      <p>Atualizado em ${new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</p>
    </div>

    <div class="menu-content">
      ${Array.from(itemsByCategory.entries())
        .map(
          ([categoryName, items]) => `
        <div class="category-section">
          <h2 class="category-title">${categoryName}</h2>
          ${items
            .map(
              (item) => `
            <div class="menu-item">
              <div class="item-header">
                <span class="item-name">${item.name}</span>
                <span class="item-leader"></span>
                <span class="item-price">R$ ${item.price.toFixed(2)}</span>
              </div>
              ${item.description ? `<div class="item-description">${item.description}</div>` : ""}
            </div>
          `
            )
            .join("")}
        </div>
      `
        )
        .join("")}
    </div>

    <div class="footer">
      Cardápio gerado por IzziOrder
    </div>
  </div>
</body>
</html>`;

  printWindow.document.write(html);
  printWindow.document.close();
}
