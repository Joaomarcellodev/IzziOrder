import { createOrder, getOrders, getOrderById, OrderRequestDTO, getOldPendingOrders, getTodayOrders } from "@/app/actions/order-actions";
import { createClient } from "@/utils/supabase/server";

describe("Orders READ Integration", () => {
  const testEstablishmentId = process.env.TEST_ESTABLISHMENT_ID!;
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

    const order1 = await createOrder(order1DTO, testEstablishmentId);
    const order2 = await createOrder(order2DTO, testEstablishmentId);

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

    it("should retrieve old pending orders (backlog) with correct mapping", async () => {
      const client = await createClient();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toLocaleDateString('en-CA');

      const { data: oldOrder } = await client.from("orders").insert({
        establishment_id: testEstablishmentId,
        total: 100,
        type: "LOCAL",
        status: "OPEN",
        detail: "Mesa Velha",
        date: yesterdayStr
      }).select("id").single();

      if (!oldOrder) throw new Error("Erro ao criar pedido antigo");

      await client.from("order_lines").insert({
        order_id: oldOrder.id,
        menu_item_id: mockMenuItemId,
        name: "Pizza Antiga",
        price: 100,
        quantity: 1
      });

      const backlog = await getOldPendingOrders(testEstablishmentId);
      const found = backlog.find((o: any) => o.id === oldOrder.id);
      
      expect(found).toBeDefined();
      expect(found.date).toBe(yesterdayStr);
      expect(found.orderLines[0].menuItemId).toBe(mockMenuItemId);

      await client.from("orders").delete().eq("id", oldOrder.id);
    });

    it("should ENSURE today's list does NOT contain old orders (No Duplicates)", async () => {
      const client = await createClient();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toLocaleDateString('en-CA');

      const { data: pastOrder } = await client.from("orders").insert({
        establishment_id: testEstablishmentId,
        total: 50,
        type: "LOCAL",
        status: "OPEN",
        detail: "Mesa Passada",
        date: yesterdayStr
      }).select("id").single();

      const todayOrders = await getTodayOrders(testEstablishmentId);
      const found = todayOrders.find((o: any) => o.id === pastOrder?.id);

      expect(found).toBeUndefined();

      if (pastOrder) await client.from("orders").delete().eq("id", pastOrder.id);
    });

    it("should NOT retrieve orders from OTHER establishments in backlog", async () => {
      const otherEstablishmentId = "00000000-0000-0000-0000-000000000000";
      const backlog = await getOldPendingOrders(otherEstablishmentId);
      expect(backlog.length).toBe(0);
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
