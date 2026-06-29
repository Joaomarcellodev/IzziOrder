import { generateMenuExcel, parseMenuExcel } from "@/lib/services/menu-excel-service";
import { MenuItem } from "@/app/actions/menu-item-actions";

describe("UNIT — Menu Excel Service", () => {
  const mockCategories = [
    { id: "cat1", name: "Lanches", establishment_id: "est1" },
    { id: "cat2", name: "Bebidas", establishment_id: "est1" }
  ];

  const mockMenuItems: any[] = [
    {
      id: "item1",
      name: "Hambúrguer Clássico",
      description: "Pão, carne e queijo",
      price: 25.5,
      is_available: true,
      image: "burger.jpg",
      category: mockCategories[0],
      categoryId: "cat1"
    },
    {
      id: "item2",
      name: "Coca-Cola 350ml",
      description: "Refrigerante lata",
      price: 6.0,
      is_available: true,
      category: mockCategories[1],
      categoryId: "cat2"
    }
  ];

  it("should export menu items to a valid Excel buffer", async () => {
    const buffer = await generateMenuExcel(mockMenuItems, mockCategories);
    expect(buffer).toBeDefined();
    expect(Buffer.isBuffer(buffer) || (buffer as any) instanceof Uint8Array || (buffer as any) instanceof ArrayBuffer).toBeTruthy();
  });

  it("should export an empty model when menu has no items", async () => {
    const buffer = await generateMenuExcel([], []);
    expect(buffer).toBeDefined();
    expect(Buffer.isBuffer(buffer) || (buffer as any) instanceof Uint8Array || (buffer as any) instanceof ArrayBuffer).toBeTruthy();
  });

  it("should parse an exported Excel file back to imported rows", async () => {
    // 1. Export the items to a buffer
    const buffer = await generateMenuExcel(mockMenuItems, mockCategories);

    const nodeBuffer = Buffer.from(buffer as any);

    const rows = await parseMenuExcel(nodeBuffer);

    expect(rows).toHaveLength(2);

    expect(rows[0].categoryName).toBe("Lanches");
    expect(rows[0].name).toBe("Hambúrguer Clássico");
    expect(rows[0].description).toBe("Pão, carne e queijo");
    expect(Number(rows[0].price)).toBe(25.5);

    expect(rows[1].categoryName).toBe("Bebidas");
    expect(rows[1].name).toBe("Coca-Cola 350ml");
    expect(rows[1].description).toBe("Refrigerante lata");
    expect(Number(rows[1].price)).toBe(6.0);
  });

  it("should throw MenuExcelError if headers are modified", async () => {
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Cardápio');
    
    // Configura um cabeçalho errado
    sheet.addRow(['ID (Não alterar)', 'Categoria Errada', 'Nome', 'Descrição', 'Preço']);
    const buffer = await workbook.xlsx.writeBuffer();
    
    await expect(parseMenuExcel(buffer)).rejects.toThrow(/Estrutura inválida/);
  });

  it("should throw MenuExcelError if category is missing in a row", async () => {
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Cardápio');

    sheet.addRow(['ID (Não alterar)', 'Categoria', 'Nome', 'Descrição', 'Preço']);
    sheet.addRow(['', '', 'Produto Sem Categoria', '', 10.0]);
    
    const buffer = await workbook.xlsx.writeBuffer();
    
    await expect(parseMenuExcel(buffer)).rejects.toThrow(/Categoria é obrigatória/);
  });

  it("should throw MenuExcelError if product name is missing in a row", async () => {
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Cardápio');
    
    sheet.addRow(['ID (Não alterar)', 'Categoria', 'Nome', 'Descrição', 'Preço']);
    sheet.addRow(['', 'Bebidas', '', '', 10.0]);
    
    const buffer = await workbook.xlsx.writeBuffer();
    
    await expect(parseMenuExcel(buffer)).rejects.toThrow(/Nome do produto é obrigatório/);
  });

  it("should throw MenuExcelError if price is invalid or negative", async () => {
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Cardápio');
    
    sheet.addRow(['ID (Não alterar)', 'Categoria', 'Nome', 'Descrição', 'Preço']);
    sheet.addRow(['', 'Bebidas', 'Suco', '', -5.0]);
    
    const buffer = await workbook.xlsx.writeBuffer();
    
    await expect(parseMenuExcel(buffer)).rejects.toThrow(/Preço inválido/);
  });
});
