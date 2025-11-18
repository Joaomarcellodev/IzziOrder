"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "../atoms/button";
// Importar Order e OrderLine do caminho correto (assumindo que você as tenha atualizado)
import { Order } from "@/app/actions/orders"; 
import { NewOrderModal } from "../molecules/new-order-modals";
import { MenuItem } from "@/app/actions/menuItem";
import { Category } from "@/app/actions/category";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { OrderLine } from "../molecules/new-order-form"; 

import { EditOrderModal } from "../molecules/edit-order-modal";
import { ViewOrderModal } from "../molecules/ViewOrderModal";

// 1. Atualizando a interface Order para incluir 'notes'
// Nota: Certifique-se de que a interface real em "@/app/actions/orders" também inclua 'notes: string;'
interface CustomOrder extends Order {
    notes?: string; // Adicionando 'notes'
}

interface OrdersDashboardProps {
  menuItems: MenuItem[];
  categories: Category[];
  orders: CustomOrder[]; // Usando a interface atualizada
}

// 1. Atualizando a interface NewOrderFormData para incluir 'notes'
interface NewOrderFormData {
    customerName: string;
    type: "LOCAL" | "DELIVERY";
    tableNumber?: string;
    estimatedTime: number;
    orderLines: OrderLine[];
    total: number;
    status: "OPEN";
    notes?: string; // Adicionado 'notes'
}

export default function OrdersDashboard({
  menuItems,
  categories,
  orders: initialOrders,
}: OrdersDashboardProps) {
  // Usando CustomOrder no estado
  const [orders, setOrders] = useState<CustomOrder[]>(initialOrders);

  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const openNewOrderModal = () => setIsNewOrderModalOpen(true);
  const closeNewOrderModal = () => setIsNewOrderModalOpen(false);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<CustomOrder | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const handleViewOrder = (order: CustomOrder) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedOrder(null); 
  };

  const handleEditOrder = (order: CustomOrder) => {
    setSelectedOrder(order);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedOrder(null); 
  };

  // 2. Atualizando handleAddNewOrder para receber e armazenar 'notes'
  const handleAddNewOrder = (
    newOrderData: NewOrderFormData
  ) => {
    const newOrder: CustomOrder = {
      customerName: newOrderData.customerName,
      type: newOrderData.type,
      tableNumber: newOrderData.tableNumber,
      estimatedTime: newOrderData.estimatedTime,
      notes: newOrderData.notes, // Incluindo as notas aqui
      
      status: "OPEN",
      id: Math.random().toString(36).substring(2, 9),
      code: `#${(orders.length + 1).toString().padStart(3, "0")}`,
      
      items: newOrderData.orderLines, 
    };

    setOrders((prev) => [newOrder, ...prev]);
    closeNewOrderModal();

    toast.success(`Novo Pedido Adicionado`, {
      description: `O pedido ${newOrder.code} foi criado com sucesso.`,
    });
  };

  const handleUpdateOrder = (updatedOrder: CustomOrder) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
    );
    handleCloseEditModal(); 

    toast.success(`Pedido ${updatedOrder.code} Atualizado`, {
      description: `O pedido foi salvo com sucesso.`,
    });
  };

  const handleDeleteOrder = (orderId: string) => {
    const deletedOrder = orders.find((o) => o.id === orderId);

    setOrders((prev) => prev.filter((o) => o.id !== orderId));

    toast.error("Pedido removido", {
      description: `O pedido ${deletedOrder?.code} foi excluído com sucesso.`,
    });
  };

  const getSafeItems = (items: any[]) => (Array.isArray(items) ? items : []);
  
  // 💡 Função para formatar o tipo de pedido
  const formatOrderType = (type: "LOCAL" | "DELIVERY", tableNumber?: string) => {
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
              const items = getSafeItems(o.items); 
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
                      
                      {/* 3. Exibir Observações - Abertos */}
                      {o.notes && (
                          <p className="text-xs text-orange-600 italic mt-1 p-1 bg-orange-50 rounded border border-orange-200">
                              Obs: {o.notes}
                          </p>
                      )}

                      {/* Itens do Pedido ABERTO - Detalhado */}
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

                      {/* 3. Exibir Observações - Finalizados */}
                      {o.notes && (
                          <p className="text-xs text-orange-600 italic mt-1 p-1 bg-orange-50 rounded border border-orange-200">
                              Obs: {o.notes}
                          </p>
                      )}

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

                    {/* Removido o botão View, deixando o card apenas como exibição para Finalizados */}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* --- Modais --- */}

      <NewOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={closeNewOrderModal}
        onAddOrder={handleAddNewOrder}
        menuItems={menuItems}
        categories={categories}
      />

      {selectedOrder && (
        <ViewOrderModal
          isOpen={isViewModalOpen}
          onClose={handleCloseViewModal}
          order={selectedOrder}
        />
      )}
      
      {selectedOrder && (
        <EditOrderModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          order={selectedOrder}
          onUpdateOrder={handleUpdateOrder} 
          menuItems={menuItems}
          categories={categories}
        />
      )}
    </div>
  );
}