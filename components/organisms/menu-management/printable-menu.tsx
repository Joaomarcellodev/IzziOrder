"use client";

import { MenuItem } from "@/app/actions/menu-item-actions";
import { Document, Page, Text, View, StyleSheet, pdf, Image } from '@react-pdf/renderer';

const BRAND_COLORS = {
  blue: '#007BFF',
  orange: '#FD7E14',
  dark: '#0f172a',
  gray: '#64748b',
  border: '#e2e8f0',
  zebra: '#f8fafc'
};

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

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 35,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoImage: {
    width: 32,
    height: 32,
    borderRadius: 6,
  },
  brandIzzi: {
    fontSize: 24,
    fontWeight: 'bold',
    color: BRAND_COLORS.blue,
  },
  brandOrder: {
    fontSize: 24,
    fontWeight: 'bold',
    color: BRAND_COLORS.orange,
  },
  headerInfo: {
    textAlign: 'right',
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BRAND_COLORS.dark,
    textTransform: 'uppercase',
  },
  reportSubtitle: {
    fontSize: 9,
    color: BRAND_COLORS.gray,
    marginTop: 2,
  },
  menuContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 25,
  },
  column: {
    flex: 1,
  },
  categorySection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: BRAND_COLORS.gray,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 4,
  },
  menuItem: {
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  itemName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: BRAND_COLORS.dark,
  },
  itemLeader: {
    flexGrow: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginHorizontal: 4,
    position: 'relative',
    top: -3,
  },
  itemPrice: {
    fontSize: 10,
    fontWeight: 'bold',
    color: BRAND_COLORS.dark,
  },
  itemDescription: {
    fontSize: 8,
    color: BRAND_COLORS.gray,
    lineHeight: 1.3,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    color: BRAND_COLORS.gray,
    fontSize: 7,
  }
});

const MenuDocument = ({ itemsByCategory }: { itemsByCategory: Map<string, MenuItem[]> }) => {
  const isClient = typeof window !== 'undefined';
  const logoUrl = isClient ? `${window.location.origin}/apple-touch-icon.png` : '/apple-touch-icon.png';

  const categoriesArray = Array.from(itemsByCategory.entries());
  const half = Math.ceil(categoriesArray.length / 2);
  const leftColumn = categoriesArray.slice(0, half);
  const rightColumn = categoriesArray.slice(half);

  const renderCategory = ([categoryName, items]: [string, MenuItem[]]) => (
    <View key={categoryName} style={styles.categorySection} wrap={false}>
      <Text style={styles.sectionTitle}>{categoryName}</Text>
      {items.map((item) => (
        <View key={item.id} style={styles.menuItem} wrap={false}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemName}>{item.name}</Text>
            <View style={styles.itemLeader} />
            <Text style={styles.itemPrice}>R$ {item.price.toFixed(2)}</Text>
          </View>
          {item.description ? (
            <Text style={styles.itemDescription}>{item.description}</Text>
          ) : null}
        </View>
      ))}
    </View>
  );

  return (
    <Document title={`Cardápio izziOrder - ${new Date().toLocaleDateString("pt-BR")}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image src={logoUrl} style={styles.logoImage} />
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.brandIzzi}>izzi</Text>
              <Text style={styles.brandOrder}>Order</Text>
            </View>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.reportTitle}>Cardápio</Text>
            <Text style={styles.reportSubtitle}>
              Atualizado em {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
            </Text>
          </View>
        </View>

        <View style={styles.menuContent}>
          <View style={styles.column}>
            {leftColumn.map(renderCategory)}
          </View>
          <View style={styles.column}>
            {rightColumn.map(renderCategory)}
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>izziOrder - Cardápio Gerencial</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
};

export async function printMenu({ menuItems, categories }: PrintableMenuProps) {
  const itemsByCategory = groupItemsByCategory(menuItems, categories);
  
  // Abre a janela imediatamente para evitar bloqueadores de popup
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  
  // Mostra uma mensagem de carregamento elegante
  printWindow.document.write(`
    <html>
      <head>
        <title>Gerando Cardápio...</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #FDFBF7;
            color: #1a1a1a;
          }
          .loader-container {
            text-align: center;
          }
          .spinner {
            border: 4px solid rgba(0, 0, 0, 0.1);
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border-left-color: #FD7E14;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          h2 { font-weight: 600; margin-bottom: 8px; }
          p { color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="loader-container">
          <div class="spinner"></div>
          <h2>Gerando seu cardápio...</h2>
          <p>Preparando o PDF para impressão.</p>
        </div>
      </body>
    </html>
  `);
  
  try {
    const blob = await pdf(<MenuDocument itemsByCategory={itemsByCategory} />).toBlob();
    const url = URL.createObjectURL(blob);
    printWindow.location.href = url;
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    printWindow.document.body.innerHTML = "<h2>Erro ao gerar o PDF do cardápio. Tente novamente.</h2>";
  }
}
