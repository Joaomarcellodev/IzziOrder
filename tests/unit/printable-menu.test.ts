import { groupItemsByCategory } from "@/components/organisms/menu-management/printable-menu";
import { MenuItem } from "@/app/actions/menu-item-actions";

const mockCategories = [
  { id: "cat-1", name: "Pizzas" },
  { id: "cat-2", name: "Bebidas" },
  { id: "cat-3", name: "Sobremesas" },
];

const mockItems: MenuItem[] = [
  { id: "1", name: "Margherita", description: "Queijo e tomate", price: 35.0, categoryId: "cat-1", imageUrl: "", available: true },
  { id: "2", name: "Calabresa", description: "Calabresa e cebola", price: 38.0, categoryId: "cat-1", imageUrl: "", available: true },
  { id: "3", name: "Coca-Cola", description: "Lata 350ml", price: 6.0, categoryId: "cat-2", imageUrl: "", available: true },
  { id: "4", name: "Suco Natural", description: "500ml", price: 10.0, categoryId: "cat-2", imageUrl: "", available: false },
  { id: "5", name: "Pudim", description: "Pudim de leite", price: 12.0, categoryId: "cat-3", imageUrl: "", available: true },
  { id: "6", name: "Item Sem Categoria", description: "Avulso", price: 5.0, categoryId: "cat-inexistente", imageUrl: "", available: true },
  { id: "7", name: "Item Indisponível Sem Categoria", description: "", price: 99.0, categoryId: "cat-inexistente", imageUrl: "", available: false },
];

describe("groupItemsByCategory", () => {
  it("deve agrupar itens disponíveis por categoria", () => {
    const result = groupItemsByCategory(mockItems, mockCategories);

    expect(result.get("Pizzas")).toHaveLength(2);
    expect(result.get("Bebidas")).toHaveLength(1); // Suco indisponível não entra
    expect(result.get("Sobremesas")).toHaveLength(1);
  });

  it("deve excluir itens indisponíveis", () => {
    const result = groupItemsByCategory(mockItems, mockCategories);
    const bebidas = result.get("Bebidas")!;

    // Suco Natural está indisponível e não deve aparecer
    expect(bebidas.some((item) => item.name === "Suco Natural")).toBe(false);
    expect(bebidas.some((item) => item.name === "Coca-Cola")).toBe(true);
  });

  it("deve agrupar itens sem categoria válida em 'Outros'", () => {
    const result = groupItemsByCategory(mockItems, mockCategories);
    const outros = result.get("Outros")!;

    expect(outros).toHaveLength(1);
    expect(outros[0].name).toBe("Item Sem Categoria");
  });

  it("não deve incluir itens indisponíveis sem categoria", () => {
    const result = groupItemsByCategory(mockItems, mockCategories);
    const outros = result.get("Outros")!;

    expect(outros.some((item) => item.name === "Item Indisponível Sem Categoria")).toBe(false);
  });

  it("não deve incluir categorias vazias (sem itens disponíveis)", () => {
    const allUnavailable: MenuItem[] = [
      { id: "1", name: "Item", description: "", price: 10, categoryId: "cat-1", imageUrl: "", available: false },
    ];

    const result = groupItemsByCategory(allUnavailable, mockCategories);

    expect(result.has("Pizzas")).toBe(false);
    expect(result.has("Bebidas")).toBe(false);
    expect(result.has("Sobremesas")).toBe(false);
  });

  it("deve retornar Map vazio quando não há itens", () => {
    const result = groupItemsByCategory([], mockCategories);
    expect(result.size).toBe(0);
  });

  it("deve retornar Map vazio quando não há categorias e nenhum item disponível", () => {
    const result = groupItemsByCategory([], []);
    expect(result.size).toBe(0);
  });

  it("deve colocar todos os itens em 'Outros' quando não há categorias", () => {
    const items: MenuItem[] = [
      { id: "1", name: "Avulso", description: "", price: 10, categoryId: "cat-1", imageUrl: "", available: true },
    ];

    const result = groupItemsByCategory(items, []);

    expect(result.has("Outros")).toBe(true);
    expect(result.get("Outros")).toHaveLength(1);
  });

  it("deve manter a ordem dos itens dentro de cada categoria", () => {
    const result = groupItemsByCategory(mockItems, mockCategories);
    const pizzas = result.get("Pizzas")!;

    expect(pizzas[0].name).toBe("Margherita");
    expect(pizzas[1].name).toBe("Calabresa");
  });
});
