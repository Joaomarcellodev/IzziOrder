"use client";

import { PaymentMethod, OrderType } from "@/lib/entities/order";
import { SalesReportFilters } from "@/lib/entities/report";
import { format, parseISO, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Label } from "@/components/atoms/label";
import { Input } from "@/components/atoms/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/organisms/select";
import { MonthYearPicker } from "./month-year-picker";

interface ReportFiltersProps {
  filters: SalesReportFilters;
  setFilters: (filters: SalesReportFilters) => void;
  menuItems: any[];
}

export function ReportFilters({ filters, setFilters, menuItems }: ReportFiltersProps) {
  const handleMonthYearChange = (month?: number, year?: number) => {
    const newFilters = { ...filters, month, year };

    if (year) {
      const now = new Date();
      if (month) {
        const baseDate = new Date(year, month - 1, 1);
        newFilters.startDate = startOfMonth(baseDate).toISOString();
        const end = endOfMonth(baseDate);
        newFilters.endDate = (end > now ? now : end).toISOString();
      } else {
        const baseDate = new Date(year, 0, 1);
        newFilters.startDate = startOfYear(baseDate).toISOString();
        const end = endOfYear(baseDate);
        newFilters.endDate = (end > now ? now : end).toISOString();
      }
    }

    setFilters(newFilters);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2024 + 1 }, (_, i) => 2024 + i).reverse();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100 print:hidden">
      <div className="col-span-2 space-y-2 border border-border rounded-lg p-4">
        <Label>Filtrar por datas:</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Início</Label>
            <Input
              type="date"
              max={filters.endDate ? format(parseISO(filters.endDate), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")}
              value={filters.startDate ? format(parseISO(filters.startDate), "yyyy-MM-dd") : ""}
              onChange={(e) => setFilters({
                ...filters,
                startDate: e.target.value ? parseISO(e.target.value).toISOString() : undefined,
                month: undefined,
                year: undefined
              })}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Fim</Label>
            <Input
              type="date"
              min={filters.startDate ? format(parseISO(filters.startDate), "yyyy-MM-dd") : undefined}
              max={format(new Date(), "yyyy-MM-dd")}
              value={filters.endDate ? format(parseISO(filters.endDate), "yyyy-MM-dd") : ""}
              onChange={(e) => setFilters({
                ...filters,
                endDate: e.target.value ? parseISO(e.target.value).toISOString() : undefined,
                month: undefined,
                year: undefined
              })}
            />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Filtrar por mês:</Label>
        <MonthYearPicker
          month={filters.month}
          year={filters.year}
          onChange={handleMonthYearChange}
        />
      </div>
      <div className="space-y-2">
        <Label>Filtrar por ano:</Label>
        <Select
          value={filters.year?.toString() || "all"}
          onValueChange={(v) => {
            const y = v === "all" ? undefined : parseInt(v);
            handleMonthYearChange(undefined, y);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {years.map(y => (
              <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Pagamento</Label>
        <Select
          value={filters.paymentMethod || "all"}
          onValueChange={(v) => setFilters({ ...filters, paymentMethod: v === "all" ? undefined : v as PaymentMethod })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="PIX">PIX</SelectItem>
            <SelectItem value="CREDITO">Crédito</SelectItem>
            <SelectItem value="DEBITO">Débito</SelectItem>
            <SelectItem value="ESPECIE_SEM_TROCO">Espécie</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Tipo de Entrega</Label>
        <Select
          value={filters.type || "all"}
          onValueChange={(v) => setFilters({ ...filters, type: v === "all" ? undefined : v as OrderType })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="LOCAL">Local</SelectItem>
            {/*
              TODO: readicionar quando DELIVERY for inplementado:
              <SelectItem value="DELIVERY">Delivery</SelectItem>
            */}
            <SelectItem value="PICKUP">Retirada</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Produto</Label>
        <Select
          value={filters.productId || "all"}
          onValueChange={(v) => setFilters({ ...filters, productId: v === "all" ? undefined : v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {menuItems.map(item => (
              <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
