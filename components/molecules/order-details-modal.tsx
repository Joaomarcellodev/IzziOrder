// components/molecules/order-details-modal.tsx
"use client";

import { Card, CardContent, CardHeader } from "@/components/molecules/card";
import { Button } from "@/components/atoms/button";
import { Clock, MapPin, Truck, X } from "lucide-react";
import { Order } from "@/app/actions/orders";

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetailsModal({ order, isOpen, onClose }: OrderDetailsModalProps) {
  if (!isOpen || !order) return null;

  const getSourceIcon = (type: Order["type"]) => {
    switch (type) {
      case "DELIVERY":
        return <Truck className="w-5 h-5 text-blue-600" />;
      case "LOCAL":
        return <MapPin className="w-5 h-5 text-green-600" />;
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto border-2 border-orange-300 shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">{order.code}</span>
            <span className="text-gray-600">- {order.customerName}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Informações da origem e tempo */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getSourceIcon(order.type)}
              <span className="text-sm font-medium capitalize">
                {order.type === "LOCAL" ? `Mesa ${order.tableNumber}` : order.type}
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Clock className="w-4 h-4" />
              <span>{order.estimatedTime}min</span>
            </div>
          </div>

          {/* Status do pedido */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium capitalize">
              {order.status}
            </span>
          </div>

          {/* Itens do pedido */}
          <div className="space-y-3">
            <h4 className="font-medium">Itens do Pedido:</h4>
            {order.orderLines.map((line, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-medium">
                      {line.quantity}x {line.name}
                    </span>
                    {line.notes && (
                      <div className="mt-2">
                        <span className="text-sm font-medium text-gray-600">
                          Observações:
                        </span>
                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded mt-1">
                          {line.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex justify-between items-center pt-4 border-t">
            <span className="font-semibold">Total:</span>
            <span className="font-bold text-lg">R$ {order.total.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}