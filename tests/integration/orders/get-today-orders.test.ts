import { createOrder, getTodayOrders, OrderRequestDTO } from "@/app/actions/order-actions";
import { createClient } from "@/utils/supabase/server";

describe("Orders getTodayOrders Integration", () => {
  const testEstablishmentId = process.env.TEST_ESTABLISHMENT_ID!;
  const mockMenuItemId = "6cfd93ee-1e3d-430d-b525-f5a30bc96338";
  const supabase = createClient();

  beforeEach(async () => {
    await (await supabase).from("orders").delete().eq("establishment_id", testEstablishmentId);
  });

  it("should retrieve only orders from today", async () => {
    const orderTodayDTO: OrderRequestDTO = {
      total: 50.00,
      type: "LOCAL",
      status: "OPEN",
      detail: "Mesa Hoje",
      orderLines: [{ menuItemId: mockMenuItemId, name: "Item Hoje", quantity: 1, price: 50.00 }]
    };
    await createOrder(orderTodayDTO, testEstablishmentId);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { data: orderYesterday, error: errorYesterday } = await (await supabase)
      .from("orders")
      .insert({
        total: 30.00,
        type: "LOCAL",
        status: "OPEN",
        establishment_id: testEstablishmentId,
        detail: "Mesa Ontem",
        date: yesterday.toISOString()
      })
      .select()
      .single();

    if (errorYesterday) throw errorYesterday;

    await (await supabase).from("order_lines").insert({
      order_id: orderYesterday.id,
      menu_item_id: mockMenuItemId,
      name: "Item Ontem",
      quantity: 1,
      price: 30.00
    });

    const todayOrders = await getTodayOrders(testEstablishmentId);

    expect(todayOrders).toBeDefined();
    expect(todayOrders.length).toBe(1);
    expect(todayOrders[0].detail).toBe("Mesa Hoje");
  });

  it("should return empty array if no orders for today", async () => {
    const todayOrders = await getTodayOrders(testEstablishmentId);
    expect(todayOrders).toEqual([]);
  });

  afterAll(async () => {
    await (await supabase).from("orders").delete().eq("establishment_id", testEstablishmentId);
  });
});
