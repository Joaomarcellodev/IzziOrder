import { CashFlowEntry } from "@/lib/entities/cash-flow-entry";

describe("CashFlowEntry Entity (Unit)", () => {
  it("should create a cash flow entry successfully with valid data (positive amount)", () => {
    const entry = new CashFlowEntry({
      id: 1,
      description: "Venda",
      entryCategoryId: 10,
      amount: 150.00,
      establishmentId: "est-123",
      createdAt: "2026-05-30T12:00:00Z"
    });

    expect(entry.id).toBe(1);
    expect(entry.description).toBe("Venda");
    expect(entry.entryCategoryId).toBe(10);
    expect(entry.amount).toBe(150.00);
    expect(entry.establishmentId).toBe("est-123");
    expect(entry.createdAt).toBe("2026-05-30T12:00:00Z");
  });

  it("should create a cash flow entry successfully with valid data (negative amount)", () => {
    const entry = new CashFlowEntry({
      id: 2,
      description: "Pagamento",
      entryCategoryId: 11,
      amount: -75.50,
      establishmentId: "est-123"
    });

    expect(entry.amount).toBe(-75.50);
  });

  it("should throw an error if entryCategoryId is missing", () => {
    expect(() => {
      new CashFlowEntry({
        description: "Sem Categoria",
        entryCategoryId: null,
        amount: 50.00,
        establishmentId: "est-123"
      });
    }).toThrow("A categoria é obrigatória.");

    expect(() => {
      new CashFlowEntry({
        description: "Sem Categoria",
        entryCategoryId: "",
        amount: 50.00,
        establishmentId: "est-123"
      });
    }).toThrow("A categoria é obrigatória.");
  });

  it("should throw an error if amount is zero", () => {
    expect(() => {
      new CashFlowEntry({
        entryCategoryId: 10,
        amount: 0,
        establishmentId: "est-123"
      });
    }).toThrow("O valor do lançamento deve ser diferente de zero.");
  });

  it("should throw an error if establishmentId is missing", () => {
    expect(() => {
      new CashFlowEntry({
        entryCategoryId: 10,
        amount: 50.00,
        establishmentId: ""
      });
    }).toThrow("O ID do estabelecimento é obrigatório.");
  });

  it("should convert to JSON correctly", () => {
    const entry = new CashFlowEntry({
      id: 5,
      description: "Caixa",
      entryCategoryId: 10,
      amount: 100,
      establishmentId: "est-123",
      createdAt: "2026-05-30"
    });

    expect(entry.toJSON()).toEqual({
      id: 5,
      description: "Caixa",
      entryCategoryId: 10,
      amount: 100,
      createdAt: "2026-05-30",
      establishmentId: "est-123"
    });
  });

  it("should create from DTO correctly with camelCase or snake_case fields", () => {
    const dto1 = {
      id: 6,
      description: "DTO 1",
      entryCategoryId: 12,
      amount: 10,
      createdAt: "date-1",
      establishmentId: "est-1"
    };
    const entry1 = CashFlowEntry.fromDTO(dto1);
    expect(entry1.entryCategoryId).toBe(12);
    expect(entry1.createdAt).toBe("date-1");
    expect(entry1.establishmentId).toBe("est-1");

    const dto2 = {
      id: 7,
      description: "DTO 2",
      entry_category_id: 13,
      amount: -10,
      created_at: "date-2",
      establishment_id: "est-2"
    };
    const entry2 = CashFlowEntry.fromDTO(dto2);
    expect(entry2.entryCategoryId).toBe(13);
    expect(entry2.createdAt).toBe("date-2");
    expect(entry2.establishmentId).toBe("est-2");
  });
});
