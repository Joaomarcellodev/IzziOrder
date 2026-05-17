import { SalesReportProcessor } from "@/lib/entities/sales-report-processor";
import { SalesReportFilters } from "@/lib/entities/report";

describe("SalesReportProcessor", () => {
  const mockOrders = [
    {
      id: "1",
      total: "100.00",
      delivery_fee: "10.00",
      change_value: "0.00",
      date: "2024-01-15T10:00:00Z",
      payment_method: "PIX",
      type: "DELIVERY",
      order_lines: [
        {
          menu_item_id: "prod-1",
          name: "Pizza",
          quantity: 2,
          price: 45.0,
          menu_items: { categories: { name: "Massas" } }
        },
        {
          menu_item_id: "prod-2",
          name: "Coke",
          quantity: 1,
          price: 10.0,
          menu_items: { categories: { name: "Bebidas" } }
        }
      ]
    },
    {
      id: "2",
      total: "50.00",
      delivery_fee: "0.00",
      change_value: "5.00",
      date: "2024-01-16T10:00:00Z",
      payment_method: "CREDITO",
      type: "LOCAL",
      order_lines: [
        {
          menu_item_id: "prod-1",
          name: "Pizza",
          quantity: 1,
          price: 50.0,
          menu_items: { categories: { name: "Massas" } }
        }
      ]
    }
  ];

  const defaultFilters: SalesReportFilters = {
    establishmentId: "est-1"
  };

  it("should calculate basic totals correctly without filters", () => {
    const processor = new SalesReportProcessor(mockOrders as any, defaultFilters);
    const report = processor.generateReport();

    expect(report.generalTotalSales).toBe(150.0);
    expect(report.deliveryFeeTotal).toBe(10.0);
    expect(report.totalChange).toBe(5.0);
  });

  it("should filter by month and year", () => {
    const filters: SalesReportFilters = {
      ...defaultFilters,
      month: 1,
      year: 2024
    };
    const processor = new SalesReportProcessor(mockOrders as any, filters);
    const report = processor.generateReport();
    expect(report.generalTotalSales).toBe(150.0);

    const filtersFeb: SalesReportFilters = {
      ...defaultFilters,
      month: 2,
      year: 2024
    };
    const processorFeb = new SalesReportProcessor(mockOrders as any, filtersFeb);
    const reportFeb = processorFeb.generateReport();
    expect(reportFeb.generalTotalSales).toBe(0);
  });

  it("should isolate product revenue when productId filter is applied", () => {
    const filters: SalesReportFilters = {
      ...defaultFilters,
      productId: "prod-1"
    };
    const processor = new SalesReportProcessor(mockOrders as any, filters);
    const report = processor.generateReport();

    // Order 1: 2 Pizzas * 45 = 90
    // Order 2: 1 Pizza * 50 = 50
    // Total should be 140, NOT 150 (Order 1 had a Coke of 10.0)
    expect(report.generalTotalSales).toBe(140.0);
    
    // Check if salesByDay also reflects filtered totals
    expect(report.salesByDay.find(d => d.date === "2024-01-15")?.total).toBe(90.0);
    expect(report.salesByDay.find(d => d.date === "2024-01-16")?.total).toBe(50.0);
  });

  it("should ensure state isolation between calls", () => {
    const processor = new SalesReportProcessor(mockOrders as any, defaultFilters);
    
    const report1 = processor.generateReport();
    const report2 = processor.generateReport();

    expect(report1.generalTotalSales).toBe(150.0);
    expect(report2.generalTotalSales).toBe(150.0); // Should NOT be 300.0
  });

  it("should correctly group orders by day and sort them descending", () => {
    const processor = new SalesReportProcessor(mockOrders as any, defaultFilters);
    const report = processor.generateReport();

    expect(report.ordersByDay.length).toBe(2);
    expect(report.ordersByDay[0].date).toBe("2024-01-16");
    expect(report.ordersByDay[1].date).toBe("2024-01-15");
  });

  it("should correctly calculate sales by payment method", () => {
    const processor = new SalesReportProcessor(mockOrders as any, defaultFilters);
    const report = processor.generateReport();

    const pixSales = report.salesByPaymentMethod.find(p => p.method === "PIX");
    const creditSales = report.salesByPaymentMethod.find(p => p.method === "CREDITO");

    expect(pixSales?.total).toBe(100.0);
    expect(creditSales?.total).toBe(50.0);
  });
});
