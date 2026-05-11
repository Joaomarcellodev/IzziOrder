"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/molecules/card";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronDown, ChevronRight, Package, Receipt, CreditCard, Truck } from "lucide-react";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/atoms/collapsible";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  PIX: "Pix",
  CREDITO: "Crédito",
  DEBITO: "Débito",
  ESPECIE_SEM_TROCO: "Espécie",
  ESPECIE_COM_TROCO: "Espécie (com troco)",
};

const ORDER_TYPE_LABELS: Record<string, string> = {
  LOCAL: "Local",
  DELIVERY: "Delivery",
  PICKUP: "Retirada",
};

interface OrderLine {
  name: string;
  quantity: number;
  price: number;
  observation?: string;
}

interface Order {
  id: string;
  daily_seq: number;
  date: string;
  total: number;
  type: string;
  payment_method: string;
  delivery_fee: number;
  change_value: number;
  order_lines: OrderLine[];
}

interface DayGroup {
  date: string;
  orders: Order[];
}

export function OrderHistoryTable({ data }: { data: DayGroup[] }) {
  const [expandedDays, setExpandedDays] = useState<string[]>([]);

  const toggleDay = (date: string) => {
    setExpandedDays((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
  };

  return (
    <Card className="border-none shadow-sm ring-1 ring-gray-100">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Histórico de Pedidos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((dayGroup) => (
            <div key={dayGroup.date} className="border border-gray-100 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleDay(dayGroup.date)}
                className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {expandedDays.includes(dayGroup.date) ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                  <span className="font-bold text-gray-700">
                    {format(parseISO(dayGroup.date), "eeee, dd 'de' MMMM", { locale: ptBR })}
                  </span>
                  <span className="text-sm text-gray-500 font-medium">
                    ({dayGroup.orders.length} pedidos)
                  </span>
                </div>
                <div className="text-blue-600 font-bold">
                  R$ {dayGroup.orders.reduce((acc, o) => acc + Number(o.total), 0).toFixed(2)}
                </div>
              </button>

              {expandedDays.includes(dayGroup.date) && (
                <div className="divide-y divide-gray-50">
                  {dayGroup.orders.map((order) => (
                    <div key={order.id} className="p-4 bg-white space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                            #{order.daily_seq}
                          </span>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Truck className="w-4 h-4" />
                            {ORDER_TYPE_LABELS[order.type]}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <CreditCard className="w-4 h-4" />
                            {PAYMENT_METHOD_LABELS[order.payment_method]}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-400">
                            {format(parseISO(order.date), "HH:mm")}
                          </div>
                          <div className="font-bold text-gray-900">
                            R$ {Number(order.total).toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <div className="pl-6 space-y-2">
                        {order.order_lines.map((line, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-gray-300" />
                              <span className="text-gray-700 font-medium">
                                {line.quantity}x {line.name}
                              </span>
                            </div>
                            <span className="text-gray-500">
                              R$ {(line.price * line.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                        {(Number(order.delivery_fee) > 0 || Number(order.change_value) > 0) && (
                          <div className="pt-2 border-t border-gray-50 text-xs text-gray-400 space-y-1">
                            {Number(order.delivery_fee) > 0 && (
                              <div className="flex justify-between">
                                <span>Taxa de Entrega:</span>
                                <span>R$ {Number(order.delivery_fee).toFixed(2)}</span>
                              </div>
                            )}
                            {Number(order.change_value) > 0 && (
                              <div className="flex justify-between">
                                <span>Troco para:</span>
                                <span>R$ {Number(order.change_value).toFixed(2)}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
