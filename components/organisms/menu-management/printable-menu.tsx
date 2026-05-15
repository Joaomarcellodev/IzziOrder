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

export function printMenu({ menuItems, categories }: PrintableMenuProps) {
  // Agrupa os itens por categoria
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
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, sans-serif;
      color: #1a1a1a;
      background: #fff;
      padding: 32px;
      max-width: 800px;
      margin: 0 auto;
    }

    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 24px;
      border-bottom: 3px solid #FD7E14;
    }

    .header h1 {
      font-size: 32px;
      font-weight: 800;
      color: #1a1a1a;
      letter-spacing: -0.5px;
    }

    .header p {
      color: #666;
      font-size: 14px;
      margin-top: 8px;
    }

    .category-section {
      margin-bottom: 32px;
      break-inside: avoid;
    }

    .category-title {
      font-size: 20px;
      font-weight: 700;
      color: #FD7E14;
      padding-bottom: 8px;
      margin-bottom: 16px;
      border-bottom: 2px solid #f0f0f0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .menu-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 10px 0;
      border-bottom: 1px dotted #ddd;
    }

    .menu-item:last-child {
      border-bottom: none;
    }

    .item-info {
      flex: 1;
      padding-right: 16px;
    }

    .item-name {
      font-size: 15px;
      font-weight: 600;
      color: #1a1a1a;
    }

    .item-description {
      font-size: 12px;
      color: #888;
      margin-top: 2px;
      line-height: 1.4;
    }

    .item-price {
      font-size: 15px;
      font-weight: 700;
      color: #1a1a1a;
      white-space: nowrap;
    }

    .footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 2px solid #f0f0f0;
      text-align: center;
      color: #aaa;
      font-size: 11px;
    }

    .no-print {
      text-align: center;
      margin-bottom: 24px;
    }

    .print-btn {
      background: #FD7E14;
      color: white;
      border: none;
      padding: 12px 32px;
      font-size: 15px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      transition: background 0.2s;
    }

    .print-btn:hover {
      background: #e06b0a;
    }

    @media print {
      body {
        padding: 16px;
      }

      .no-print {
        display: none !important;
      }

      .category-section {
        break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button class="print-btn" onclick="window.print()">🖨️ Imprimir Cardápio</button>
  </div>

  <div class="header">
    <h1>📋 Cardápio</h1>
    <p>Atualizado em ${new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</p>
  </div>

  ${Array.from(itemsByCategory.entries())
    .map(
      ([categoryName, items]) => `
    <div class="category-section">
      <h2 class="category-title">${categoryName}</h2>
      ${items
        .map(
          (item) => `
        <div class="menu-item">
          <div class="item-info">
            <div class="item-name">${item.name}</div>
            ${item.description ? `<div class="item-description">${item.description}</div>` : ""}
          </div>
          <div class="item-price">R$ ${item.price.toFixed(2)}</div>
        </div>
      `
        )
        .join("")}
    </div>
  `
    )
    .join("")}

  <div class="footer">
    Cardápio gerado automaticamente por IzziOrder
  </div>
</body>
</html>`;

  printWindow.document.write(html);
  printWindow.document.close();
}
