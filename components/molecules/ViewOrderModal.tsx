// File: src/components/molecules/view-order-modal.tsx

import React from "react";
import { Order } from "@/app/actions/order-actions";
// Supondo que você tenha um componente de Modal base (ex: usando Shadcn)
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../molecules/dialog";
import { Button } from "../atoms/button";

interface ViewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
}

export function ViewOrderModal({ isOpen, onClose, order }: ViewOrderModalProps) {
  const items = Array.isArray(order.items) ? order.items : [];
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Pedido {order.code}</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <p className="text-sm text-gray-600">
            Cliente:<span className="font-medium">{order.customerName}</span>
          </p>

          <p className="text-sm text-gray-600">
            Status:<span className="font-medium text-blue-600">{order.status}</span>
          </p>

          {/* Lista de Itens */}
          <div className="border p-3 rounded-lg space-y-2">
            <h3 className="font-semibold mb-2">Itens:</h3>
            {items.map((item) => {
              const subtotal = item.price * item.quantity;
              return (
                <div key={item.menuItemId} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.name}</span>
                  <span className="font-medium">R$ {subtotal.toFixed(2)}</span>
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