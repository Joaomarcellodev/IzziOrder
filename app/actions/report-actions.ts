"use server";

import { createClient } from "@/utils/supabase/server";
import { SalesReportFilters, SalesReport } from "@/lib/entities/report";
import { SalesReportProcessor } from "@/lib/entities/sales-report-processor";
import { startOfDay, endOfDay, subDays, parseISO } from "date-fns";

export async function getSalesReport(filters: SalesReportFilters): Promise<SalesReport> {
  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select("*, order_lines(*, menu_items(categories(name)))")
    .eq("establishment_id", filters.establishmentId)
    .eq("status", "CLOSED")

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

  const processor = new SalesReportProcessor(orders || [], filters);
  return processor.generateReport();
}