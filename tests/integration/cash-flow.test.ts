import { createClient } from "@/utils/supabase/server";
import {
  createCashEntryCategory,
  getCashEntryCategories,
  getCashEntryCategoryById,
  updateCashEntryCategory,
  deleteCashEntryCategory
} from "@/app/actions/cash-entry-category-actions";
import {
  createCashFlowEntry,
  getCashFlowEntries,
  getCashFlowEntryById,
  updateCashFlowEntry,
  deleteCashFlowEntry,
  getCurrentCashTotal
} from "@/app/actions/cash-flow-actions";

describe("Cash Flow and Category Integration Tests (TDD)", () => {
  const testEstablishmentId = process.env.TEST_ESTABLISHMENT_ID!;
  const supabase = createClient();

  beforeEach(async () => {
    const s = await supabase;
    // Clean up to ensure test isolation
    await s.from("cash_flow_entries").delete().eq("establishment_id", testEstablishmentId);
    await s.from("cash_entry_categories").delete().eq("establishment_id", testEstablishmentId);
  });

  afterAll(async () => {
    const s = await supabase;
    await s.from("cash_flow_entries").delete().eq("establishment_id", testEstablishmentId);
    await s.from("cash_entry_categories").delete().eq("establishment_id", testEstablishmentId);
  });

  describe("Cash Entry Category - CRUD", () => {
    it("should create a valid category", async () => {
      const category = await createCashEntryCategory({ name: "Alimentação" }, testEstablishmentId);
      expect(category).toBeDefined();
      expect(category.id).toBeDefined();
      expect(category.name).toBe("Alimentação");
      expect(category.establishmentId).toBe(testEstablishmentId);
    });

    it("should reject category with empty name", async () => {
      await expect(
        createCashEntryCategory({ name: "" }, testEstablishmentId)
      ).rejects.toThrow("O nome da categoria é obrigatório.");
    });

    it("should retrieve categories list", async () => {
      await createCashEntryCategory({ name: "Suprimentos" }, testEstablishmentId);
      await createCashEntryCategory({ name: "Serviços" }, testEstablishmentId);

      const list = await getCashEntryCategories(testEstablishmentId);
      expect(list.length).toBe(2);
      const names = list.map((c) => c.name);
      expect(names).toContain("Suprimentos");
      expect(names).toContain("Serviços");
    });

    it("should update category name", async () => {
      const category = await createCashEntryCategory({ name: "Original Name" }, testEstablishmentId);
      const updated = await updateCashEntryCategory(category.id, { name: "Updated Name" });
      expect(updated.name).toBe("Updated Name");

      const fetched = await getCashEntryCategoryById(category.id);
      expect(fetched.name).toBe("Updated Name");
    });

    it("should delete category", async () => {
      const category = await createCashEntryCategory({ name: "To Delete" }, testEstablishmentId);
      await deleteCashEntryCategory(category.id);

      await expect(getCashEntryCategoryById(category.id)).rejects.toThrow("Categoria não encontrada.");
    });
  });

  describe("Cash Flow Entry - CRUD and Current Total Calculation", () => {
    let testCategory: any;

    beforeEach(async () => {
      testCategory = await createCashEntryCategory({ name: "Vendas" }, testEstablishmentId);
    });

    it("should create cash flow entries and calculate current total correctly", async () => {
      // 1. Create a Revenue (positive amount)
      const revenue = await createCashFlowEntry({
        description: "Venda Balcão",
        entry_category_id: testCategory.id,
        amount: 250.00
      }, testEstablishmentId);

      expect(revenue).toBeDefined();
      expect(revenue.id).toBeDefined();
      expect(revenue.amount).toBe(250.00);
      expect(revenue.description).toBe("Venda Balcão");
      expect(revenue.entryCategoryId).toBe(testCategory.id);
      expect(revenue.establishmentId).toBe(testEstablishmentId);

      // 2. Create an Expense (negative amount)
      const expense = await createCashFlowEntry({
        description: "Pagamento Fornecedor",
        entry_category_id: testCategory.id,
        amount: -80.50
      }, testEstablishmentId);

      expect(expense.amount).toBe(-80.50);

      // 3. Verify total current cash: 250.00 - 80.50 = 169.50
      const total = await getCurrentCashTotal(testEstablishmentId);
      expect(total).toBe(169.50);
    });

    it("should reject flow entry without category id", async () => {
      await expect(
        createCashFlowEntry({
          description: "Lançamento sem Categoria",
          amount: 100.00
        } as any, testEstablishmentId)
      ).rejects.toThrow("A categoria é obrigatória.");
    });

    it("should reject flow entry with zero amount", async () => {
      await expect(
        createCashFlowEntry({
          description: "Lançamento Zero",
          entry_category_id: testCategory.id,
          amount: 0
        }, testEstablishmentId)
      ).rejects.toThrow("O valor do lançamento deve ser diferente de zero.");
    });

    it("should retrieve flow entries list", async () => {
      await createCashFlowEntry({
        description: "Fluxo A",
        entry_category_id: testCategory.id,
        amount: 10.00
      }, testEstablishmentId);

      await createCashFlowEntry({
        description: "Fluxo B",
        entry_category_id: testCategory.id,
        amount: -5.00
      }, testEstablishmentId);

      const list = await getCashFlowEntries(testEstablishmentId);
      expect(list.length).toBe(2);
      const descriptions = list.map((e) => e.description);
      expect(descriptions).toContain("Fluxo A");
      expect(descriptions).toContain("Fluxo B");
    });

    it("should update flow entry description and amount", async () => {
      const entry = await createCashFlowEntry({
        description: "Original Flow",
        entry_category_id: testCategory.id,
        amount: 15.00
      }, testEstablishmentId);

      const updated = await updateCashFlowEntry(entry.id, {
        description: "Updated Flow",
        entry_category_id: testCategory.id,
        amount: -25.50
      });

      expect(updated.description).toBe("Updated Flow");
      expect(updated.amount).toBe(-25.50);

      const fetched = await getCashFlowEntryById(entry.id);
      expect(fetched.description).toBe("Updated Flow");
      expect(fetched.amount).toBe(-25.50);
    });

    it("should delete flow entry", async () => {
      const entry = await createCashFlowEntry({
        description: "To Delete Flow",
        entry_category_id: testCategory.id,
        amount: 40.00
      }, testEstablishmentId);

      await deleteCashFlowEntry(entry.id);

      await expect(getCashFlowEntryById(entry.id)).rejects.toThrow("Lançamento de caixa não encontrado.");
    });
  });
});
