"use client";

import { cn } from "@/lib/utils";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/molecules/card";
import { Button } from "@/components/atoms/button";
import { Clock, MapPin, Eye, Truck, Trash2, AlertTriangle, X } from "lucide-react";
import { OrderDetailsModal } from "@/components/molecules/order-details-modal";
import { DeleteConfirmModal } from "@/components/molecules/delete-confirm-modal";
import { deleteOrder, Order } from "@/app/actions/orders";
import { useToast } from "../atoms/use-toast";
import { NewOrderModal } from "@/components/molecules/new-order-modal";
import { Category } from "@/app/actions/category";
import { MenuItem } from "@/app/actions/menuItem";

const columns = [
  { id: "Aberto", title: "Aberto", status: "OPEN" as const },
  { id: "Fechado", title: "Fechado", status: "CLOSED" as const },
];

interface OrdersDashboardProps {
  orders: Order[];
  menuItems: MenuItem[];
  categories: Category[];
}

export function OrdersDashboard({ orders: initialOrders, menuItems, categories }: OrdersDashboardProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [draggedOrder, setDraggedOrder] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | Order["status"]>("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | Order["status"]>("all");
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  // NOVO ESTADO: Modal de Adicionar Pedido
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);

  const { toast } = useToast();

  // FUNÇÃO PARA ABRIR O MODAL DE NOVO PEDIDO
  const openNewOrderModal = () => setIsNewOrderModalOpen(true);

  // FUNÇÃO PARA FECHAR O MODAL DE NOVO PEDIDO
  const closeNewOrderModal = () => setIsNewOrderModalOpen(false);

  // NOVO: Função para Adicionar um Novo Pedido
  const handleAddNewOrder = (newOrderData: Omit<Order, 'id' | 'code'>) => {
    // Simulação de um novo pedido completo (gera ID e Code)
    const newOrder: Order = {
      ...newOrderData,
      id: Math.random().toString(36).substring(2, 9), // ID aleatório
      code: `#${(orders.length + 1).toString().padStart(3, '0')}`, // Código sequencial simulado
    };

    setOrders(prev => [newOrder, ...prev]);
    closeNewOrderModal();

    toast({
      title: "Novo Pedido Adicionado",
      description: `O pedido ${newOrder.code} foi criado com sucesso.`,
      variant: "default",
    });
  };

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
        order.id === orderId ? { ...order, status: "CLOSED" } : order
      )
    );
  };

  const openDeleteConfirm = (order: Order) => {
    setOrderToDelete(order);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;

    try {
      await deleteOrder(orderToDelete.id);

      setOrders((prev) => prev.filter((order) => order.id !== orderToDelete.id));

      toast({
        title: "Pedido excluído",
        description: `O pedido #${orderToDelete.code} foi removido com sucesso.`,
        variant: "default", // pode ser 'default' ou 'success' dependendo do seu tema
      });
    } catch (error) {
      console.error("Erro ao deletar pedido:", error);
      toast({
        title: "Erro ao excluir pedido",
        description: "Não foi possível remover o pedido. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteModalOpen(false);
      setOrderToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setOrderToDelete(null);
  };

  const getSourceIcon = (source: Order["type"]) => {
    switch (source) {
      case "DELIVERY":
        return <Truck className="w-5 h-5 text-blue-600" />;
      case "LOCAL":
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

      {/* NOVO: Botão Adicionar Pedido */}
      <div className="mb-6 flex justify-end">
        <Button
          className="bg-green-500 hover:bg-green-600 text-white font-bold"
          onClick={openNewOrderModal}
        >
          Adicionar Pedido
        </Button>
      </div>

      {/* VERSÃO DESKTOP (4 colunas - apenas desktop grande) */}
      <div className="hidden xl:grid grid-cols-4 gap-6">
        {columns.map((column) => {
          const columnOrders = getOrdersByStatus(column.status);
          const hasNewOrders =
            column.status === "OPEN" && columnOrders.length > 0;

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
                    hasNewOrders
                      ? "text-white animate-pulse"
                      : "bg-gray-200 text-gray-600"
                  )}
                  style={hasNewOrders ? { backgroundColor: "#FD7E14" } : {}}
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
                            {order.code!}
                          </span>
                          <span className="text-gray-600">
                            - {order.customerName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getSourceIcon(order.type)}
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="w-4 h-4" />
                            <span
                              className={cn(
                                order.estimatedTime ?? 0 > 10
                                  ? "text-red-600"
                                  : "text-gray-500"
                              )}
                            >
                              {order.estimatedTime}min
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {/* Items */}
                      <div className="space-y-1">
                        {order.orderLines.map((line, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between text-sm"
                          >
                            <span>
                              {line.quantity}x {line.name}
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
                          {order.type === "DELIVERY" ? (
                            <Truck className="w-4 h-4 text-blue-600" />
                          ) : (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-gray-600">
                                {order.tableNumber}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Button for New Orders */}
                      <div className="space-y-2">
                        {order.status === "OPEN" && (
                          <Button
                            className="w-full font-semibold text-white"
                            style={{ backgroundColor: "#FD7E14" }}
                            onClick={() => confirmOrder(order.id)}
                          >
                            Confirmar Pedido
                          </Button>
                        )}
                        {(order.status === "CLOSED") && (
                          <Button
                            variant="outline"
                            className="w-full font-semibold text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() => openDeleteConfirm(order)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir Pedido
                          </Button>
                        )}
                      </div>

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
      <div className="md:hidden space-y-4 p-4">
        {/* Status Quick Actions */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { status: "all", label: "Todos", count: orders.length },
            { status: "Aberto", label: "Abertos", count: getOrdersByStatus("OPEN").length },
            { status: "Fechado", label: "Fechados", count: getOrdersByStatus("CLOSED").length },
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
                      <span className="font-bold text-gray-900 text-lg">{order.code}</span>
                      <span className="text-gray-600">• {order.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      {getSourceIcon(order.type)}
                      <span>{order.estimatedTime} min</span>
                    </div>
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold",
                    order.status === "OPEN" && "bg-green-100 text-red-800",
                    order.status === "CLOSED" && "bg-blue-100 text-green-800",
                  )}>
                    {order.status}
                  </span>
                </div>

                {/* Itens */}
                <div className="mb-4">
                  {order.orderLines.map((line, index) => (
                    <div key={index} className="flex justify-between py-1 text-sm">
                      <span className="text-gray-700">{line.quantity}x {line.name}</span>
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
                  {(order.status === "OPEN") && (
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

      {/* VERSÃO IPAD PRO & TABLETS GRANDES (768px - 1279px) */}
      <div className="hidden md:block xl:hidden">
        <div className="p-6">
          {/* Status Quick Actions - Com nomes completos */}
          <div className="flex gap-3 overflow-x-auto pb-4 mb-6">
            {[
              { status: "all", label: "Todos", count: orders.length },
              { status: "Aberto", label: "Abertos", count: getOrdersByStatus("OPEN").length },
              { status: "Fechado", label: "Fechados", count: getOrdersByStatus("CLOSED").length },
            ].map((item) => (
              <button
                key={item.status}
                className={cn(
                  "px-4 py-3 rounded-full text-sm font-medium whitespace-nowrap",
                  activeFilter === item.status
                    ? "bg-orange-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
                onClick={() => setActiveFilter(item.status as any)}
              >
                {item.label} ({item.count})
              </button>
            ))}
          </div>

          {/* Cards em grid responsivo */}
          <div className={cn(
            "gap-6",
            "grid grid-cols-1",
            "lg:grid-cols-2" // 2 colunas no iPad Pro
          )}>
            {orders
              .filter(order => activeFilter === "all" || order.status === activeFilter)
              .map((order) => (
                <div key={order.id} className="bg-white rounded-xl p-5 shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-gray-900 text-lg">{order.code}</span>
                        <span className="text-gray-600">• {order.customerName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {getSourceIcon(order.type)}
                        <div className="flex items-center gap-1 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span className={cn(
                            "text-sm font-medium",
                            order.estimatedTime! > 10 ? "text-red-600" : ""
                          )}>
                            {order.estimatedTime} min
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold",
                      order.status === "OPEN" && "bg-orange-100 text-orange-800 border border-orange-200",
                      order.status === "CLOSED" && "bg-green-100 text-green-800 border border-green-200",
                    )}>
                      {order.status}
                    </span>
                  </div>

                  {/* Itens */}
                  <div className="mb-4 space-y-2">
                    {order.orderLines.map((line, index) => (
                      <div key={index} className="flex justify-between items-center py-1">
                        <span className="text-gray-700 text-sm">
                          {line.quantity}x {line.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Ações Rápidas */}
                  <div className="flex gap-2 mb-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-sm h-9"
                      onClick={() => handleViewOrderDetails(order)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Detalhes
                    </Button>
                    <select
                      className="flex-1 text-sm border border-gray-300 rounded-lg px-2 bg-white h-9"
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
                      <option value="Novo">Novo</option>
                      <option value="Confirmado">Confirmado</option>
                      <option value="Preparando">Preparando</option>
                      <option value="Pronto">Pronto</option>
                    </select>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg text-gray-900">
                        R$ {order.total.toFixed(2)}
                      </span>
                      <div className="flex items-center gap-1 text-gray-600">
                        {order.type === "DELIVERY" ? (
                          <>
                            <Truck className="w-4 h-4" />
                            <span className="text-xs">Delivery</span>
                          </>
                        ) : (
                          <>
                            <MapPin className="w-4 h-4 text-green-600" />
                            <span className="text-xs">Mesa #{order.tableNumber}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {(order.status === "OPEN") && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-300 hover:bg-red-50 h-8 px-3"
                        onClick={() => openDeleteConfirm(order)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Excluir
                      </Button>
                    )}
                  </div>

                  {/* Botão Confirmar para pedidos Novos */}
                  {order.status === "OPEN" && (
                    <div className="mt-3">
                      <Button
                        className="w-full font-semibold text-white text-sm h-9"
                        style={{ backgroundColor: "#FD7E14" }}
                        onClick={() => confirmOrder(order.id)}
                      >
                        Confirmar Pedido
                      </Button>
                    </div>
                  )}
                </div>
              ))}

            {/* Empty State */}
            {orders.filter(order => activeFilter === "all" || order.status === activeFilter).length === 0 && (
              <div className="col-span-full text-center py-16 text-gray-500">
                <div className="text-lg font-semibold mb-2">Nenhum Pedido</div>
                <div className="text-sm">Não há pedidos neste status no momento</div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Modais */}

      {/* NOVO MODAL: Adicionar Pedido */}
      <NewOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={closeNewOrderModal}
        onAddOrder={handleAddNewOrder}
        menuItems={menuItems}
        categories={categories}
      />

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