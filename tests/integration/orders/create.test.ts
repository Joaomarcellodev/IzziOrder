import { createOrder, OrderRequestDTO } from "@/app/actions/order-actions";
import { ESTABLISHMENT_ID } from "@/utils/config";
import { createClient } from "@/utils/supabase/server";

describe("Orders CREATE Integration", () => {
  const testEstablishmentId = ESTABLISHMENT_ID;
  const mockMenuItemId = "6cfd93ee-1e3d-430d-b525-f5a30bc96338"; // Item existente no banco de teste
  const supabase = createClient()

  // Casos válidos
  describe("Valid Cases", () => {
    it("should create a valid LOCAL order", async () => {
      const orderDTO: OrderRequestDTO = {
        total: 99.99,
        type: "LOCAL",
        detail: "5",
        orderLines: [
          {
            menuItemId: mockMenuItemId,
            name: "Item Teste",
            quantity: 2,
            price: 50
          }
        ]
      };

      const result = await createOrder(orderDTO);

      expect(result).toBeDefined();
      expect(result.type).toBe("LOCAL");
      expect(result.status).toBe("OPEN");
      // @ts-ignore - LocalOrder has tableNumber
      expect(result.tableNumber).toBe("5");
    });

    it("should create a valid DELIVERY order", async () => {
      const orderDTO: OrderRequestDTO = {
        total: 79.50,
        type: "DELIVERY",
        detail: "Rua dos Testes, 123",
        deliveryFee: 5.00,
        estimatedTime: 30,
        orderLines: [
          {
            menuItemId: mockMenuItemId,
            name: "Item Teste",
            quantity: 1,
            price: 74.50
          }
        ]
      };

      const result = await createOrder(orderDTO);

      expect(result).toBeDefined();
      expect(result.type).toBe("DELIVERY");
      // @ts-ignore - DeliveryOrder has deliveryFee
      expect(result.deliveryFee).toBe(5.00);
    });

    it("should create a valid PICKUP order", async () => {
      const orderDTO: OrderRequestDTO = {
        total: 25,
        type: "PICKUP",
        detail: "João Silva",
        orderLines: [
          {
            menuItemId: mockMenuItemId,
            name: "Hambúrguer",
            quantity: 1,
            price: 25
          }
        ]
      };

      const result = await createOrder(orderDTO);

      expect(result).toBeDefined();
      expect(result.type).toBe("PICKUP");
    });
  });

  // Casos inválidos (Regras de Negócio da Entidade)
  describe("Invalid Cases", () => {
    it("should reject LOCAL order without table number", async () => {
      const orderDTO: OrderRequestDTO = {
        total: 50,
        type: "LOCAL",
        orderLines: [
          {
            menuItemId: mockMenuItemId,
            name: "Pizza",
            quantity: 1,
            price: 50
          }
        ]
      };

      await expect(createOrder(orderDTO)).rejects.toThrow("Mesa é obrigatória para pedidos locais.");
    });

    it("should reject order without items", async () => {
      const orderDTO: OrderRequestDTO = {
        total: 50,
        type: "LOCAL",
        detail: "10",
        orderLines: []
      };

      await expect(createOrder(orderDTO)).rejects.toThrow("O pedido deve conter pelo menos um item.");
    });

    it("should reject PICKUP order with short customer name", async () => {
      const orderDTO: OrderRequestDTO = {
        total: 25,
        type: "PICKUP",
        detail: "Jo",
        orderLines: [
          {
            menuItemId: mockMenuItemId,
            name: "Hambúrguer",
            quantity: 1,
            price: 25
          }
        ]
      };

      await expect(createOrder(orderDTO)).rejects.toThrow(/pelo menos 3 caracteres no nome do cliente/);
    });
  });

  // Limpeza
  afterAll(async () => {
    await (await supabase)
      .from("orders")
      .delete()
      .eq("establishment_id", testEstablishmentId);
  });
});
