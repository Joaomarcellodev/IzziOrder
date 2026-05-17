"use client";

import { useState, useEffect } from "react";
import { getSalesReport } from "@/app/actions/report-actions";
import { SalesReport, SalesReportFilters } from "@/lib/entities/report";
import { getEstablishmentId } from "@/app/actions/establisment_actions";
import { getCategories } from "@/app/actions/category-actions";
import { getMenuItems } from "@/app/actions/menu-item-actions";
import { subDays, startOfDay, endOfDay } from "date-fns";

export function useSalesReport() {
  const [report, setReport] = useState<SalesReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SalesReportFilters>({
    establishmentId: "",
    startDate: startOfDay(subDays(new Date(), 7)).toISOString(),
    endDate: endOfDay(new Date()).toISOString(),
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);

  useEffect(() => {
    async function init() {
      const estId = await getEstablishmentId();
      setFilters(f => ({ ...f, establishmentId: estId }));
      
      const cats = await getCategories(estId);
      if (cats.success) setCategories(cats.data || []);
      
      const items = await getMenuItems(estId);
      if (items.success) setMenuItems(items.data || []);
    }
    init();
  }, []);

  useEffect(() => {
    if (!filters.establishmentId) return;

    async function fetchReport() {
      setLoading(true);
      try {
        const data = await getSalesReport(filters);
        setReport(data);
      } catch (error) {
        console.error("Failed to fetch report:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [filters]);

  return { report, loading, filters, setFilters, categories, menuItems };
}
