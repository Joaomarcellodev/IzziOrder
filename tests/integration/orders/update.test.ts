import { updateOrder, createOrder, OrderRequestDTO } from "@/app/actions/order-actions";
import { createClient } from "@/utils/supabase/server";

describe("Orders UPDATE Integration", () => {
  const testEstablishmentId = process.env.TEST_ESTABLISHMENT_ID;
  let mockMenuItemId = "6cfd93ee-1e3d-430d-b525-f5a30bc96338";
  let testLocalOrderId: string;
  let testPickupOrderId: string;
  let initialOrderLines: any[];
  let supabase: any;

  beforeAll(async () => {
    supabase = await createClient();
  });

  beforeEach(async () => {
    // Cleanup
    await supabase.from("orders").delete().eq("establishment_id", testEstablishmentId);


    initialOrderLines = [{ menuItemId: mockMenuItemId, name: "Pizza", quantity: 1, price: 50.00 }];

    // Create a LOCAL order
    const localOrder = await createOrder({
      total: 50.00,
      type: "LOCAL",
      status: "OPEN",
      detail: "5",
      orderLines: initialOrderLines
    }, testEstablishmentId);
    testLocalOrderId = localOrder.id!;

    // Create a PICKUP order
    const pickupOrder = await createOrder({
      total: 60.00,
      type: "PICKUP",
      status: "OPEN",
      detail: "João Silva",
      orderLines: [{ menuItemId: mockMenuItemId, name: "Burger", quantity: 1, price: 60.00 }]
    }, testEstablishmentId);
    testPickupOrderId = pickupOrder.id!;
  });

  // Casos válidos
  describe("Valid Cases", () => {
    it("should update order status and detail for LOCAL", async () => {
      const updateDTO: OrderRequestDTO = {
        id: testLocalOrderId,
        total: 50.00,
        type: "LOCAL",
        status: "OPEN",
        detail: "10",
        orderLines: initialOrderLines
      };

      const result = await updateOrder(updateDTO);

      expect(result.status).toBe("OPEN");
      // @ts-ignore
      expect(result.detail).toBe("10");
    });

    it("should update order lines (add, update, delete)", async () => {
      // Fetch current order to get line IDs
      const { data: orderWithLines } = await (await supabase)
        .from("orders")
        .select("*, order_lines(*)")
        .eq("id", testLocalOrderId)
        .single();

      if (!orderWithLines) throw new Error("Order not found in test");
      const existingLine = orderWithLines.order_lines[0];

      const updateDTO: OrderRequestDTO = {
        id: testLocalOrderId,
        total: 150.00,
        type: "LOCAL",
        detail: "5",
        orderLines: [
          {
            id: existingLine.id,
            menuItemId: existingLine.menu_item_id,
            name: "Pizza Atualizada",
            quantity: 2,
            price: 50.00
          }, // Update existing
          { menuItemId: mockMenuItemId, name: "Soda", quantity: 2, price: 25.00 } // Add new
        ]
      };

      const result = await updateOrder(updateDTO);

      expect(result.orderLines).toHaveLength(2);
      expect(result.total).toBe(150.00);
      const sodaLine = result.orderLines.find((l: { name: string; }) => l.name === "Soda");
      expect(sodaLine).toBeDefined();
      expect(sodaLine?.quantity).toBe(2);
    });

    it("should update customer name for PICKUP order", async () => {
      const updateDTO: OrderRequestDTO = {
        id: testPickupOrderId,
        total: 60.00,
        type: "PICKUP",
        detail: "Maria Oliveira",
        orderLines: [{ menuItemId: mockMenuItemId, name: "Burger", quantity: 1, price: 60.00 }]
      };

      const result = await updateOrder(updateDTO);

      // @ts-ignore
      expect(result.detail).toBe("Maria Oliveira");
    });
  });

  // Casos inválidos
  describe("Invalid Cases", () => {
    it("should throw error when updating non-existent order", async () => {
      const updateDTO: OrderRequestDTO = {
        id: "00000000-0000-0000-0000-000000000000",
        total: 50.00,
        type: "LOCAL",
        detail: "5",
        orderLines: initialOrderLines
      };

      await expect(updateOrder(updateDTO)).rejects.toThrow();
    });

    it("should reject update that violates business rules (e.g. no items)", async () => {
      const updateDTO: OrderRequestDTO = {
        id: testLocalOrderId,
        total: 0,
        type: "LOCAL",
        detail: "5",
        orderLines: []
      };

      await expect(updateOrder(updateDTO)).rejects.toThrow("O pedido deve conter pelo menos um item.");
    });

    it("should reject PICKUP update with short customer name", async () => {
      const updateDTO: OrderRequestDTO = {
        id: testPickupOrderId,
        total: 60.00,
        type: "PICKUP",
        detail: "Jo",
        orderLines: [{ menuItemId: mockMenuItemId, name: "Burger", quantity: 1, price: 60.00 }]
      };

      await expect(updateOrder(updateDTO)).rejects.toThrow(/pelo menos 3 caracteres/);
    });

    it("should throw error when trying to update CLOSED order", async () => {
      // First, close the order
      const { error } = await (await supabase)
        .from("orders")
        .update({ status: "CLOSED" })
        .eq("id", testLocalOrderId);

      expect(error).toBeNull();

      const updateDTO: OrderRequestDTO = {
        id: testLocalOrderId,
        total: 100.00,
        type: "LOCAL",
        status: "CLOSED", // Pass status as CLOSED too, though it should fail even if we try to keep it CLOSED
        detail: "10",
        orderLines: initialOrderLines
      };

      await expect(updateOrder(updateDTO)).rejects.toThrow("Não é possível atualizar um pedido fechado.");
    });
  });

  afterAll(async () => {
    await (await supabase).from("orders").delete().eq("establishment_id", testEstablishmentId);
  });
});
