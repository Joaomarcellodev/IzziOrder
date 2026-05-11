import { getSalesReport } from "@/app/actions/report-actions";
import { createOrder, OrderRequestDTO } from "@/app/actions/order-actions";
import { createClient } from "@/utils/supabase/server";
import { createCategory } from "@/app/actions/category-actions";
import { createMenuItem } from "@/app/actions/menu-item-actions";

describe("getSalesReport Integration Tests", () => {
  const establishmentId = process.env.TEST_ESTABLISHMENT_ID!;
  let categoryId: string;
  let menuItemId: string;
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

      await s.from("orders").delete().eq("establishment_id", establishmentId);

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
    } catch (error) {
      console.error("Setup failed:", error);
      throw error;
    }
  });

  it("should return sales report for the last 7 days by default", async () => {
    const order1: OrderRequestDTO = {
      total: 100,
      type: "LOCAL",
      detail: "Mesa 1",
      orderLines: [{ menuItemId: menuItemId, name: "Item Teste Report", quantity: 2, price: 50 }],
      paymentMethod: "PIX"
    };

    const order2: OrderRequestDTO = {
      total: 150,
      type: "DELIVERY",
      detail: "Rua Teste, 123",
      deliveryFee: 10,
      orderLines: [{ menuItemId: menuItemId, name: "Item Teste Report", quantity: 3, price: 50 }],
      paymentMethod: "CREDITO"
    };

    await createOrder(order1, establishmentId);
    await createOrder(order2, establishmentId);

    const report = await getSalesReport({ establishmentId });

    expect(report).toBeDefined();
    expect(report.generalTotalSales).toBeGreaterThanOrEqual(260);
    expect(report.deliveryFeeTotal).toBeGreaterThanOrEqual(10);
    expect(report.salesByDay.length).toBeGreaterThanOrEqual(1);
  });

  it("should filter by payment method", async () => {
    const orderPix: OrderRequestDTO = {
      total: 50,
      type: "LOCAL",
      detail: "Mesa 2",
      orderLines: [{ menuItemId: menuItemId, name: "Item Pix", quantity: 1, price: 50 }],
      paymentMethod: "PIX"
    };
    await createOrder(orderPix, establishmentId);

    const report = await getSalesReport({
      establishmentId,
      paymentMethod: "PIX"
    });

    expect(report.salesByPaymentMethod.find(p => p.method === "PIX")?.total).toBeGreaterThanOrEqual(50);
    expect(report.generalTotalSales).toBeGreaterThanOrEqual(150);
  });

  it("should filter by date range", async () => {
    const today = new Date().toISOString();
    const report = await getSalesReport({
      establishmentId,
      startDate: today,
      endDate: today
    });

    expect(report).toBeDefined();
    expect(report.salesByDay.length).toBeGreaterThanOrEqual(1);
  });

  it("should filter by product", async () => {
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
    if (categoryId) {
      await s.from("categories").delete().eq("id", categoryId);
    }
  });
});
