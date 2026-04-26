"use client";

import React from "react";
import { OrderRequestDTO } from "@/app/actions/order-actions";
import { MenuItem } from "@/app/actions/menu-item-actions";
import { Category } from "@/app/actions/category-actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../molecules/dialog";
import { Order } from "@/lib/entities/order";
import { NewOrderForm } from "./new-order-form";

interface EditOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onUpdateOrder: (updatedOrder: OrderRequestDTO) => void;
  menuItems: MenuItem[];
  categories: Category[];
}

export function EditOrderModal({
  isOpen,
  onClose,
  order,
  onUpdateOrder,
  menuItems,
  categories
}: EditOrderModalProps) {

  if (!order) return null;

  // Mapeia o objeto Order (Entity) para o formato esperado pelo Form (DTO)
  const initialData: OrderRequestDTO = {
    id: order.id,
    type: order.type,
    detail: (order as any).tableNumber || (order as any).customerName || (order as any).address || "",
    estimatedTime: order.estimatedTime,
    orderLines: order.orderLines,
    total: order.total,
    status: order.status
  };

  const handleUpdate = (data: OrderRequestDTO) => {
    onUpdateOrder(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Pedido {order.code}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <NewOrderForm
            menuItems={menuItems}
            categories={categories}
            initialData={initialData}
            onSubmit={handleUpdate}
            onCancel={onClose}
            isEdit={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
