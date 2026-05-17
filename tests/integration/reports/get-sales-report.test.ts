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

    expect(report.salesByProduct).toBeDefined();
    expect(report.salesByProduct.length).toBeGreaterThanOrEqual(1);
    expect(report.salesByProduct[0].name).toBe("Item Teste Report");
  });

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
