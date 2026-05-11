"use client";

import { PaymentMethod, OrderType } from "@/lib/entities/order";
import { SalesReportFilters } from "@/app/actions/report-actions";
import { format, parseISO } from "date-fns";
import { Label } from "@/components/atoms/label";
import { Input } from "@/components/atoms/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/organisms/select";

interface ReportFiltersProps {
  filters: SalesReportFilters;
  setFilters: (filters: SalesReportFilters) => void;
  menuItems: any[];
}

export function ReportFilters({ filters, setFilters, menuItems }: ReportFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100 print:hidden">
      <div className="space-y-2">
        <Label>Início</Label>
        <Input
          type="date"
          value={filters.startDate ? format(parseISO(filters.startDate), "yyyy-MM-dd") : ""}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value ? parseISO(e.target.value).toISOString() : undefined })}
        />
      </div>
      <div className="space-y-2">
        <Label>Fim</Label>
        <Input
          type="date"
          value={filters.endDate ? format(parseISO(filters.endDate), "yyyy-MM-dd") : ""}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value ? parseISO(e.target.value).toISOString() : undefined })}
        />
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
            <SelectItem value="DELIVERY">Delivery</SelectItem>
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
      <div className="space-y-2">
        <Label>Mês</Label>
        <Select
          value={filters.month?.toString() || "all"}
          onValueChange={(v) => setFilters({ ...filters, month: v === "all" ? undefined : parseInt(v) })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Array.from({ length: 12 }, (_, i) => (
              <SelectItem key={i + 1} value={(i + 1).toString()}>
                {format(new Date(2024, i, 1), "MMMM")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Ano</Label>
        <Select
          value={filters.year?.toString() || "all"}
          onValueChange={(v) => setFilters({ ...filters, year: v === "all" ? undefined : parseInt(v) })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {[2024, 2025, 2026].map(year => (
              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
