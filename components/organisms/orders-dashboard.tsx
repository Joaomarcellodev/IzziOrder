"use client";

import React, { useState, useEffect } from "react";
import { Button } from "../atoms/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Order } from "@/lib/entities/order";
import { createClient } from "@/utils/supabase/client";

import { OrderColumn } from "./order-column";
import { NewOrderModal } from "../molecules/new-order-modal";
import { EditOrderModal } from "../molecules/edit-order-modal";
import { DeleteConfirmModal } from "../molecules/delete-confirm-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../molecules/tabs";

import {
  createOrder,
  deleteOrder,
  updateOrder,
  updateToClosedOrder,
  updateToOpenOrder,
  getOldPendingOrders,
  getOrderById,
  acceptOrder,
  rejectOrder,
  OrderRequestDTO,
} from "@/app/actions/order-actions";
import { MenuItem } from "@/app/actions/menu-item-actions";
import { Category } from "@/app/actions/category-actions";
import { OrderDTO } from "@/app/auth/orders/types";

interface OrdersDashboardProps {
  menuItems: MenuItem[];
  categories: Category[];
  orders: OrderDTO[];
  serverDate: string;
}

export default function OrdersDashboard({
  menuItems,
  categories,
  orders: initialOrders,
  serverDate,
}: OrdersDashboardProps) {
  const [orders, setOrders] = useState<OrderDTO[]>(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<OrderDTO | null>(null);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOldOrders = async () => {
      try {
        const oldOrders = await getOldPendingOrders("");
        if (oldOrders.length > 0) {
          setOrders((prev) => {
            const existingIds = prev.map(o => o.id);
            const newOldOrders = oldOrders.filter((o: any) => !existingIds.includes(o.id));
            return [...newOldOrders, ...prev];
          });
        }
      } catch (error) {
        console.error("Dashboard: Erro ao buscar pedidos antigos:", error);
      }
    };
    fetchOldOrders();

    const supabase = createClient();
    const channel = supabase
      .channel("public:orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        async (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            try {
              const newRecord = payload.new as any;
              // Verificar se o pedido pertence a este dashboard seria ideal (usando user.id), 
              // mas podemos apenas buscar o pedido e ver se ele vem (o RLS/Backend garante se for buscar).
              const updatedOrder = await getOrderById(newRecord.id);
              
              setOrders((prev) => {
                const exists = prev.find(o => o.id === updatedOrder.id);
                if (exists) {
                  return prev.map(o => o.id === updatedOrder.id ? updatedOrder : o);
                } else {
                  if (payload.eventType === "INSERT" && updatedOrder.status === "PENDING") {
                    toast({
                      title: "NOVO PEDIDO!",
                      description: `Pedido ${updatedOrder.code} aguardando aprovação.`,
                      variant: "default",
                      className: "bg-orange-500 text-white border-none"
                    });
                  }
                  return [...prev, updatedOrder];
                }
              });
            } catch (err) {
              console.error("Erro ao processar evento realtime:", err);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await acceptOrder(orderId);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "OPEN" } : o)),
      );
      toast({
        title: "Pedido Aceito",
        description: "O pedido já pode ser preparado.",
      });
    } catch (error: any) {
      toast({ title: "Erro ao aceitar pedido", description: error.message });
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
      await rejectOrder(orderId);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "REJECTED" } : o)),
      );
      toast({
        title: "Pedido Recusado",
        description: "O pedido foi marcado como recusado.",
      });
    } catch (error: any) {
      toast({ title: "Erro ao recusar pedido", description: error.message });
    }
  };

  const handleDeleteClick = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      setOrderToDelete(order);
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async (orderId: string) => {
    try {
      await deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      toast({
        title: "Pedido removido",
        description: `O pedido ${orderToDelete?.code} foi excluído.`,
      });
      setIsDeleteModalOpen(false);
      setOrderToDelete(null);
    } catch (error: any) {
      toast({ title: "Erro ao remover pedido", description: error.message });
      throw error;
    }
  };

  const handleEditClick = (order: OrderDTO) => {
    setSelectedOrder(Order.fromDTO(order));
    setIsEditModalOpen(true);
  };

  return (
    <div className="px-0 py-2 md:p-6 space-y-4 md:space-y-8 bg-white min-h-screen">
      {/* Header Compacto para Mobile / Normal para PC */}
      <div className="flex items-center justify-between gap-4 border-b pb-4 md:pb-8 border-gray-100 px-4 md:px-0">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Gestão de Pedidos
          </h1>
          <p className="text-gray-500 text-xs md:text-base font-medium hidden sm:block">
            Monitoramento em tempo real do seu estabelecimento
          </p>
        </div>

        <Button
          onClick={() => setIsNewOrderModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 gap-2 h-10 md:h-12 px-4 md:px-8 text-sm md:text-base font-semibold transition-all"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5 stroke-[3px]" />
          <span>Novo Pedido</span>
        </Button>
      </div>

      {/* Layout Mobile com Tabs */}
      <div className="lg:hidden">
        <Tabs defaultValue="PENDING" className="w-full px-0">
          <TabsList className="grid w-[calc(100%-2rem)] mx-auto grid-cols-3 mb-4 h-11 bg-gray-100 p-1 rounded-xl">
            <TabsTrigger 
              value="PENDING" 
              className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-orange-600"
            >
              Novos
            </TabsTrigger>
            <TabsTrigger 
              value="OPEN" 
              className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600"
            >
              Abertos
            </TabsTrigger>
            <TabsTrigger 
              value="CLOSED" 
              className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-green-600"
            >
              Prontos
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="PENDING" className="mt-0 outline-none px-2">
            <OrderColumn
              title="NOVOS PEDIDOS"
              orders={orders}
              status="PENDING"
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onAccept={handleAcceptOrder}
              onReject={handleRejectOrder}
              serverDate={serverDate}
            />
          </TabsContent>
          <TabsContent value="OPEN" className="mt-0 outline-none px-2">
            <OrderColumn
              title="EM PREPARO"
              orders={orders}
              status="OPEN"
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onFinish={handleFinishOrder}
              serverDate={serverDate}
            />
          </TabsContent>
          <TabsContent value="CLOSED" className="mt-0 outline-none px-2">
            <OrderColumn
              title="FINALIZADOS"
              orders={orders}
              status="CLOSED"
              onReopen={handleReopenOrder}
              serverDate={serverDate}
            />
          </TabsContent>
        </Tabs>
      </div>

      <div className="hidden lg:grid grid-cols-3 gap-6 h-[calc(100vh-200px)] px-4">
        <OrderColumn
          title="NOVOS PEDIDOS"
          orders={orders}
          status="PENDING"
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onAccept={handleAcceptOrder}
          onReject={handleRejectOrder}
          serverDate={serverDate}
        />
        <OrderColumn
          title="EM PREPARO"
          orders={orders}
          status="OPEN"
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onFinish={handleFinishOrder}
          serverDate={serverDate}
        />
        <OrderColumn
          title="FINALIZADOS"
          orders={orders}
          status="CLOSED"
          onReopen={handleReopenOrder}
          serverDate={serverDate}
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

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setOrderToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        order={orderToDelete}
      />
    </div>
  );
}
