"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "../atoms/button";
import { Order } from "@/app/actions/orders";
import { NewOrderModal } from "../molecules/new-order-modals";
import { MenuItem } from "@/app/actions/menuItem";
import { Category } from "@/app/actions/category";

interface OrdersDashboardProps {
  menuItems: MenuItem[];
  categories: Category[];
  orders: Order[];
}

export default function OrdersDashboard({
  menuItems,
  categories,
  orders: initialOrders,
}: OrdersDashboardProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);

  const openNewOrderModal = () => setIsNewOrderModalOpen(true);
  const closeNewOrderModal = () => setIsNewOrderModalOpen(false);

  const handleAddNewOrder = (
    newOrderData: Omit<Order, "id" | "code" | "status">
  ) => {
    const newOrder: Order = {
      ...newOrderData,
      status: "OPEN",
      id: Math.random().toString(36).substring(2, 9),
      code: `#${(orders.length + 1).toString().padStart(3, "0")}`,
    };

    setOrders((prev) => [newOrder, ...prev]);
    closeNewOrderModal();

    toast(`Novo Pedido Adicionado`, {
      description: `O pedido ${newOrder.code} foi criado com sucesso.`,
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Pedidos</h1>
        <Button onClick={openNewOrderModal}>Novo Pedido</Button>
      </div>

      {/* COLUNAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* ABERTOS */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-lg font-medium mb-3">Abertos</h2>
          {orders
            .filter((o) => o.status === "OPEN")
            .map((o) => (
              <div
                key={o.id}
                className="p-3 border rounded-lg mb-2 flex justify-between"
              >
                <span>{o.code}</span>
                <span>{o.customerName}</span>
              </div>
            ))}
        </div>

        {/* FINALIZADOS */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-lg font-medium mb-3">Finalizados</h2>
          {orders
            .filter((o) => o.status === "CLOSED")
            .map((o) => (
              <div
                key={o.id}
                className="p-3 border rounded-lg mb-2 flex justify-between"
              >
                <span>{o.code}</span>
                <span>{o.customerName}</span>
              </div>
            ))}
        </div>
      </div>

      {/* MODAL */}
      <NewOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={closeNewOrderModal}
        onAddOrder={handleAddNewOrder}
        menuItems={menuItems}
        categories={categories}
      />
    </div>
  );
}
