// constants.ts
import { DollarSign, ShoppingBag, Users, Clock } from "lucide-react";

export const revenueData = [
  { name: "Seg", revenue: 2400 },
  { name: "Terç", revenue: 1398 },
  { name: "Quart", revenue: 9800 },
  { name: "Quin", revenue: 3908 },
  { name: "Sex", revenue: 4800 },
  { name: "Sab", revenue: 3800 },
  { name: "Dom", revenue: 4300 },
];

export const topItemsData = [
  { name: "izziBurger Duplo", sales: 45, revenue: 1912.5 },
  { name: "Pizza Margherita", sales: 32, revenue: 1216.0 },
  { name: "Salada Caesar", sales: 28, revenue: 784.0 },
  { name: "Batata Frita", sales: 52, revenue: 780.0 },
  { name: "Coca-Cola", sales: 67, revenue: 536.0 },
];

export const kpiData = [
  { title: "Receita Diária", value: "R$ 2.847,50", trend: 12.5, icon: DollarSign, borderColor: "#007BFF" },
  { title: "Pedidos hoje", value: "47", trend: 8.2, icon: ShoppingBag, borderColor: "#FD7E14" },
  { title: "Tabelas Ativas", value: "12/16", trend: -5.1, icon: Users, borderColor: "#28A745" },
  { title: "Tempo médio", value: "18 min", trend: -3.2, icon: Clock, borderColor: "#DC3545" },
];

