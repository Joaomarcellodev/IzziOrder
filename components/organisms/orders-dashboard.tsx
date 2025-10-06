"use client";

import { cn } from "@/lib/utils";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/molecules/card";
import { Button } from "@/components/atoms/button";
import { Clock, MapPin, Eye, Truck } from "lucide-react";
import { Order } from "@/app/actions/orders";

const columns = [
  { id: "Novo", title: "Novo Pedido", status: "PENDING" as const },
  { id: "Confirmado", title: "Confirmado", status: "CONFIRMED" as const },
  { id: "Preparando", title: "Preparando", status: "Preparando" as const },
  { id: "Pronto", title: "Pronto", status: "Pronto" as const },
];

interface OrdersDashboardProps {
  orders: Order[];
}

export function OrdersDashboard({ orders: initialOrders }: OrdersDashboardProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [draggedOrder, setDraggedOrder] = useState<string | null>(null);

  const getOrdersByStatus = (status: Order["status"]) => {
    return orders.filter((order) => order.status === status);
  };

  const confirmOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: "CONFIRMED" } : order
      )
    );
  };

  const getSourceIcon = (source: Order["type"]) => {
    switch (source) {
      case "DELIVERY":
        return <Truck className="w-5 h-5 text-blue-600" />;
      case "LOCAL":
        return <MapPin className="w-5 h-5 text-green-600" />;
    }
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column) => {
          const columnOrders = getOrdersByStatus(column.status);
          const hasNewOrders =
            column.status === "PENDING" && columnOrders.length > 0;

          return (
            <div key={column.id} className="space-y-4">
              {/* Column Header */}
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{column.title}</h3>
                <div
                  className={cn(
                    "flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium",
                    hasNewOrders
                      ? "text-white animate-pulse"
                      : "bg-gray-200 text-gray-600"
                  )}
                  style={hasNewOrders ? { backgroundColor: "#FD7E14" } : {}}
                >
                  {columnOrders.length}
                </div>
              </div>

              {/* Order Cards */}
              <div className="space-y-3">
                {columnOrders.map((order) => (
                  <Card
                    key={order.id}
                    className="hover:shadow-md transition-all duration-200 cursor-pointer hover:-translate-y-0.5"
                    draggable
                    onDragStart={() => setDraggedOrder(order.id)}
                    onDragEnd={() => setDraggedOrder(null)}
                    style={{ opacity: draggedOrder === order.id ? 0.8 : 1 }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">
                            {order.code!}
                          </span>
                          <span className="text-gray-600">
                            - Nome do cliente
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getSourceIcon(order.type)}
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="w-4 h-4" />
                            <span
                              className={cn(
                                order.estimated_time ?? 0 > 10
                                  ? "text-red-600"
                                  : "text-gray-500"
                              )}
                            >
                              {order.estimated_time}min
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {/* Items */}
                      <div className="space-y-1">
                        {order.order_lines.map((line, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-sm"
                          >
                            <span>
                              {line.quantity}x {line.name}
                            </span>
                            {line.notes && (
                              <div title={line.notes}>
                                <Eye className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="font-semibold text-lg">
                          R$ {order.total.toFixed(2)}
                        </div>
                        <div className="flex items-center gap-1">
                          {order.type === "DELIVERY" ? (
                            <Truck className="w-4 h-4 text-blue-600" />
                          ) : (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-gray-600">
                                numero da mesa
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Button for New Orders */}
                      {order.status === "PENDING" && (
                        <Button
                          className="w-full font-semibold text-white"
                          style={{ backgroundColor: "#FD7E14" }}
                          onClick={() => confirmOrder(order.id)}
                        >
                          Confirmar Pedido
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Empty State */}
              {columnOrders.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-sm">Nenhum Pedido</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
