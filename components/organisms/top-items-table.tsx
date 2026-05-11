"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/molecules/card";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  PIX: "Pix",
  CREDITO: "Crédito",
  DEBITO: "Débito",
  ESPECIE_SEM_TROCO: "Espécie",
  ESPECIE_COM_TROCO: "Espécie (com troco)",
};

function formatPaymentMethods(methods: string[] | undefined) {
  if (!methods || methods.length === 0) return "-";
  return methods
    .map((m) => PAYMENT_METHOD_LABELS[m] || m)
    .join(", ");
}

export function TopItemsTable({ items }: { items: any[] }) {
  return (
    <Card className="border-none shadow-sm ring-1 ring-gray-100">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Análise de Performance por Item</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-100">
                <th className="text-left py-4 px-2 font-semibold">Produto</th>
                <th className="text-left py-4 px-2 font-semibold">Categoria</th>
                <th className="text-left py-4 px-2 font-semibold">Forma de Pagamento</th>
                <th className="text-right py-4 px-2 font-semibold">Qtd. Vendas</th>
                <th className="text-right py-4 px-2 font-semibold">Troco</th>
                <th className="text-right py-4 px-2 font-semibold">Taxa</th>
                <th className="text-right py-4 px-2 font-semibold">Receita Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="py-4 px-2 font-bold text-gray-700">{item.name}</td>
                  <td className="py-4 px-2 text-left text-gray-500">{item.category || "-"}</td>
                  <td className="py-4 px-2 text-left text-gray-500">
                    {formatPaymentMethods(item.paymentMethods)}
                  </td>
                  <td className="py-4 px-2 text-right font-medium">{item.sales}</td>
                  <td className="py-4 px-2 text-right text-gray-500">R$ {item.troco?.toFixed(2) || "0.00"}</td>
                  <td className="py-4 px-2 text-right text-gray-500">R$ {item.taxa?.toFixed(2) || "0.00"}</td>
                  <td className="py-4 px-2 text-right font-bold text-blue-600">R$ {item.revenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}