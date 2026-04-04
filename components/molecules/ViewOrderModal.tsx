// File: components/molecules/ViewOrderModal.tsx

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../molecules/dialog";
import { Button } from "../atoms/button";
import { Order, LocalOrder, PickupOrder, DeliveryOrder } from "@/lib/entities/order";

interface ViewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
}

export function ViewOrderModal({ isOpen, onClose, order }: ViewOrderModalProps) {
  const items = order.orderLines || [];
  const total = order.total;

  const renderDetails = () => {
    if (order.type === "LOCAL") {
      const local = order as LocalOrder;
      return (
        <p className="text-sm text-gray-600">
          Mesa: <span className="font-medium">{local.tableNumber}</span>
        </p>
      );
    } else if (order.type === "PICKUP") {
      const pickup = order as PickupOrder;
      return (
        <p className="text-sm text-gray-600">
          Cliente: <span className="font-medium">{pickup.customerName}</span>
        </p>
      );
    } else if (order.type === "DELIVERY") {
      const delivery = order as DeliveryOrder;
      return (
        <>
          <p className="text-sm text-gray-600">
            Endereço: <span className="font-medium">{delivery.address}</span>
          </p>
          <p className="text-sm text-gray-600">
            Taxa de Entrega: <span className="font-medium">R$ {delivery.deliveryFee.toFixed(2)}</span>
          </p>
        </>
      );
    }
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Pedido {order.code}</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              Tipo: <span className="font-medium">{order.type}</span>
            </p>
            {renderDetails()}
            <p className="text-sm text-gray-600">
              Status: <span className="font-medium text-blue-600">{order.status}</span>
            </p>
          </div>

          {/* Lista de Itens */}
          <div className="border p-3 rounded-lg space-y-2">
            <h3 className="font-semibold mb-2">Itens:</h3>
            {items.map((item) => {
              const subtotal = item.price * item.quantity;
              return (
                <div key={item.id || item.menuItemId} className="flex flex-col text-sm border-b last:border-0 pb-2 last:pb-0">
                  <div className="flex justify-between">
                    <span>{item.quantity}x {item.name}</span>
                    <span className="font-medium">R$ {subtotal.toFixed(2)}</span>
                  </div>
                  {item.observation && (
                    <p className="text-xs text-gray-500 italic mt-1">Obs: {item.observation}</p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-2 border-t mt-4">
            <span className="font-bold text-lg">Total:</span>
            <span className="font-bold text-lg">R$ {total.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}