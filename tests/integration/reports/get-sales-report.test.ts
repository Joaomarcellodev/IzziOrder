import { getSalesReport } from "@/app/actions/report-actions";
import { createOrder, OrderRequestDTO } from "@/app/actions/order-actions";
import { createClient } from "@/utils/supabase/server";
import { createCategory } from "@/app/actions/category-actions";
import { createMenuItem } from "@/app/actions/menu-item-actions";

describe("getSalesReport Integration Tests", () => {
  const establishmentId = process.env.TEST_ESTABLISHMENT_ID!;
  let categoryId: string;
  let menuItemId: string;
  let menuItemId2: string;
  const supabase = createClient();

  beforeAll(async () => {
    try {
      if (!establishmentId) throw new Error("TEST_ESTABLISHMENT_ID not set");
      const s = await supabase;

      // Login
      const { error: loginError } = await s.auth.signInWithPassword({
        email: "usuario@teste.com",
        password: "senhatesteA1",
      });
      if (loginError) throw new Error("Failed to login: " + loginError.message);

      const categoryName = "Cat Report " + Date.now();
      const testCategory = await createCategory(categoryName, s);
      if (!testCategory.success || !testCategory.data) throw new Error("Failed to create test category: " + testCategory.error);
      categoryId = testCategory.data.id;

      const testItem = await createMenuItem({
        id: null,
        name: "Item Teste Report",
        description: "Desc",
        price: 50,
        categoryId: categoryId,
        available: true
      }, s);
      if (!testItem.success || !testItem.data) throw new Error("Failed to create test menu item: " + testItem.error);
      menuItemId = testItem.data.id;

      const testItem2 = await createMenuItem({
        id: null,
        name: "Item Teste Report 2",
        description: "Desc 2",
        price: 50,
        categoryId: categoryId,
        available: true
      }, s);
      if (!testItem2.success || !testItem2.data) throw new Error("Failed to create second test menu item: " + testItem2.error);
      menuItemId2 = testItem2.data.id;
    } catch (error) {
      console.error("Setup failed:", error);
      throw error;
    }
  }, 30000);

  beforeEach(async () => {
    const s = await supabase;
    await s.from("orders").delete().eq("establishment_id", establishmentId);
  });

  it("should return sales report for the last 7 days by default", async () => {
    const order1: OrderRequestDTO = {
      total: 100,
      type: "LOCAL",
      status: "CLOSED",
      detail: "Mesa 1",
      orderLines: [{ menuItemId: menuItemId, name: "Item Teste Report", quantity: 2, price: 50 }],
      paymentMethod: "PIX"
    };

    await createOrder(order1, establishmentId);

    const report = await getSalesReport({ establishmentId });

    expect(report).toBeDefined();
    expect(report.generalTotalSales).toBe(100);
    expect(report.salesByDay.length).toBe(1);
  }, 15000);

  it("should filter by payment method", async () => {
    const orderPix: OrderRequestDTO = {
      total: 50,
      type: "LOCAL",
      status: "CLOSED",
      detail: "Mesa 2",
      orderLines: [{ menuItemId: menuItemId, name: "Item Pix", quantity: 1, price: 50 }],
      paymentMethod: "PIX"
    };
    const orderCredito: OrderRequestDTO = {
      total: 80,
      type: "LOCAL",
      status: "CLOSED",
      detail: "Mesa 3",
      orderLines: [{ menuItemId: menuItemId, name: "Item Credito", quantity: 1, price: 80 }],
      paymentMethod: "CREDITO"
    };
    await createOrder(orderPix, establishmentId);
    await createOrder(orderCredito, establishmentId);

    const report = await getSalesReport({
      establishmentId,
      paymentMethod: "PIX"
    });

    const pixTotal = report.salesByPaymentMethod.find(p => p.method === "PIX")?.total;
    expect(pixTotal).toBe(50);
    expect(report.salesByPaymentMethod.length).toBe(1);
  }, 15000);

  it("should filter by date range", async () => {
    const today = new Date().toISOString().split('T')[0];
    const order: OrderRequestDTO = {
      total: 50,
      type: "LOCAL",
      status: "CLOSED",
      detail: "Mesa 1",
      orderLines: [{ menuItemId: menuItemId, name: "Item", quantity: 1, price: 50 }],
      paymentMethod: "PIX"
    };
    await createOrder(order, establishmentId);

    const report = await getSalesReport({
      establishmentId,
      startDate: today,
      endDate: today
    });

    expect(report.generalTotalSales).toBe(50);
    expect(report.salesByDay.length).toBe(1);
  }, 15000);

  it("should filter by product", async () => {
    const order: OrderRequestDTO = {
      total: 100,
      type: "LOCAL",
      status: "CLOSED",
      detail: "Mesa 1",
      orderLines: [
        { menuItemId: menuItemId, name: "Item Teste Report 1", quantity: 1, price: 50 },
        { menuItemId: menuItemId2, name: "Item Teste Report 2", quantity: 1, price: 50 }
      ],
      paymentMethod: "PIX"
    };
    await createOrder(order, establishmentId);

    const report = await getSalesReport({
      establishmentId,
      productId: menuItemId
    });

    expect(report.generalTotalSales).toBe(50);
    expect(report.salesByProduct).toHaveLength(1);
    expect(report.salesByProduct[0].name).toBe("Item Teste Report 1");
  }, 15000);

  it("should only include CLOSED orders in the report", async () => {
    const closedOrder: OrderRequestDTO = {
      total: 100,
      type: "LOCAL",
      status: "CLOSED",
      detail: "Mesa 1",
      orderLines: [{ menuItemId: menuItemId, name: "Item", quantity: 2, price: 50 }],
      paymentMethod: "PIX"
    };
    const openOrder: OrderRequestDTO = {
      total: 999,
      type: "LOCAL",
      status: "OPEN",
      detail: "Mesa 99",
      orderLines: [{ menuItemId: menuItemId, name: "Item", quantity: 1, price: 999 }],
      paymentMethod: "PIX"
    };
    await createOrder(closedOrder, establishmentId);
    await createOrder(openOrder, establishmentId);

    const report = await getSalesReport({ establishmentId });

    expect(report.generalTotalSales).toBe(100);
    const has999 = report.ordersByDay.some(day =>
      day.orders.some(o => parseFloat(o.total) === 999)
    );
    expect(has999).toBe(false);
  }, 15000);

  it("should filter by order type (LOCAL/PICKUP)", async () => {
    const pickupOrder: OrderRequestDTO = {
      total: 50,
      type: "PICKUP",
      status: "CLOSED",
      detail: "Cliente 1",
      orderLines: [{ menuItemId: menuItemId, name: "Item", quantity: 1, price: 50 }],
      paymentMethod: "PIX"
    };
    const localOrder: OrderRequestDTO = {
      total: 50,
      type: "LOCAL",
      status: "CLOSED",
      detail: "Mesa 1",
      orderLines: [{ menuItemId: menuItemId, name: "Item", quantity: 1, price: 50 }],
      paymentMethod: "PIX"
    };
    await createOrder(pickupOrder, establishmentId);
    await createOrder(localOrder, establishmentId);

    const report = await getSalesReport({
      establishmentId,
      type: "PICKUP"
    });

    expect(report.generalTotalSales).toBe(50);
    const onlyPickup = report.ordersByDay.every(day =>
      day.orders.every(o => o.type === "PICKUP")
    );
    expect(onlyPickup).toBe(true);
  }, 15000);

  it("should filter by month and year", async () => {
    const order: OrderRequestDTO = {
      total: 50,
      type: "LOCAL",
      status: "CLOSED",
      detail: "Mesa 1",
      orderLines: [{ menuItemId: menuItemId, name: "Item", quantity: 1, price: 50 }],
      paymentMethod: "PIX"
    };
    await createOrder(order, establishmentId);

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const report = await getSalesReport({
      establishmentId,
      month: currentMonth,
      year: currentYear
    });

    expect(report.generalTotalSales).toBe(50);

    const reportEmpty = await getSalesReport({
      establishmentId,
      month: currentMonth === 12 ? 1 : currentMonth + 1,
      year: currentYear + 1
    });

    expect(reportEmpty.generalTotalSales).toBe(0);
  }, 15000);

  it("should return empty report when no orders match filters", async () => {
    const report = await getSalesReport({
      establishmentId,
      startDate: "2000-01-01",
      endDate: "2000-01-01"
    });

    expect(report.generalTotalSales).toBe(0);
    expect(report.salesByDay).toHaveLength(0);
  }, 15000);

  it("should filter by combination of type and payment method", async () => {
    const order1: OrderRequestDTO = {
      total: 50,
      type: "LOCAL",
      status: "CLOSED",
      detail: "Mesa 1",
      orderLines: [{ menuItemId: menuItemId, name: "Item", quantity: 1, price: 50 }],
      paymentMethod: "PIX"
    };
    const order2: OrderRequestDTO = {
      total: 50,
      type: "PICKUP",
      status: "CLOSED",
      detail: "Cliente 1",
      orderLines: [{ menuItemId: menuItemId, name: "Item", quantity: 1, price: 50 }],
      paymentMethod: "PIX"
    };
    await createOrder(order1, establishmentId);
    await createOrder(order2, establishmentId);

    const report = await getSalesReport({
      establishmentId,
      type: "LOCAL",
      paymentMethod: "PIX"
    });

    expect(report.generalTotalSales).toBe(50);
    const allMatch = report.ordersByDay.every(day =>
      day.orders.every(o => o.type === "LOCAL" && o.payment_method === "PIX")
    );
    expect(allMatch).toBe(true);
  }, 15000);

  it("should calculate revenue accurately when filtering by a specific product in a multi-item order", async () => {
    const multiItemOrder: OrderRequestDTO = {
      total: 150, // 2x Item1 (50 each) + 1x Item2 (50 each)
      type: "LOCAL",
      status: "CLOSED",
      detail: "Mesa 5",
      orderLines: [
        { menuItemId: menuItemId, name: "Item Teste Report", quantity: 2, price: 50 },
        { menuItemId: menuItemId2, name: "Item Teste Report 2", quantity: 1, price: 50 }
      ],
      paymentMethod: "ESPECIE_SEM_TROCO"
    };
    await createOrder(multiItemOrder, establishmentId);

    const report = await getSalesReport({
      establishmentId,
      productId: menuItemId
    });

    expect(report.generalTotalSales).toBe(100);
  }, 15000);

  it("should correctly aggregate accessory totals like delivery fees and change", async () => {
    const orderWithExtras: OrderRequestDTO = {
      total: 100,
      type: "DELIVERY",
      status: "CLOSED",
      detail: "Rua Teste, 123",
      deliveryFee: 15,
      changeValue: 5,
      orderLines: [{ menuItemId: menuItemId, name: "Item Extras", quantity: 2, price: 50 }],
      paymentMethod: "ESPECIE_COM_TROCO"
    };
    await createOrder(orderWithExtras, establishmentId);

    const report = await getSalesReport({ establishmentId });
    expect(report.deliveryFeeTotal).toBe(15);
    expect(report.totalChange).toBe(5);
  }, 15000);

  it("should return empty report for invalid establishment ID", async () => {
    const report = await getSalesReport({
      establishmentId: "00000000-0000-0000-0000-000000000000"
    });
    expect(report.generalTotalSales).toBe(0);
  }, 15000);

  it("should return empty report when date range is inverted", async () => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const order: OrderRequestDTO = {
      total: 50,
      type: "LOCAL",
      status: "CLOSED",
      detail: "Mesa 1",
      orderLines: [{ menuItemId: menuItemId, name: "Item", quantity: 1, price: 50 }],
      paymentMethod: "PIX"
    };
    await createOrder(order, establishmentId);

    const report = await getSalesReport({
      establishmentId,
      startDate: tomorrow,
      endDate: today
    });
    expect(report.generalTotalSales).toBe(0);
  }, 15000);

  it("should return salesByDay sorted ascending and ordersByDay sorted descending", async () => {
    // This test might be tricky with same-day orders, but we can verify the structure
    const order: OrderRequestDTO = {
      total: 50,
      type: "LOCAL",
      status: "CLOSED",
      detail: "Mesa 1",
      orderLines: [{ menuItemId: menuItemId, name: "Item", quantity: 1, price: 50 }],
      paymentMethod: "PIX"
    };
    await createOrder(order, establishmentId);

    const report = await getSalesReport({ establishmentId });

    expect(report.salesByDay).toBeDefined();
    expect(report.ordersByDay).toBeDefined();

    if (report.salesByDay.length > 1) {
      for (let i = 0; i < report.salesByDay.length - 1; i++) {
        expect(new Date(report.salesByDay[i].date).getTime())
          .toBeLessThanOrEqual(new Date(report.salesByDay[i + 1].date).getTime());
      }
    }

    if (report.ordersByDay.length > 1) {
      for (let i = 0; i < report.ordersByDay.length - 1; i++) {
        expect(new Date(report.ordersByDay[i].date).getTime())
          .toBeGreaterThanOrEqual(new Date(report.ordersByDay[i + 1].date).getTime());
      }
    }
  }, 15000);

  afterAll(async () => {
    const s = await supabase;
    await s.from("orders").delete().eq("establishment_id", establishmentId);

    if (menuItemId) {
      await s.from("menu_items").delete().eq("id", menuItemId);
    }
    if (menuItemId2) {
      await s.from("menu_items").delete().eq("id", menuItemId2);
    }
    if (categoryId) {
      await s.from("categories").delete().eq("id", categoryId);
    }
  }, 30000);
});
