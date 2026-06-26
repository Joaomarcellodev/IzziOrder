import { CashEntryCategory } from "@/lib/entities/cash-entry-category";

describe("CashEntryCategory Entity (Unit)", () => {
  it("should create a category entity successfully with valid data", () => {
    const category = new CashEntryCategory({
      id: 1,
      establishmentId: "est-123",
      name: "Suprimentos"
    });

    expect(category.id).toBe(1);
    expect(category.establishmentId).toBe("est-123");
    expect(category.name).toBe("Suprimentos");
  });

  it("should throw an error if name is empty", () => {
    expect(() => {
      new CashEntryCategory({
        establishmentId: "est-123",
        name: ""
      });
    }).toThrow("O nome da categoria é obrigatório.");

    expect(() => {
      new CashEntryCategory({
        establishmentId: "est-123",
        name: "   "
      });
    }).toThrow("O nome da categoria é obrigatório.");
  });

  it("should throw an error if establishmentId is empty", () => {
    expect(() => {
      new CashEntryCategory({
        establishmentId: "",
        name: "Suprimentos"
      });
    }).toThrow("O ID do estabelecimento é obrigatório.");

    expect(() => {
      new CashEntryCategory({
        establishmentId: "   ",
        name: "Suprimentos"
      });
    }).toThrow("O ID do estabelecimento é obrigatório.");
  });

  it("should convert to JSON correctly", () => {
    const category = new CashEntryCategory({
      id: 2,
      establishmentId: "est-456",
      name: "Manutenção"
    });

    expect(category.toJSON()).toEqual({
      id: 2,
      establishmentId: "est-456",
      name: "Manutenção"
    });
  });

  it("should create from DTO correctly with camelCase or snake_case", () => {
    const dto1 = { id: 3, establishment_id: "est-789", name: "Aluguel" };
    const category1 = CashEntryCategory.fromDTO(dto1);
    expect(category1.establishmentId).toBe("est-789");

    const dto2 = { id: 4, establishment_id: "est-789", name: "Luz" };
    const category2 = CashEntryCategory.fromDTO(dto2);
    expect(category2.establishmentId).toBe("est-789");
  });
});
