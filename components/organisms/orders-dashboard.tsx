"use client";

import React, { useState } from "react";
import { Button } from "../atoms/button";
import { createOrder, deleteOrder, Order, OrderRequestDTO } from "@/app/actions/order-actions";
import { NewOrderModal } from "../molecules/new-order-modals";
import { MenuItem } from "@/app/actions/menu-item-actions";
import { Category } from "@/app/actions/category-actions";
import { Pencil, Trash2 } from "lucide-react";
import { EditOrderModal } from "../molecules/edit-order-modal";
import { ViewOrderModal } from "../molecules/ViewOrderModal";
import { useToast } from "@/hooks/use-toast";


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

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { toast } = useToast();

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedOrder(null);
  };

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedOrder(null);
  };

  const handleAddNewOrder = async (
    newOrder: OrderRequestDTO
  ) => {
    const { success, error, data } = await createOrder(newOrder);

    if (success && data) {
      setOrders((prev) => [...prev, data]);
      toast({
        title: `Novo Pedido Adicionado`,
        description: `O pedido foi criado com sucesso.`,
      });
    } else {
      toast({
        title: "Erro ao criar o novo pedido:",
        description: error,
      });
    }

    closeNewOrderModal();
  };

  const handleUpdateOrder = (updatedOrder: Order) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
    );
    handleCloseEditModal();

    toast({
      title: `Pedido ${updatedOrder.code} Atualizado`,
      description: `O pedido foi salvo com sucesso.`,
    });
  };

  // 2. Nova função para finalizar o pedido
  const handleFinishOrder = (orderId: string) => {
    const finishedOrder = orders.find((o) => o.id === orderId);

    if (!finishedOrder) return;

    const updatedOrder: Order = {
      ...finishedOrder,
      status: "CLOSED", // Altera o status para FECHADO
    };

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? updatedOrder : o))
    );

    toast({
      title: `Pedido ${finishedOrder.code} Finalizado`,
      description: `O pedido foi movido para a lista de finalizados.`,
    });
  };

  const handleDeleteOrder = async (orderId: string) => {
    const deletedOrder = orders.find((o) => o.id === orderId);

    const { success, error } = await deleteOrder(orderId);

    if (!success) {
      toast({
        title: "Erro ao remover pedido",
        description: error,
      });
      return;
    }

    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    toast({
      title: "Pedido removido",
      description: `O pedido ${deletedOrder?.code} foi excluído com sucesso.`,
    });
  };

  const getSafeItems = (items: any[]) => (Array.isArray(items) ? items : []);

  // Função para formatar o tipo de pedido
  const formatOrderType = (type: "LOCAL" | "DELIVERY" | "PICKUP", tableNumber?: number) => {
    if (type === "LOCAL") {
      return tableNumber ? `Mesa: ${tableNumber}` : 'Local';
    }
    return 'Retirada';
  }


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
              const items = getSafeItems(o.orderLines);
              const total = items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
              );

              function renderTypeAndDetails(o: Order): React.ReactNode {
                if (o.type == "LOCAL") {
                  return (
                    <>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Tipo: <span className="font-medium">LOCAL</span>
                      </p>
                      <p className="text-sm text-gray-700 font-medium">
                        Mesa: {o.tableNumber}
                      </p>
                    </>);
                } else if (o.type == "PICKUP") {
                  return (
                    <>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Tipo: <span className="font-medium">RETIRADA</span>
                      </p>
                      <p className="text-sm text-gray-700 font-medium">
                        Cliente: {o.customerName}
                      </p>
                    </>);
                }
              }

              return (
                <div key={o.id} className="p-3 border rounded-lg mb-2">
                  <div className="flex flex-col">

                    <div className="flex flex-col w-full">
                      <span className="font-semibold">{o.code}</span>
                      {renderTypeAndDetails(o)}

                      {/* Itens do Pedido ABERTO - Detalhado */}
                      <div className="text-xs text-gray-600 mt-2 space-y-1">
                        {items.map((i) => {
                          const subtotal = i.price * i.quantity;
                          return (
                            <div
                              key={o.id + i.id}
                              className="flex justify-between"
                            >
                              <span>
                                {i.quantity}x {i.name} — R$ {i.price.toFixed(2)}
                                {i.observation && (<p>

                                  OBS: {i.observation}
                                </p>)}
                              </span>

                              <span className="font-medium">
                                R$ {subtotal.toFixed(2)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <div
                        className="flex justify-between"
                      >
                        <p className="font-semibold text-gray-700 mt-2">
                          Total:
                        </p>
                        <p className="font-semibold text-gray-700 mt-2">
                          R$ {total.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3 self-end">
                      {/* 3. Botão Finalizar Pedido */}
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleFinishOrder(o.id)}
                        className="bg-green-600 hover:bg-green-700 text-white h-8"
                      >
                        Finalizar
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditOrder(o)}
                        className="text-yellow-600 hover:bg-yellow-100 h-8 w-8 p-0"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteOrder(o.id)}
                        className="text-red-600 hover:bg-red-100 h-8 w-8 p-0"
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
              const items = getSafeItems(o.orderLines);
              const total = items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
              );

              const orderTypeDisplay = formatOrderType(o.type, o.tableNumber);

              return (
                <div key={o.id} className="p-3 border rounded-lg mb-2">
                  <div className="flex justify-between items-start">

                    <div className="flex flex-col">
                      <span className="font-semibold">{o.code}</span>
                      <p className="text-sm text-gray-700 font-medium">
                        Cliente: {o.customerName}
                      </p>

                      <p className="text-xs text-gray-500 mt-0.5">
                        Tipo: <span className="font-medium">{orderTypeDisplay}</span>
                      </p>

                      {/* Exibir Observações
                      {o.notes && (
                        <p className="text-xs text-orange-600 italic mt-1 p-1 bg-orange-50 rounded border border-orange-200">
                          Obs: {o.notes}
                        </p>
                      )} */}

                      {/* Itens do Pedido FINALIZADO - Detalhado */}
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

                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* --- Modais --- */}
      {/* Certifique-se de que os Modais estão prontos para receber e salvar 'notes' */}

      <NewOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={closeNewOrderModal}
        onAddOrder={handleAddNewOrder}
        menuItems={menuItems}
        categories={categories}
      />

      {
        selectedOrder && (
          <ViewOrderModal
            isOpen={isViewModalOpen}
            onClose={handleCloseViewModal}
            order={selectedOrder}
          />
        )
      }

      {
        selectedOrder && (
          <EditOrderModal
            isOpen={isEditModalOpen}
            onClose={handleCloseEditModal}
            order={selectedOrder}
            onUpdateOrder={handleUpdateOrder}
            menuItems={menuItems}
            categories={categories}
          />
        )
      }
    </div >
  );
}