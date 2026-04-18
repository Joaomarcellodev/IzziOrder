import { deleteOrder, createOrder, OrderRequestDTO } from "@/app/actions/order-actions";
import { createClient } from "@/utils/supabase/server";

describe("Orders DELETE Integration", () => {
  const testEstablishmentId = process.env.TEST_ESTABLISHMENT_ID;

  let mockMenuItemId = "6cfd93ee-1e3d-430d-b525-f5a30bc96338";
  let orderIdToDelete: string;
  let orderWithLinesId: string;
  let closedOrderId: string;
  let supabase: any;

  beforeAll(async () => {
    supabase = await createClient();
  });

  beforeEach(async () => {
    // Cria um pedido LOCAL básico para delete
    const basicOrder = await createOrder({
      total: 89.90,
      type: "LOCAL",
      status: "OPEN",
      detail: "7",
      orderLines: [{ menuItemId: mockMenuItemId, name: "Pizza", quantity: 1, price: 89.90 }]
    }, testEstablishmentId);
    orderIdToDelete = basicOrder.id!;

    // Cria um pedido COM ORDER LINES para testar dependências
    const orderWithLines = await createOrder({
      total: 150.00,
      type: "LOCAL",
      status: "OPEN",
      detail: "8",
      orderLines: [
        { menuItemId: mockMenuItemId, name: "Pizza Test", quantity: 2, price: 50.00 },
        { menuItemId: mockMenuItemId, name: "Bebida Test", quantity: 1, price: 50.00 }
      ]
    }, testEstablishmentId);
    orderWithLinesId = orderWithLines.id!;

    const closedOrder = await createOrder({
      total: 75.50,
      type: "PICKUP",
      status: "OPEN",
      detail: "João Silva",
      orderLines: [{ menuItemId: mockMenuItemId, name: "Burger", quantity: 1, price: 75.50 }]
    }, testEstablishmentId);
    closedOrderId = closedOrder.id!;
    await supabase.from("orders").update({ status: "CLOSED" }).eq("id", closedOrderId);
  }, 10000);

  // Casos válidos - DELETE BÁSICO
  describe("Valid Cases - Basic DELETE", () => {
    it("should delete an existing order successfully", async () => {
      await deleteOrder(orderIdToDelete);

      // Verifica se o pedido foi apagado
      const { data: deletedOrder } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderIdToDelete)
        .maybeSingle();

      expect(deletedOrder).toBeNull();
    });

    it("should delete CLOSED order", async () => {
      await deleteOrder(closedOrderId);

      const { data: deletedOrder } = await supabase
        .from("orders")
        .select("*")
        .eq("id", closedOrderId)
        .maybeSingle();

      expect(deletedOrder).toBeNull();
    });
  });

  // Casos válidos - DELETE com Dependências
  describe("Valid Cases - DELETE with Dependencies", () => {
    it("should delete order and its order_lines automatically (cascade)", async () => {
      await deleteOrder(orderWithLinesId);

      // Verifica se o pedido foi apagado
      const { data: deletedOrder } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderWithLinesId)
        .maybeSingle();

      expect(deletedOrder).toBeNull();

      // Verifica se as linhas também foram apagadas
      const { data: lines } = await supabase
        .from("order_lines")
        .select("*")
        .eq("order_id", orderWithLinesId);

      expect(lines).toHaveLength(0);
    });
  });

  // Casos inválidos
  describe("Invalid Cases", () => {
    it("should throw error for non-existent order ID", async () => {
      await expect(deleteOrder("00000000-0000-0000-0000-000000000000")).rejects.toThrow();
    });

    it("should throw error for empty ID", async () => {
      await expect(deleteOrder("")).rejects.toThrow("ID do pedido inválido.");
    });
  });

  afterAll(async () => {
    await supabase.from("orders").delete().eq("establishment_id", testEstablishmentId);
  });
});
