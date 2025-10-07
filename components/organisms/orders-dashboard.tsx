"use client";

import { cn } from "@/lib/utils";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/molecules/card";
import { Button } from "@/components/atoms/button";
import { Clock, MapPin, Eye, Truck, Trash2, AlertTriangle, X } from "lucide-react";
import { OrderDetailsModal } from "@/components/molecules/order-details-modal";
import { DeleteConfirmModal } from "@/components/molecules/delete-confirm-modal";
import { ChevronDown, ChevronUp } from "lucide-react";



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
     const [activeTab, setActiveTab] = useState<"all" | Order["status"]>("all");
const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
// Use este estado (ou mantenha o que já tem):
const [activeFilter, setActiveFilter] = useState<"all" | Order["status"]>("all");
const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);


    // FUNÇÃO PARA ATUALIZAR STATUS AO SOLTAR
  const handleDrop = (status: Order["status"]) => {
    if (!draggedOrder) return;

    setOrders((prev) =>
      prev.map((order) =>
        order.id === draggedOrder ? { ...order, status } : order
      )
    );
    setDraggedOrder(null);
  };

    // FUNÇÃO PARA PERMITIR O DROP
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

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
    const moveToPreparing = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: "Preparando" } : order
      )
    );
  };

  const moveToReady = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: "Pronto" } : order
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
  <div className="p-4 lg:p-6">
    {/* VERSÃO DESKTOP (4 colunas - apenas desktop grande) */}
       <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column) => {
          const columnOrders = getOrdersByStatus(column.status);
          const hasNovoOrders = column.status === "Novo" && columnOrders.length > 0;

          return (
            <div 
              key={column.id} 
              className="space-y-4"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.status)}
            >
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
                          </div>
                        ))}
                      </div>

                      {/* Botão Ver Detalhes */}
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
                      {order.status === "Novo" && (
                        <div className="space-y-2">
                          <Button
                            className="w-full font-semibold text-white"
                            style={{ backgroundColor: "#FD7E14" }}
                            onClick={() => confirmOrder(order.id)}
                          >
                            Confirmar Pedido
                          </Button>
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

  
      {/* VERSÃO MOBILE/TABLET (Cards com Swipe Actions) */}
      <div className="lg:hidden space-y-3 p-4">
        {/* Status Quick Actions */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { status: "all", label: "📋 Todos", count: orders.length },
            { status: "Novo", label: "🆕 Novos", count: getOrdersByStatus("Novo").length },
            { status: "Confirmado", label: "✅ Confirmados", count: getOrdersByStatus("Confirmado").length },
            { status: "Preparando", label: "👨‍🍳 Preparando", count: getOrdersByStatus("Preparando").length },
            { status: "Pronto", label: "🚀 Prontos", count: getOrdersByStatus("Pronto").length }
          ].map((item) => (
            <button
              key={item.status}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap",
                activeFilter === item.status 
                  ? "bg-orange-500 text-white" 
                  : "bg-gray-100 text-gray-700"
              )}
              onClick={() => setActiveFilter(item.status as any)}
            >
              {item.label} ({item.count})
            </button>
          ))}
        </div>

        {/* Cards com Ações Rápidas */}
        <div className="space-y-3">
          {orders
            .filter(order => activeFilter === "all" || order.status === activeFilter)
            .map((order) => (
            <div key={order.id} className="bg-gradient-to-r from-white to-gray-50 rounded-2xl p-4 shadow-sm border">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900 text-lg">{order.id}</span>
                    <span className="text-gray-600">• {order.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    {getSourceIcon(order.source)}
                    <span>{order.waitingTime} min</span>
                  </div>
                </div>
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold",
                  order.status === "Novo" && "bg-orange-100 text-orange-800",
                  order.status === "Confirmado" && "bg-green-100 text-green-800",
                  order.status === "Preparando" && "bg-blue-100 text-blue-800",
                  order.status === "Pronto" && "bg-purple-100 text-purple-800"
                )}>
                  {order.status}
                </span>
              </div>

              {/* Itens */}
              <div className="mb-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between py-1 text-sm">
                    <span className="text-gray-700">{item.quantity}x {item.name}</span>
                  </div>
                ))}
              </div>

              {/* Ações Rápidas */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleViewOrderDetails(order)}
                >
                  Detalhes
                </Button>
                <select 
                  className="flex-1 text-sm border rounded-lg px-3 bg-white"
                  onChange={(e) => {
                    const newStatus = e.target.value as Order["status"];
                    if (newStatus !== order.status) {
                      setOrders(prev => prev.map(o => 
                        o.id === order.id ? { ...o, status: newStatus } : o
                      ));
                    }
                  }}
                  value={order.status}
                >
                  <option value="Novo">🆕 Novo</option>
                  <option value="Confirmado">✅ Confirmado</option>
                  <option value="Preparando">👨‍🍳 Preparando</option>
                  <option value="Pronto">🚀 Pronto</option>
                </select>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center mt-3 pt-3 border-t">
                <span className="font-bold text-lg text-gray-900">R$ {order.total.toFixed(2)}</span>
                {order.status === "Novo" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => openDeleteConfirm(order)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </Button>
                )}
              </div>
            </div>
          ))}

          {/* Empty State */}
          {orders.filter(order => activeFilter === "all" || order.status === activeFilter).length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-sm">Nenhum Pedido</div>
            </div>
          )}
        </div>
      </div>
      {/* Modais */}
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