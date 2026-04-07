"use client";

import React, { useState } from "react";
import { Button } from "../atoms/button";
import { createOrder, deleteOrder, OrderRequestDTO, updateOrder, updateToClosedOrder, updateToOpenOrder } from "@/app/actions/order-actions";
import { NewOrderModal } from "../molecules/new-order-modal";
import { MenuItem } from "@/app/actions/menu-item-actions";
import { Category } from "@/app/actions/category-actions";
import { Pencil, Trash2 } from "lucide-react";
import { EditOrderModal } from "../molecules/edit-order-modal";
import { ViewOrderModal } from "../molecules/ViewOrderModal";
import { useToast } from "@/hooks/use-toast";
import { Order, LocalOrder, PickupOrder } from "@/lib/entities/order";

type OrderDTO = {
  id?: string;
  code: string;
  total: number;
  status: "OPEN" | "CLOSED";
  type: "LOCAL" | "PICKUP" | "DELIVERY";
  detail?: string,
  tableNumber?: string;
  customerName?: string;
  orderLines: {
    id?: string;
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    observation?: string;
  }[];
};

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

  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const openNewOrderModal = () => setIsNewOrderModalOpen(true);
  const closeNewOrderModal = () => setIsNewOrderModalOpen(false);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { toast } = useToast();

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedOrder(null);
  };

  const handleEditOrder = (order: OrderDTO) => {
    setSelectedOrder(Order.fromDTO(order));
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedOrder(null);
  };

  const handleCreateOrder = async (
    newOrder: OrderRequestDTO
  ) => {
    try {
      const data = await createOrder(newOrder);
      setOrders((prev) => [...prev, data]);

      toast({
        title: `Novo Pedido Adicionado`,
        description: `O pedido foi criado com sucesso.`,
      });
      closeNewOrderModal();

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

      setOrders((prev) =>
        prev.map((o) => (o.id === data.id ? data : o))
      );

      const orderEntity = Order.fromDTO(data)

      toast({
        title: `Pedido ${orderEntity.code} Atualizado`,
        description: `O pedido foi salvo com sucesso.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao editar o  pedido:",
        description: error,
      });
    }

    handleCloseEditModal();
  };

  const handleReopenOrder = async (orderId: string) => {
    try {
      await updateToOpenOrder(orderId);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "OPEN" } as OrderDTO : o))
      );
      toast({
        title: "Pedido Reaberto",
        description: "O pedido foi movido para a lista de abertos.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao reabrir pedido",
        description: error,
      });
    }
  };

  const handleFinishOrder = async (orderId: string) => {
    const finishedOrder = orders.find((o) => o.id === orderId);
    if (!finishedOrder) return;

    try {
      const order = await updateToClosedOrder(orderId);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "CLOSED" } as OrderDTO : o))
      );
      toast({
        title: `Pedido ${finishedOrder.code} Finalizado`,
        description: "O pedido foi movido para a lista de finalizados.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao finalizar pedido",
        description: error,
      });
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    const deletedOrder = orders.find((o) => o.id === orderId);

    try {
      await deleteOrder(orderId);
    } catch (error: any) {
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

  const renderTypeAndDetails = (o: OrderDTO): React.ReactNode => {
    if (o.type === "LOCAL") {
      const local = o as LocalOrder;
      return (
        <>
          <p className="text-xs text-gray-500 mt-0.5">
            Tipo: <span className="font-medium">LOCAL</span>
          </p>
          <p className="text-sm text-gray-700 font-medium">
            Mesa: {local.detail}
          </p>
        </>);
    } else if (o.type === "PICKUP") {
      const pickup = o as PickupOrder;
      return (
        <>
          <p className="text-xs text-gray-500 mt-0.5">
            Tipo: <span className="font-medium">RETIRADA</span>
          </p>
          <p className="text-sm text-gray-700 font-medium">
            Cliente: {pickup.detail}
          </p>
        </>);
    }
    return null;
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
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-lg font-medium mb-3">Abertos</h2>

          {orders
            .filter((o) => o.status === "OPEN")
            .map((o) => {
              const items = o.orderLines || [];
              const total = o.total;

              return (
                <div key={o.id} className="p-3 border rounded-lg mb-2">
                  <div className="flex flex-col">

                    <div className="flex flex-col w-full">
                      <span className="font-semibold">{o.code}</span>
                      {renderTypeAndDetails(o)}

                      <div className="text-xs text-gray-600 mt-2 space-y-1">
                        {items.map((i) => {
                          const subtotal = i.price * i.quantity;
                          return (
                            <div
                              key={`${o.id}-${i.id || i.menuItemId}`}
                              className="flex justify-between"
                            >
                              <span>
                                {i.quantity}x {i.name} — R$ {i.price.toFixed(2)}
                                {i.observation && (<p className="italic text-gray-500 ml-2">
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
                        className="flex justify-between border-t mt-2 pt-2"
                      >
                        <p className="font-semibold text-gray-700">
                          Total:
                        </p>
                        <p className="font-semibold text-gray-700">
                          R$ {total.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3 self-end">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleFinishOrder(o.id!)}
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
                        data-testid="delete-order-button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteOrder(o.id!)}
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

        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-lg font-medium mb-3">Finalizados</h2>

          {orders
            .filter((o) => o.status === "CLOSED")
            .map((o) => {
              const items = o.orderLines || [];
              const total = o.total;

              return (
                <div key={o.id} className="p-3 border rounded-lg mb-2">
                  <div className="flex justify-between items-start">

                    <div className="flex flex-col w-full">
                      <span className="font-semibold">{o.code}</span>
                      {renderTypeAndDetails(o)}

                      <div className="text-xs text-gray-600 mt-2 space-y-1">
                        {items.map((i) => {
                          const subtotal = i.price * i.quantity;
                          return (
                            <div
                              key={`${o.id}-${i.id || i.menuItemId}`}
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

                      <div
                        className="flex justify-between border-t mt-2 pt-2"
                      >
                        <p className="font-semibold text-gray-700">
                          Total:
                        </p>
                        <p className="font-semibold text-gray-700">
                          R$ {total.toFixed(2)}
                        </p>
                      </div>
                    </div>

                  </div>
                  <div className="flex gap-2 mt-3 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReopenOrder(o.id!)}
                      className="h-8"
                    >
                      Reabrir
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
        onAddOrder={handleCreateOrder}
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