import { createOrder, getOrders, getOrderById, OrderRequestDTO } from "@/app/actions/order-actions";
import { ESTABLISHMENT_ID } from "@/utils/config";
import { createClient } from "@/utils/supabase/server";

describe("Orders READ Integration", () => {
  const testEstablishmentId = ESTABLISHMENT_ID;
  const mockMenuItemId = "6cfd93ee-1e3d-430d-b525-f5a30bc96338";
  let testOrderId1: string;
  let testOrderId2: string;

  const supabase = createClient()

  beforeAll(async () => {
    // Limpeza inicial
    await (await supabase).from("orders").delete().eq("establishment_id", testEstablishmentId);

    const order1DTO: OrderRequestDTO = {
      total: 50.75,
      type: "LOCAL",
      status: "OPEN",
      detail: "10",
      orderLines: [{ menuItemId: mockMenuItemId, name: "Pizza", quantity: 1, price: 50.75 }]
    };

    const order2DTO: OrderRequestDTO = {
      total: 69.90,
      type: "DELIVERY",
      status: "CLOSED",
      detail: "Rua Teste, 123",
      deliveryFee: 5.00,
      orderLines: [{ menuItemId: mockMenuItemId, name: "Burger", quantity: 1, price: 64.90 }]
    };

    const order1 = await createOrder(order1DTO);
    const order2 = await createOrder(order2DTO);

    testOrderId1 = order1.id!;
    testOrderId2 = order2.id!;
  });

  // Casos válidos
  describe("Valid Cases", () => {
    it("should retrieve all orders for establishment", async () => {
      const data = await getOrders(testEstablishmentId);

      expect(data).toBeDefined();
      expect(data.length).toBe(2);
    });

    it("should retrieve specific order by ID", async () => {
      const data = await getOrderById(testOrderId1);

      expect(data).toBeDefined();
      expect(data.id).toBe(testOrderId1);
      expect(data.total).toBe(50.75);
      expect(data.type).toBe("LOCAL");
    });
  });

  // Casos inválidos
  describe("Invalid Cases", () => {
    it("should throw for non-existent order ID", async () => {
      await expect(getOrderById("00000000-0000-0000-0000-000000000000")).rejects.toThrow("Pedido não encontrado.");
    });

    it("should return empty array for invalid establishment ID", async () => {
      const data = await getOrders("00000000-0000-0000-0000-000000000000");
      expect(data).toEqual([]);
    });
  });

  afterAll(async () => {
    await (await supabase).from("orders").delete().eq("establishment_id", testEstablishmentId);
  });
});
