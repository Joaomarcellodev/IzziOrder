"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/molecules/dialog";
import { MenuItem } from "@/app/actions/menu-item-actions";
import { Order, OrderRequestDTO } from "@/app/actions/order-actions";
import { NewOrderForm } from "./new-order-form";
import { Category } from "@/app/actions/category-actions";

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddOrder: (orderData: OrderRequestDTO) => void;
  menuItems: MenuItem[];
  categories: Category[];
}

export function NewOrderModal({
  isOpen,
  onClose,
  onAddOrder,
  menuItems,
  categories,
}: NewOrderModalProps) {
  const handleSubmit = (orderData: OrderRequestDTO) => {
    onAddOrder(orderData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle >Novo Pedido</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <NewOrderForm
            menuItems={menuItems}
            categories={categories}
            onSubmit={handleSubmit}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
