"use client";

import { cn } from "@/lib/utils";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/molecules/card";
import { Button } from "@/components/atoms/button";
import { Clock, MapPin, Eye, Truck, Trash2, AlertTriangle, X } from "lucide-react";
import { OrderDetailsModal } from "@/components/molecules/order-details-modal";
import { DeleteConfirmModal } from "@/components/molecules/delete-confirm-modal";



export interface Order {
  id: string;
  customerName: string;
  items: Array<{ name: string; quantity: number; notes?: string }>;
  total: number;
  source: "ifood" | "delivery" | "Mesa";
  waitingTime: number;
  type: "delivery" | "Mesa";
  MesaNumber?: number;
  status: "Novo" | "Confirmado" | "Preparando" | "Pronto";
}

const mockOrders: Order[] = [
  {
    id: "#1235",
    customerName: "Ana B.",
    items: [
      { name: "izziBurger Duplo", quantity: 2, notes: "Sem cebolas" },
      { name: "Batata Frita", quantity: 1 },
    ],
    total: 85.5,
    source: "ifood",
    waitingTime: 8,
    type: "delivery",
    status: "Novo",
  },
  {
    id: "#1236",
    customerName: "João S.",
    items: [
      { name: "Pizza Margherita", quantity: 1 },
      { name: "Coca-Cola", quantity: 2 },
    ],
    total: 45.0,
    source: "Mesa",
    waitingTime: 12,
    type: "Mesa",
    MesaNumber: 5,
    status: "Novo",
  },
  {
    id: "#1234",
    customerName: "Maria L.",
    items: [{ name: "Salada Caesar", quantity: 1 }],
    total: 28.0,
    source: "delivery",
    waitingTime: 5,
    type: "delivery",
    status: "Confirmado",
  },
];

const columns = [
  { id: "Novo", title: "Novo Pedido", status: "Novo" as const },
  { id: "Confirmado", title: "Confirmado", status: "Confirmado" as const },
  { id: "Preparando", title: "Preparando", status: "Preparando" as const },
  { id: "Pronto", title: "Pronto", status: "Pronto" as const },
];

export function OrdersDashboard() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [draggedOrder, setDraggedOrder] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

    const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const getOrdersByStatus = (status: Order["status"]) => {
    return orders.filter((order) => order.status === status);
  };

  const confirmOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: "Confirmado" } : order
      )
    );
  };
   
const openDeleteConfirm = (order: Order) => {
  setOrderToDelete(order);
  setIsDeleteModalOpen(true);
};

const confirmDelete = () => {
  if (orderToDelete) {
    setOrders((prev) => prev.filter((order) => order.id !== orderToDelete.id));
    setIsDeleteModalOpen(false);
    setOrderToDelete(null);
  }
};

const cancelDelete = () => {
  setIsDeleteModalOpen(false);
  setOrderToDelete(null);
};

  const getSourceIcon = (source: Order["source"]) => {
    switch (source) {
      case "ifood":
        return (
          <div className="w-6 h-6 bg-red-500 rounded text-white text-xs flex items-center justify-center font-bold">
            iF
          </div>
        );
      case "delivery":
        return <Truck className="w-5 h-5 text-blue-600" />;
      case "Mesa":
        return <MapPin className="w-5 h-5 text-green-600" />;
    }
  };
    const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column) => {
          const columnOrders = getOrdersByStatus(column.status);
          const hasNovoOrders =
            column.status === "Novo" && columnOrders.length > 0;

          return (
            <div key={column.id} className="space-y-4">
              {/* Column Header */}
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{column.title}</h3>
                <div
                  className={cn(
                    "flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium",
                    hasNovoOrders
                      ? "text-white animate-pulse"
                      : "bg-gray-200 text-gray-600"
                  )}
                  style={hasNovoOrders ? { backgroundColor: "#FD7E14" } : {}}
                >
                  {columnOrders.length}
                </div>
              </div>

              {/* Order Cards */}
              <div className="space-y-3">
                {columnOrders.map((order) => (
                  <Card
                    key={order.id}
                    className="hover:shadow-md transition-all duration-200 cursor-pointer hover:-translate-y-0.5"
                    draggable
                    onDragStart={() => setDraggedOrder(order.id)}
                    onDragEnd={() => setDraggedOrder(null)}
                    style={{ opacity: draggedOrder === order.id ? 0.8 : 1 }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">
                            {order.id}
                          </span>
                          <span className="text-gray-600">
                            - {order.customerName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getSourceIcon(order.source)}
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="w-4 h-4" />
                            <span
                              className={cn(
                                order.waitingTime > 10
                                  ? "text-red-600"
                                  : "text-gray-500"
                              )}
                            >
                              {order.waitingTime}min
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                      {/* Items */}
<CardContent className="space-y-3">
  {/* Items */}
  <div className="space-y-1">
    {order.items.map((item, index) => (
      <div
        key={index}
        className="flex items-center justify-between text-sm"
      >
        <span>
          {item.quantity}x {item.name}
        </span>
        {/* REMOVA completamente o botão do olho daqui */}
      </div>
    ))}
  </div>

  {/* ADICIONE ESTE BLOCO NOVO AQUI - UM OLHO POR PEDIDO */}
  <div className="flex justify-end pt-2">
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0"
      onClick={() => handleViewOrderDetails(order)}
      title="Ver detalhes do pedido"
    >
      <Eye className="w-5 h-5 text-gray-500 hover:text-gray-700" />
    </Button>
  </div>
  
                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="font-semibold text-lg">
                          R$ {order.total.toFixed(2)}
                        </div>
                        <div className="flex items-center gap-1">
                          {order.type === "delivery" ? (
                            <Truck className="w-4 h-4 text-blue-600" />
                          ) : (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-gray-600">
                                #{order.MesaNumber}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Button for Novo Orders */}
                                            {/* Action Button for Novo Orders */}
                      {order.status === "Novo" && (
                        <div className="space-y-2">
                          <Button
                            className="w-full font-semibold text-white"
                            style={{ backgroundColor: "#FD7E14" }}
                            onClick={() => confirmOrder(order.id)}
                          >
                            Confirmar Pedido
                          </Button>
                          
                          {/* BOTÃO EXCLUIR - ADICIONE AQUI */}
                          <Button
                            variant="outline"
                            className="w-full font-semibold text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() => openDeleteConfirm(order)} 
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir Pedido
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Empty State */}
              {columnOrders.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-sm">Nenhum Pedido</div>
                </div>
              )}
            </div> 
            );
        })}
      </div>
       <OrderDetailsModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
       <DeleteConfirmModal
        order={orderToDelete}
        isOpen={isDeleteModalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
