import { importMenuAction, exportMenuAction } from "@/app/actions/menu-excel-actions";
import { getEstablishmentId } from "@/app/actions/establisment_actions";
import { createClient } from "@/utils/supabase/server";
import { generateMenuExcel } from "@/lib/services/menu-excel-service";

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

describe("INTEGRATION — Menu Excel Actions", () => {
  const supabase = createClient();
  let testEstablishmentId = process.env.TEST_ESTABLISHMENT_ID!;

  beforeAll(async () => {
    if (!testEstablishmentId) {
      const { data } = await (await supabase).from("establishments").select("id").limit(1).single();
      testEstablishmentId = data?.id || "fallback-id";
    }
  });

  beforeEach(async () => {
    // Limpar itens e categorias do estabelecimento de teste
    await (await supabase).from("menu_items").delete().eq("establishment_id", testEstablishmentId);
    await (await supabase).from("categories").delete().eq("establishment_id", testEstablishmentId);
  });

  it("should import a valid menu excel buffer into the database", async () => {
    // 1. Criar um buffer excel válido simulando 2 itens
    const mockCategories = [{ id: "temp1", name: "Categoria Teste" }];
    const mockItems = [
      { id: "", categoryId: "temp1", name: "Item Teste 1", description: "Desc 1", price: 10.50 },
      { id: "", categoryId: "temp1", name: "Item Teste 2", description: "Desc 2", price: 20.00 },
    ];
    
    const buffer = await generateMenuExcel(mockItems, mockCategories);

    // 2. Criar um File e um FormData falso
    const file = new File([buffer as any], "cardapio.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const formData = new FormData();
    formData.append("file", file);

    // 3. Executar a server action
    const result = await importMenuAction(formData, testEstablishmentId);
    // 4. Validar o resultado
    expect(result.success).toBe(true);
    expect(result.message).toContain("Novos: 2");

    // 5. Verificar o banco de dados
    const { data: dbCategories } = await (await supabase).from("categories").select("*").eq("establishment_id", testEstablishmentId);
    expect(dbCategories).toHaveLength(1);
    expect(dbCategories![0].name).toBe("Categoria Teste");

    const { data: dbItems } = await (await supabase).from("menu_items").select("*").eq("establishment_id", testEstablishmentId);
    expect(dbItems).toHaveLength(2);
    expect(dbItems?.map(i => i.name)).toContain("Item Teste 1");
    expect(dbItems?.map(i => i.name)).toContain("Item Teste 2");
  });

  it("should block duplicates when importing the same excel twice", async () => {
    const mockCategories = [{ id: "temp1", name: "Categoria Duplicada" }];
    const mockItems = [
      { id: "", categoryId: "temp1", name: "Item Único", description: "Desc 1", price: 10.50 },
    ];
    
    const buffer = await generateMenuExcel(mockItems, mockCategories);
    const file = new File([buffer as any], "cardapio.xlsx");
    const formData = new FormData();
    formData.append("file", file);

    // Primeira importação
    const result1 = await importMenuAction(formData, testEstablishmentId);
    expect(result1.success).toBe(true);

    // Segunda importação (mesmo arquivo)
    const result2 = await importMenuAction(formData, testEstablishmentId);
    expect(result2.success).toBe(true);
    // Deve informar que pulou o item e não inseriu nada novo
    expect(result2.message).toContain("Atualizados: 1 | Novos: 0");

    // O banco ainda deve ter apenas 1 item e 1 categoria
    const { data: dbItems } = await (await supabase).from("menu_items").select("*").eq("establishment_id", testEstablishmentId);
    expect(dbItems).toHaveLength(1);
  });

  it("should return error if no file is provided", async () => {
    const formData = new FormData();
    // Nenhum arquivo anexado

    const result = await importMenuAction(formData, testEstablishmentId);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Nenhum arquivo enviado");
  });

  it("should return error if file format is incorrect", async () => {
    const file = new File(["not an excel file"], "image.png", { type: "image/png" });
    const formData = new FormData();
    formData.append("file", file);

    const result = await importMenuAction(formData, testEstablishmentId);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("should return error if file is an empty/invalid excel", async () => {
    // Um arquivo com extensão .xlsx mas conteúdo corrompido ou vazio
    const file = new File(["fake excel bytes"], "fake.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const formData = new FormData();
    formData.append("file", file);

    const result = await importMenuAction(formData, testEstablishmentId);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("should export a menu as base64 string", async () => {
    // Insere algo no banco primeiro para garantir que tem o que exportar
    const mockCategories = [{ id: "cat_exp", name: "Categoria Export", establishment_id: testEstablishmentId }];
    await (await supabase).from("categories").insert(mockCategories);
    const { data: cat } = await (await supabase).from("categories").select("id").eq("name", "Categoria Export").single();
    
    await (await supabase).from("menu_items").insert([{
      category_id: cat?.id,
      name: "Item Export",
      price: 15.0,
      is_active: true,
      establishment_id: testEstablishmentId
    }]);

    const result = await exportMenuAction(testEstablishmentId);
    expect(result.success).toBe(true);
    expect(result.base64).toBeDefined();
    expect(typeof result.base64).toBe("string");
    expect(result.filename).toMatch(/^cardapio_.*\.xlsx$/);
  });

  it("should return error when trying to export without establishment id", async () => {
    const result = await exportMenuAction("");
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
