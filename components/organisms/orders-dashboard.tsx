"use client";

import React, { useState } from "react";
import { Button } from "../atoms/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Order } from "@/lib/entities/order";

import { OrderColumn } from "./order-column";
import { NewOrderModal } from "../molecules/new-order-modal";
import { EditOrderModal } from "../molecules/edit-order-modal";
import { ViewOrderModal } from "../molecules/ViewOrderModal";

import {
  createOrder,
  deleteOrder,
  updateOrder,
  updateToClosedOrder,
  updateToOpenOrder,
  OrderRequestDTO,
} from "@/app/actions/order-actions";
import { MenuItem } from "@/app/actions/menu-item-actions";
import { Category } from "@/app/actions/category-actions";
import { OrderDTO } from "@/app/auth/orders/types";

interface OrdersDashboardProps {
  menuItems: MenuItem[];
  categories: Category[];
  orders: OrderDTO[];
}

export default function OrdersDashboard({
  menuItems,
  categories,
  orders: initialOrders,
}: OrdersDashboardProps) {
  const [orders, setOrders] = useState<OrderDTO[]>(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { toast } = useToast();

  const handleCreateOrder = async (newOrder: OrderRequestDTO) => {
    try {
      const data = await createOrder(newOrder);
      setOrders((prev) => [...prev, data]);
      toast({
        title: `Novo Pedido Adicionado`,
        description: `O pedido foi criado com sucesso.`,
      });
      setIsNewOrderModalOpen(false);
    } catch (error: any) {
      toast({
        title: "Erro ao criar o novo pedido:",
        description: error.message,
      });
    }
  };

  const handleUpdateOrder = async (updatedOrderData: OrderRequestDTO) => {
    try {
      const data = await updateOrder(updatedOrderData);
      setOrders((prev) => prev.map((o) => (o.id === data.id ? data : o)));
      const orderEntity = Order.fromDTO(data);
      toast({
        title: `Pedido ${orderEntity.code} Atualizado`,
        description: `O pedido foi salvo com sucesso.`,
      });
      setIsEditModalOpen(false);
      setSelectedOrder(null);
    } catch (error: any) {
      toast({ title: "Erro ao editar o pedido:", description: error.message });
    }
  };

  const handleFinishOrder = async (orderId: string) => {
    try {
      await updateToClosedOrder(orderId);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "CLOSED" } : o)),
      );
      toast({
        title: "Pedido Finalizado",
        description: "Movido para a lista de finalizados.",
      });
    } catch (error: any) {
      toast({ title: "Erro ao finalizar pedido", description: error.message });
    }
  };

  const handleReopenOrder = async (orderId: string) => {
    try {
      await updateToOpenOrder(orderId);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "OPEN" } : o)),
      );
      toast({
        title: "Pedido Reaberto",
        description: "Movido para a lista de abertos.",
      });
    } catch (error: any) {
      toast({ title: "Erro ao reabrir pedido", description: error.message });
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    const deletedOrder = orders.find((o) => o.id === orderId);
    try {
      await deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      toast({
        title: "Pedido removido",
        description: `O pedido ${deletedOrder?.code} foi excluído.`,
      });
    } catch (error: any) {
      toast({ title: "Erro ao remover pedido", description: error.message });
    }
  };

  const handleEditClick = (order: OrderDTO) => {
    setSelectedOrder(Order.fromDTO(order));
    setIsEditModalOpen(true);
  };

  return (
    <div className="p-6 space-y-8 bg-white min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-8 border-gray-100">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Gestão de Pedidos
          </h1>

          <p className="text-gray-500 font-medium flex items-center gap-2">
            Monitoramento em tempo real do seu estabelecimento
          </p>
        </div>

        <Button
          onClick={() => setIsNewOrderModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100 gap-2 h-12 px-8 text-base font-semibold transition-all hover:scale-[1.02] active:scale-95"
        >
          <Plus className="w-5 h-5 stroke-[3px]" />
          Novo Pedido
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-200px)]">
        <OrderColumn
          title="PEDIDOS ABERTOS"
          orders={orders}
          status="OPEN"
          onEdit={handleEditClick}
          onDelete={handleDeleteOrder}
          onFinish={handleFinishOrder}
        />
        <OrderColumn
          title="FINALIZADOS"
          orders={orders}
          status="CLOSED"
          onReopen={handleReopenOrder}
        />
      </div>

      <NewOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
        onAddOrder={handleCreateOrder}
        menuItems={menuItems}
        categories={categories}
      />

      {selectedOrder && (
        <EditOrderModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          onUpdateOrder={handleUpdateOrder}
          menuItems={menuItems}
          categories={categories}
        />
      )}
    </div>
  );
}
