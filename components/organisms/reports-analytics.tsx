"use client";

import { useState } from "react";
import { DollarSign, ShoppingBag, Users, Clock, FileDown, LayoutDashboard, Utensils, ClipboardList, Filter, ChevronDown, Coins } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/molecules/tabs";
import { Button } from "@/components/atoms/button";
import { Collapsible, CollapsibleContent } from "@/components/atoms/collapsible";

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
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const handleExportPDF = () => {
    window.print();
  };

  const dynamicKpis = report ? [
    {
      title: "Total de Vendas",
      value: `R$ ${report.generalTotalSales.toFixed(2)}`,
      trend: 0,
      icon: DollarSign,
      borderColor: COLORS.primary
    },
    {
      title: "Total de Troco",
      value: `R$ ${report.totalChange.toFixed(2)}`,
      trend: 0,
      icon: Coins,
      borderColor: "#f59e0b"
    },
    {
      title: "Total de Pedidos",
      value: `${report.salesByDay.length > 0 ? report.salesByDay.reduce((acc, d) => acc + (d as any).count || 0, 0) : '0'}`,
      trend: 0,
      icon: ShoppingBag,
      borderColor: COLORS.success
    },
    {
      title: "Ticket Médio",
      value: `R$ ${(() => {
        const totalOrders = report.salesByDay.reduce((acc, day) => acc + day.count, 0);
        return totalOrders > 0
          ? (report.generalTotalSales / totalOrders).toFixed(2)
          : '0.00';
      })()}`,
      trend: 0,
      icon: Users,
      borderColor: COLORS.danger
    },
    // TODO: Readicionar quando DELIVERY for implementado:
    // {
    //   title: "Taxa de Entrega",
    //   value: `R$ ${report.deliveryFeeTotal.toFixed(2)}`,
    //   trend: 0,
    //   icon: ShoppingBag,
    //   borderColor: COLORS.secondary
    // },
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
        <Tabs defaultValue="geral" className="w-full">
          <div className="flex flex-col flex-row md:items-center justify-between gap-4 mb-6 print:hidden">
            <TabsList className="bg-white border border-gray-100 p-1 h-12 shadow-sm rounded-xl flex-shrink-0">
              <TabsTrigger value="geral" className="group gap-2 px-3 h-10 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 rounded-lg transition-all duration-200">
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden md:block group-data-[state=active]:block">Geral</span>
              </TabsTrigger>
              <TabsTrigger value="produtos" className="group gap-2 px-3 h-10 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 rounded-lg transition-all duration-200">
                <Utensils className="w-4 h-4" />
                <span className="hidden md:block group-data-[state=active]:block">Produtos</span>
              </TabsTrigger>
              <TabsTrigger value="pedidos" className="group gap-2 px-3 h-10 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 rounded-lg transition-all duration-200">
                <ClipboardList className="w-4 h-4" />
                <span className="hidden md:block group-data-[state=active]:block">Pedidos</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2 self-end md:self-auto">
              <Button
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                variant="outline"
                className="flex items-center gap-2 h-12 px-4 shadow-sm border-gray-100 rounded-xl bg-white hover:bg-gray-50 transition-all duration-200"
              >
                <Filter className="w-4 h-4" />
                <span className="hidden md:block">Filtrar</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${isFiltersOpen ? "rotate-180" : ""}`}
                />
              </Button>
              <Button
                onClick={handleExportPDF}
                variant="outline"
                className="flex items-center gap-2 h-12 px-4 shadow-sm border-gray-100 rounded-xl bg-white hover:bg-gray-50"
              >
                <FileDown className="w-4 h-4" />
                <span className="hidden md:block">Exportar PDF</span>
              </Button>
            </div>
          </div>

          <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden">
              <div className="pb-8">
                <ReportFilters filters={filters} setFilters={setFilters} menuItems={menuItems} />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500 animate-pulse">Carregando dados do relatório...</p>
            </div>
          ) : (
            <>
              <TabsContent value="geral" className="space-y-8 outline-none">
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

              <TabsContent value="produtos" className="outline-none">
                <TopItemsTable items={dynamicTopItems} />
              </TabsContent>

              <TabsContent value="pedidos" className="outline-none">
                <OrderHistoryTable data={report?.ordersByDay || []} />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
}
