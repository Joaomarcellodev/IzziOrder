"use client";

import { useState } from "react";
import { DollarSign, ShoppingBag, Users, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/organisms/select";

import { KPIStats } from "./kpi-stats";
import { RevenueChart } from "./revenue-chart";
import { TopItemsTable } from "./top-items-table";
import { DistributionChart } from "./distribution-chart"; 

import { 
  kpiData, 
  revenueData, 
  topItemsData, 
  orderDistributionData 
} from "@/app/auth/reports/constants";

export function ReportsAnalytics() {
  const [timeRange, setTimeRange] = useState("today");

  return (
    <div className="p-4 sm:p-8 space-y-8 bg-gray-50/30 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Análise de Vendas</h2>
          <p className="text-gray-500 font-medium">Relatórios detalhados do seu restaurante</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-full sm:w-48 bg-white shadow-sm border-gray-200 h-11">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Hoje</SelectItem>
            <SelectItem value="week">Esta Semana</SelectItem>
            <SelectItem value="month">Este Mês</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <KPIStats kpis={kpiData} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RevenueChart data={revenueData} />
        </div>

        <div className="lg:col-span-1">
          <DistributionChart data={orderDistributionData} />
        </div>
      </div>

      <TopItemsTable items={topItemsData} />
    </div>
  );
}