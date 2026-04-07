"use client";

import type React from "react";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/molecules/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/organisms/select";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface KPIData {
  title: string;
  value: string;
  trend: number;
  icon: React.ElementType;
  borderColor: string;
}

const kpiData: KPIData[] = [
  {
    title: "Receita Diária",
    value: "R$ 2,847.50",
    trend: 12.5,
    icon: DollarSign,
    borderColor: "#007BFF",
  },
  {
    title: "Pedidos hoje",
    value: "47",
    trend: 8.2,
    icon: ShoppingBag,
    borderColor: "#FD7E14",
  },
  {
    title: "Tabelas Ativas",
    value: "12/16",
    trend: -5.1,
    icon: Users,
    borderColor: "#28A745",
  },
  {
    title: "Tempo médio do pedido",
    value: "18 min",
    trend: -3.2,
    icon: Clock,
    borderColor: "#DC3545",
  },
];

const revenueData = [
  { name: "Seg", revenue: 2400, orders: 24 },
  { name: "Terç", revenue: 1398, orders: 18 },
  { name: "Quart", revenue: 9800, orders: 45 },
  { name: "Quin", revenue: 3908, orders: 32 },
  { name: "Sex", revenue: 4800, orders: 38 },
  { name: "Sab", revenue: 3800, orders: 41 },
  { name: "Dom", revenue: 4300, orders: 35 },
];

const topItemsData = [
  { name: "izziBurger Duplo", sales: 45, revenue: 1912.5 },
  { name: "Pizza Margherita", sales: 32, revenue: 1216.0 },
  { name: "Salada Caesar", sales: 28, revenue: 784.0 },
  { name: "Batata Frita", sales: 52, revenue: 780.0 },
  { name: "Coca-Cola", sales: 67, revenue: 536.0 },
];

const orderDistributionData = [
  { name: "Local", value: 45, color: "#007BFF" }, 
  { name: "Delivery", value: 35, color: "#FD7E14" }, 
  { name: "Retirada", value: 20, color: "#28A745" }, 
];

const hourlyOrdersData = [
  { hour: "09:00", orders: 5 },
  { hour: "10:00", orders: 8 },
  { hour: "11:00", orders: 12 },
  { hour: "12:00", orders: 25 },
  { hour: "13:00", orders: 32 },
  { hour: "14:00", orders: 28 },
  { hour: "15:00", orders: 15 },
  { hour: "16:00", orders: 10 },
  { hour: "17:00", orders: 8 },
  { hour: "18:00", orders: 18 },
  { hour: "19:00", orders: 35 },
  { hour: "20:00", orders: 42 },
  { hour: "21:00", orders: 38 },
  { hour: "22:00", orders: 22 },
];

export function ReportsAnalytics() {
  const [timeRange, setTimeRange] = useState("today");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Painel de Analíses
          </h2>
          <p className="text-gray-600">
            Acompanhe o desempenho e os insights do seu restaurante
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Hoje</SelectItem>
            <SelectItem value="week">semana</SelectItem>
            <SelectItem value="month">Mês</SelectItem>
            <SelectItem value="year">Ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon;
          const isPositive = kpi.trend > 0;

          return (
            <Card key={index} className="relative overflow-hidden">
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: kpi.borderColor }}
              />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {kpi.title}
                  </CardTitle>
                  <Icon className="w-5 h-5 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-gray-900">
                    {kpi.value}
                  </div>
                  <div className="flex items-center gap-1">
                    {isPositive ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        isPositive ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {Math.abs(kpi.trend)}%
                    </span>
                    <span className="text-sm text-gray-500">
                      vs dia anterior
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Receita Semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`R$ ${value}`, "Revenue"]} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#007BFF"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderDistributionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => {
                    const numericValue = typeof value === "number" ? value : 0;

                    const total = orderDistributionData.reduce(
                      (sum, entry) => sum + entry.value,
                      0
                    );

                    const percent = total > 0 ? numericValue / total : 0;

                    return `${name} ${(percent * 100).toFixed(0)}%`;
                  }}
                >
                  {orderDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Itens mais vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topItemsData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip formatter={(value) => [value, "Sales"]} />
                <Bar dataKey="sales" fill="#FD7E14" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Hourly Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos por hora</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyOrdersData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#28A745" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Desempenho dos principais itens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">
                    Item
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">
                    Vendas
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">
                    Receita
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">
                    Média Preço
                  </th>
                </tr>
              </thead>
              <tbody>
                {topItemsData.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{item.name}</td>
                    <td className="py-3 px-4 text-right">{item.sales}</td>
                    <td className="py-3 px-4 text-right">
                      R$ {item.revenue.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      R$ {(item.revenue / item.sales).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
