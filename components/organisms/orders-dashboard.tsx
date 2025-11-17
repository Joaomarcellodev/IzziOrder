"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "../atoms/button";
import { Order } from "@/app/actions/orders";
import { NewOrderModal } from "../molecules/new-order-modals";
import { MenuItem } from "@/app/actions/menuItem";
import { Category } from "@/app/actions/category";
import { Eye, Pencil, Trash2 } from "lucide-react";

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
      items: newOrderData.items ?? [],
    };

    setOrders((prev) => [newOrder, ...prev]);
    closeNewOrderModal();

    toast.success(`Novo Pedido Adicionado`, {
      description: `O pedido ${newOrder.code} foi criado com sucesso.`,
    });
  };

  const handleViewOrder = (order: Order) => {
    toast(`Visualizando pedido ${order.code}`);
  };

  const handleEditOrder = (order: Order) => {
    toast(`Editando pedido ${order.code}`);
  };

  const handleDeleteOrder = (orderId: string) => {
    const deletedOrder = orders.find((o) => o.id === orderId);

    setOrders((prev) => prev.filter((o) => o.id !== orderId));

    toast.error("Pedido removido", {
      description: `O pedido ${deletedOrder?.code} foi excluído com sucesso.`,
    });
  };

  // Função para calcular o total e garantir segurança
  const getSafeItems = (items: any[]) => (Array.isArray(items) ? items : []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Pedidos</h1>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={openNewOrderModal}
        >
          Novo Pedido
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ABERTOS */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-lg font-medium mb-3">Abertos</h2>

          {orders
            .filter((o) => o.status === "OPEN")
            .map((o) => {
              const items = getSafeItems(o.items);
              const total = items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
              );

              return (
                <div key={o.id} className="p-3 border rounded-lg mb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="font-semibold">{o.code}</span>
                      <p className="text-sm text-gray-700 font-medium">
                        {o.customerName}
                      </p>

                      {/* 🔥 Lista de itens detalhada */}
                      <div className="text-xs text-gray-600 mt-2 space-y-1">
                        {items.map((i) => {
                          const subtotal = i.price * i.quantity;
                          return (
                            <div
                              key={i.menuItemId}
                              className="flex justify-between"
                            >
                              <span>
                                {i.quantity}x {i.name} — R$ {i.price.toFixed(2)}
                              </span>

                              <span className="font-medium">
                                R$ {subtotal.toFixed(2)}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <p className="font-semibold text-gray-700 mt-2">
                        Total: R$ {total.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewOrder(o)}
                        className="text-blue-600 hover:bg-blue-100"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditOrder(o)}
                        className="text-yellow-600 hover:bg-yellow-100"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteOrder(o.id)}
                        className="text-red-600 hover:bg-red-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {/* FINALIZADOS */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-lg font-medium mb-3">Finalizados</h2>

          {orders
            .filter((o) => o.status === "CLOSED")
            .map((o) => {
              const items = getSafeItems(o.items);
              const total = items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
              );

              return (
                <div key={o.id} className="p-3 border rounded-lg mb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="font-semibold">{o.code}</span>
                      <p className="text-sm text-gray-700 font-medium">
                        {o.customerName}
                      </p>

                      {/* 🔥 Lista de itens detalhada */}
                      <div className="text-xs text-gray-600 mt-2 space-y-1">
                        {items.map((i) => {
                          const subtotal = i.price * i.quantity;
                          return (
                            <div
                              key={i.menuItemId}
                              className="flex justify-between"
                            >
                              <span>
                                {i.quantity}x {i.name} — R$ {i.price.toFixed(2)}
                              </span>

                              <span className="font-medium">
                                R$ {subtotal.toFixed(2)}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <p className="font-semibold text-gray-700 mt-2">
                        Total: R$ {total.toFixed(2)}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewOrder(o)}
                      className="text-blue-600 hover:bg-blue-100"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

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
