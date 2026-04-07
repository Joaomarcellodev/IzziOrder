"use client";

import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/molecules/card";

interface KPIProps {
  title: string;
  value: string;
  trend: number;
  icon: LucideIcon;
  borderColor: string;
}

export function KPIStats({ kpis }: { kpis: KPIProps[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        const isPositive = kpi.trend > 0;

        return (
          <Card key={index} className="relative overflow-hidden border-none shadow-sm ring-1 ring-gray-100">
            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: kpi.borderColor }} />
            <CardHeader className="pb-2 space-y-0 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-gray-500">
                {kpi.title}
              </CardTitle>
              <Icon className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
              <div className="flex items-center gap-1 mt-1">
                {isPositive ? (
                  <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-red-600" />
                )}
                <span className={`text-xs font-bold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                  {Math.abs(kpi.trend)}%
                </span>
                <span className="text-[10px] text-gray-400 font-medium ml-1">vs anterior</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}