import ExcelJS from 'exceljs';

export interface ParsedMenuItem {
  id?: string;
  categoryName: string;
  name: string;
  description?: string;
  price: number;
}

export class MenuExcelError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MenuExcelError';
  }
}

// Cabeçalhos exatos esperados na planilha
const EXPECTED_HEADERS = [
  'ID (Não alterar)',
  'Categoria',
  'Nome',
  'Descrição',
  'Preço'
];

export async function parseMenuExcel(buffer: Buffer | ArrayBuffer): Promise<ParsedMenuItem[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as Buffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new MenuExcelError("A planilha está vazia ou corrompida.");
  }

  // 1. Validar Estrutura (Cabeçalhos)
  const headerRow = worksheet.getRow(1);
  if (!headerRow.hasValues) {
    throw new MenuExcelError("A planilha não possui cabeçalhos. Baixe o modelo oficial.");
  }

  EXPECTED_HEADERS.forEach((expectedHeader, index) => {
    // O ExcelJS indexa as colunas a partir do 1
    const cellValue = headerRow.getCell(index + 1).value?.toString().trim();
    if (cellValue !== expectedHeader) {
      throw new MenuExcelError(`Estrutura inválida. A coluna ${index + 1} deveria ser "${expectedHeader}", mas foi encontrado "${cellValue || 'Vazio'}".`);
    }
  });

  const parsedItems: ParsedMenuItem[] = [];

  // 2. Iterar sobre as linhas e validar (Fail Fast)
  // rowCount inclui linhas vazias no meio, mas vamos iterar iterando
  worksheet.eachRow((row, rowNumber) => {
    // Pula o cabeçalho
    if (rowNumber === 1) return;

    // Se a linha estiver completamente em branco, pula
    if (!row.hasValues) return;

    // Extrair valores (tratando células ricas ou fórmulas caso o usuário copie e cole)
    const getCellValue = (col: number) => {
      const cell = row.getCell(col);
      // Se for célula com estilo rico (RichText), pegamos apenas o texto
      if (cell.type === ExcelJS.ValueType.RichText && cell.value && typeof cell.value === 'object' && 'richText' in cell.value) {
         return cell.value.richText.map(rt => rt.text).join('').trim();
      }
      return cell.value?.toString().trim();
    };

    const id = getCellValue(1);
    const categoryName = getCellValue(2);
    const name = getCellValue(3);
    const description = getCellValue(4);
    const priceRaw = row.getCell(5).value; // Pega o valor real numérico se possível

    // Validação de Obrigatoriedade
    if (!categoryName) {
      throw new MenuExcelError(`Erro na linha ${rowNumber}: Categoria é obrigatória.`);
    }
    if (!name) {
      throw new MenuExcelError(`Erro na linha ${rowNumber}: Nome do produto é obrigatório.`);
    }

    // Validação de Preço
    let price = 0;
    if (typeof priceRaw === 'number') {
      price = priceRaw;
    } else if (typeof priceRaw === 'string') {
      // Tenta converter string com vírgula para número (ex: "25,90" -> 25.90)
      const cleanPrice = priceRaw.replace(/[^\d.,-]/g, '').replace(',', '.');
      price = parseFloat(cleanPrice);
    } else {
      throw new MenuExcelError(`Erro na linha ${rowNumber}: Preço não preenchido ou inválido.`);
    }

    if (isNaN(price) || price < 0) {
      throw new MenuExcelError(`Erro na linha ${rowNumber}: Preço inválido para o produto "${name}". O preço deve ser numérico e não pode ser negativo.`);
    }

    parsedItems.push({
      id: id && id !== 'undefined' ? id : undefined,
      categoryName,
      name,
      description: description || undefined,
      price
    });
  });

  if (parsedItems.length === 0) {
    throw new MenuExcelError("Nenhum produto encontrado para importação na planilha.");
  }

  return parsedItems;
}

export async function generateMenuExcel(menuItems: any[], categories: any[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Cardapio');

  worksheet.columns = [
    { header: 'ID (Não alterar)', key: 'id', width: 0, hidden: true },
    { header: 'Categoria', key: 'category', width: 25 },
    { header: 'Nome', key: 'name', width: 35 },
    { header: 'Descrição', key: 'description', width: 50 },
    { header: 'Preço', key: 'price', width: 15, style: { numFmt: 'R$ #,##0.00' } }
  ];

  // Ocultar a coluna de ID com métodos alternativos
  const idColumn = worksheet.getColumn(1);
  idColumn.hidden = true;
  idColumn.width = 0;

  // Estilizar cabeçalho
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFD7E14' } };

  menuItems.forEach((item) => {
    const category = categories.find((c: any) => c.id === item.categoryId);
    worksheet.addRow({
      id: item.id,
      category: category ? category.name : 'Sem categoria',
      name: item.name,
      description: item.description || '',
      price: item.price
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as Buffer;
}
