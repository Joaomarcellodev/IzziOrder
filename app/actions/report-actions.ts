"use server";

import { createClient } from "@/utils/supabase/server";
import { PaymentMethod, OrderType } from "@/lib/entities/order";
import { startOfDay, endOfDay, subDays, format, parseISO, getMonth, getYear } from "date-fns";

export interface SalesReportFilters {
  establishmentId: string;
  startDate?: string;
  endDate?: string;
  paymentMethod?: PaymentMethod;
  type?: OrderType;
  productId?: string;
  month?: number;
  year?: number;
}

export interface SalesReport {
  deliveryFeeTotal: number;
  generalTotalSales: number;
  salesByDay: { date: string; total: number; count: number }[];
  salesByProduct: { 
    name: string; 
    quantity: number; 
    total: number; 
    category?: string;
    taxa: number;
    troco: number;
    paymentMethods: string[];
  }[];
  salesByPaymentMethod: { method: PaymentMethod; total: number }[];
  salesByType: { type: OrderType; total: number }[];
  ordersByDay: { 
    date: string; 
    orders: any[];
  }[];
}

export async function getSalesReport(filters: SalesReportFilters): Promise<SalesReport> {
  const supabase = await createClient();
  
  let query = supabase
    .from("orders")
    .select("*, order_lines(*, menu_items(categories(name)))")
    .eq("establishment_id", filters.establishmentId);

  // Default to last 7 days if no dates are provided
  if (!filters.startDate && !filters.endDate && !filters.month && !filters.year) {
    const sevenDaysAgo = startOfDay(subDays(new Date(), 7)).toISOString();
    query = query.gte("date", sevenDaysAgo);
  }

  if (filters.startDate) {
    query = query.gte("date", startOfDay(parseISO(filters.startDate)).toISOString());
  }
  if (filters.endDate) {
    query = query.lte("date", endOfDay(parseISO(filters.endDate)).toISOString());
  }
  if (filters.paymentMethod) {
    query = query.eq("payment_method", filters.paymentMethod);
  }
  if (filters.type) {
    query = query.eq("type", filters.type);
  }

  const { data: orders, error } = await query;

  if (error) {
    console.error("Error fetching sales report data:", error);
    throw new Error("Failed to fetch sales report data.");
  }

  let filteredOrders = orders || [];

  // Filter by month/year if provided (Supabase doesn't have easy month/year extraction in simple queries)
  if (filters.month !== undefined) {
    filteredOrders = filteredOrders.filter(o => getMonth(parseISO(o.date)) + 1 === filters.month);
  }
  if (filters.year !== undefined) {
    filteredOrders = filteredOrders.filter(o => getYear(parseISO(o.date)) === filters.year);
  }

  // Filter by product if provided
  if (filters.productId) {
    filteredOrders = filteredOrders.filter(o => 
      o.order_lines.some((line: any) => line.menu_item_id === filters.productId)
    );
  }

  const report: SalesReport = {
    deliveryFeeTotal: 0,
    generalTotalSales: 0,
    salesByDay: [],
    salesByProduct: [],
    salesByPaymentMethod: [],
    salesByType: [],
    ordersByDay: [],
  };

  const salesByDayMap = new Map<string, { total: number; count: number }>();
  const ordersByDayMap = new Map<string, any[]>();
  const salesByProductMap = new Map<string, { 
    name: string, 
    quantity: number, 
    total: number, 
    category?: string,
    taxa: number,
    troco: number,
    paymentMethods: Set<string>
  }>();
  const salesByPaymentMethodMap = new Map<PaymentMethod, number>();
  const salesByTypeMap = new Map<OrderType, number>();

  filteredOrders.forEach((order: any) => {
    const total = parseFloat(order.total);
    const deliveryFee = parseFloat(order.delivery_fee || 0);
    const changeValue = parseFloat(order.change_value || 0);
    
    report.generalTotalSales += total;
    report.deliveryFeeTotal += deliveryFee;

    // Sales by Day
    const day = format(parseISO(order.date), "yyyy-MM-dd");
    const dayData = salesByDayMap.get(day) || { total: 0, count: 0 };
    dayData.total += total;
    dayData.count += 1;
    salesByDayMap.set(day, dayData);

    // Orders by Day
    const dayOrders = ordersByDayMap.get(day) || [];
    dayOrders.push(order);
    ordersByDayMap.set(day, dayOrders);

    // Sales by Payment Method
    if (order.payment_method) {
      salesByPaymentMethodMap.set(
        order.payment_method, 
        (salesByPaymentMethodMap.get(order.payment_method) || 0) + total
      );
    }

    // Sales by Type
    salesByTypeMap.set(order.type, (salesByTypeMap.get(order.type) || 0) + total);

    // Sales by Product
    const lineCount = order.order_lines.length;
    order.order_lines.forEach((line: any) => {
      if (filters.productId && line.menu_item_id !== filters.productId) return;

      const categoryName = line.menu_items?.categories?.name;
      const productData = salesByProductMap.get(line.menu_item_id) || { 
        name: line.name, 
        quantity: 0, 
        total: 0,
        category: categoryName,
        taxa: 0,
        troco: 0,
        paymentMethods: new Set<string>()
      };
      
      productData.quantity += line.quantity;
      productData.total += (line.price * line.quantity);
      if (lineCount > 0) {
        productData.taxa += deliveryFee / lineCount;
        productData.troco += changeValue / lineCount;
      }
      if (order.payment_method) {
        productData.paymentMethods.add(order.payment_method);
      }
      
      salesByProductMap.set(line.menu_item_id, productData);
    });
  });

  report.salesByDay = Array.from(salesByDayMap.entries())
    .map(([date, data]) => ({ date, total: data.total, count: data.count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  report.ordersByDay = Array.from(ordersByDayMap.entries())
    .map(([date, orders]) => ({ date, orders }))
    .sort((a, b) => b.date.localeCompare(a.date)); // Sort by date descending

  report.salesByProduct = Array.from(salesByProductMap.values())
    .map(p => ({
      ...p,
      paymentMethods: Array.from(p.paymentMethods)
    }))
    .sort((a, b) => b.total - a.total);

  report.salesByPaymentMethod = Array.from(salesByPaymentMethodMap.entries())
    .map(([method, total]) => ({ method, total }));

  report.salesByType = Array.from(salesByTypeMap.entries())
    .map(([type, total]) => ({ type, total }));

  return report;
}
