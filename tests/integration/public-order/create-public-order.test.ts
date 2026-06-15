import { createPublicOrder, PublicOrderRequestDTO } from "@/app/actions/public-order-actions";
import { createClient } from "@/utils/supabase/server";

describe("Public Orders CREATE Integration", () => {
  let testEstablishmentId = "";
  let mockMenuItemId = "";
  const supabase = createClient();

  beforeAll(async () => {
    // Busca um item de menu ativo qualquer
    const { data: menuItem } = await (await supabase)
      .from("menu_items")
      .select("id, establishment_id")
      .eq("is_active", true)
      .limit(1)
      .single();

    if (menuItem) {
      mockMenuItemId = menuItem.id;
      testEstablishmentId = menuItem.establishment_id;
    }
  });

  describe("Valid Cases", () => {
    it("should create a valid PICKUP public order", async () => {
      const orderDTO: PublicOrderRequestDTO = {
        customerName: "Maria Santos",
        phone: "11988776655",
        orderType: "PICKUP",
        paymentMethod: "PIX",
        cartTotal: 50.0,
        orderLines: [
          {
            menuItemId: mockMenuItemId,
            name: "Item Teste Público",
            quantity: 2,
            price: 25,
            observation: "Sem cebola",
          },
        ],
      };

      const result = await createPublicOrder(testEstablishmentId, orderDTO);

      expect(result).toBeDefined();
      expect(result.orderId).toBeDefined();
      expect(result.dailySeq).toBeGreaterThan(0);

      // Verifica no banco
      const { data: dbOrder } = await (await supabase)
        .from("orders")
        .select("*, order_lines(*)")
        .eq("id", result.orderId)
        .single();

      expect(dbOrder).toBeDefined();
      expect(dbOrder.type).toBe("PICKUP");
      expect(dbOrder.status).toBe("OPEN");
      expect(dbOrder.detail).toContain("Maria Santos");
      expect(dbOrder.detail).toContain("11988776655");
      expect(dbOrder.payment_method).toBe("PIX");
      expect(Number(dbOrder.total)).toBe(50.0);
      expect(dbOrder.order_lines).toHaveLength(1);
      expect(dbOrder.order_lines[0].observation).toBe("Sem cebola");
    });

    it("should create a valid DELIVERY public order", async () => {
      const orderDTO: PublicOrderRequestDTO = {
        customerName: "Carlos Silva",
        phone: "11999999999",
        orderType: "DELIVERY",
        address: "Rua Central, 123 - Centro",
        paymentMethod: "ESPECIE_COM_TROCO",
        changeValue: 100,
        cartTotal: 60.0,
        orderLines: [
          {
            menuItemId: mockMenuItemId,
            name: "Item Teste",
            quantity: 1,
            price: 60,
          },
        ],
      };

      const result = await createPublicOrder(testEstablishmentId, orderDTO);

      expect(result).toBeDefined();
      
      const { data: dbOrder } = await (await supabase)
        .from("orders")
        .select("*")
        .eq("id", result.orderId)
        .single();

      expect(dbOrder.type).toBe("DELIVERY");
      expect(dbOrder.detail).toBe("Rua Central, 123 - Centro");
      expect(dbOrder.payment_method).toBe("ESPECIE_COM_TROCO");
      expect(Number(dbOrder.change_value)).toBe(100);
    });
  });

  describe("Invalid Cases", () => {
    it("should reject order with invalid customer name", async () => {
      const orderDTO: PublicOrderRequestDTO = {
        customerName: "Ma",
        phone: "11988776655",
        orderType: "PICKUP",
        paymentMethod: "PIX",
        cartTotal: 50.0,
        orderLines: [
          {
            menuItemId: mockMenuItemId,
            name: "Item",
            quantity: 1,
            price: 50,
          },
        ],
      };

      await expect(createPublicOrder(testEstablishmentId, orderDTO)).rejects.toThrow(
        "O nome deve ter pelo menos 3 caracteres."
      );
    });

    it("should reject order without items", async () => {
      const orderDTO: PublicOrderRequestDTO = {
        customerName: "Maria Santos",
        phone: "11988776655",
        orderType: "PICKUP",
        paymentMethod: "PIX",
        cartTotal: 50.0,
        orderLines: [],
      };

      await expect(createPublicOrder(testEstablishmentId, orderDTO)).rejects.toThrow(
        "O pedido deve conter pelo menos um item."
      );
    });

    it("should reject delivery without address", async () => {
      const orderDTO: PublicOrderRequestDTO = {
        customerName: "Maria Santos",
        phone: "11988776655",
        orderType: "DELIVERY",
        paymentMethod: "PIX",
        cartTotal: 50.0,
        orderLines: [
          {
            menuItemId: mockMenuItemId,
            name: "Item",
            quantity: 1,
            price: 50,
          },
        ],
      };

      await expect(createPublicOrder(testEstablishmentId, orderDTO)).rejects.toThrow(
        "Endereço de entrega é obrigatório e precisa de pelo menos 5 caracteres."
      );
    });
  });

  // Limpeza
  afterAll(async () => {
    // Apaga os pedidos criados para não sujar o banco de testes
    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: "America/Sao_Paulo",
    });
    
    await (await supabase)
      .from("orders")
      .delete()
      .eq("establishment_id", testEstablishmentId)
      .eq("date", today)
      .like("detail", "%Maria Santos%") // apaga os que criamos
      
    await (await supabase)
      .from("orders")
      .delete()
      .eq("establishment_id", testEstablishmentId)
      .eq("date", today)
      .like("detail", "%Rua Central, 123%")
  }, 10000);
});
