"use client";

import { useState } from "react";
import { DollarSign, ShoppingBag, Users, Clock, FileDown, LayoutDashboard, Utensils, ClipboardList } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/molecules/tabs";
import { Button } from "@/components/atoms/button";

import { KPIStats } from "./kpi-stats";
import { RevenueChart } from "./revenue-chart";
import { OrderHistoryTable } from "./order-history-table";
import { DistributionChart } from "./distribution-chart";
import { TopItemsTable } from "./top-items-table";
import { ReportFilters } from "@/components/molecules/report-filters";

import {
  COLORS,
  CHART_COLORS,
  ORDER_TYPE_LABELS
} from "@/app/auth/reports/constants";
import { useSalesReport } from "@/hooks/use-sales-report";
import { format, parseISO } from "date-fns";

export function ReportsAnalytics() {
  const { report, loading, filters, setFilters, menuItems } = useSalesReport();

  const handleExportPDF = () => {
    window.print();
  };

  const dynamicKpis = report ? [
    { title: "Total de Vendas", value: `R$ ${report.generalTotalSales.toFixed(2)}`, trend: 0, icon: DollarSign, borderColor: COLORS.primary },
    { title: "Taxa de Entrega", value: `R$ ${report.deliveryFeeTotal.toFixed(2)}`, trend: 0, icon: ShoppingBag, borderColor: COLORS.secondary },
    { title: "Total de Pedidos", value: `${report.salesByDay.length > 0 ? report.salesByDay.reduce((acc, d) => acc + (d as any).count || 0, 0) : '0'}`, trend: 0, icon: Users, borderColor: COLORS.success },
    { title: "Ticket Médio", value: `R$ ${report.generalTotalSales > 0 ? (report.generalTotalSales / (report.salesByDay.length || 1)).toFixed(2) : '0.00'}`, trend: 0, icon: Clock, borderColor: COLORS.danger },
  ] : [];

  const dynamicRevenue = report?.salesByDay.map(d => ({
    name: format(parseISO(d.date), "dd/MM"),
    revenue: d.total
  })) || [];

  const dynamicDistribution = report?.salesByType.map((t, idx) => ({
    name: ORDER_TYPE_LABELS[t.type] || t.type,
    value: t.total,
    color: CHART_COLORS[idx % CHART_COLORS.length]
  })) || [];

  const dynamicTopItems = report?.salesByProduct.map(p => ({
    name: p.name,
    category: p.category,
    paymentMethods: p.paymentMethods,
    sales: p.quantity,
    troco: p.troco,
    taxa: p.taxa,
    revenue: p.total
  })) || [];

  return (
    <div className="p-4 sm:p-8 space-y-8 bg-gray-50/30 min-h-screen print:p-0 print:bg-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Análise de Vendas</h2>
          <p className="text-gray-500 font-medium">Relatórios detalhados do seu restaurante</p>
        </div>
      </div>
      <div className="space-y-8">
        <div className="flex justify-end print:hidden">
          <Button onClick={handleExportPDF} variant="outline" className="flex items-center gap-2">
            <FileDown className="w-4 h-4" />
            Exportar PDF
          </Button>
        </div>

        <ReportFilters filters={filters} setFilters={setFilters} menuItems={menuItems} />

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500 animate-pulse">Carregando dados do relatório...</p>
          </div>
        ) : (
          <Tabs defaultValue="geral" className="w-full">
            <TabsList className="mb-6 bg-white border border-gray-100 p-1 h-12 shadow-sm rounded-xl print:hidden">
              <TabsTrigger value="geral" className="gap-2 px-6 h-10 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 rounded-lg transition-all duration-200">
                <LayoutDashboard className="w-4 h-4" />
                Geral
              </TabsTrigger>
              <TabsTrigger value="produtos" className="gap-2 px-6 h-10 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 rounded-lg transition-all duration-200">
                <Utensils className="w-4 h-4" />
                Produtos
              </TabsTrigger>
              <TabsTrigger value="pedidos" className="gap-2 px-6 h-10 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 rounded-lg transition-all duration-200">
                <ClipboardList className="w-4 h-4" />
                Pedidos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="geral" className="space-y-8">
              <KPIStats kpis={dynamicKpis as any} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <RevenueChart data={dynamicRevenue} />
                </div>

                <div className="lg:col-span-1">
                  <DistributionChart data={dynamicDistribution} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="produtos">
              <TopItemsTable items={dynamicTopItems} />
            </TabsContent>

            <TabsContent value="pedidos">
              <OrderHistoryTable data={report?.ordersByDay || []} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
