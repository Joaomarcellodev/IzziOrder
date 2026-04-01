"use client";

import React, { useState, useEffect } from "react";
import { Order, OrderLine, OrderRequestDTO } from "@/app/actions/order-actions";
import { MenuItem } from "@/app/actions/menu-item-actions";
import { Category } from "@/app/actions/category-actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../molecules/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../molecules/card";
import { Input } from "../atoms/input";
import { Label } from "../atoms/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../organisms/select";
import { Button } from "../atoms/button";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from 'lucide-react';

interface EditOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onUpdateOrder: (updatedOrder: OrderRequestDTO) => void;
  menuItems: MenuItem[];
  categories: Category[];
}

export function EditOrderModal({
  isOpen,
  onClose,
  order,
  onUpdateOrder,
  menuItems,
  categories
}: EditOrderModalProps) {


  // --- Estados do Formulário de Edição ---
  const [editedOrderType, setEditedOrderType] = useState<"LOCAL" | "DELIVERY" | "PICKUP">("LOCAL");
  const [editedDetail, setEditedDetail] = useState<string>();
  const [editedEstimatedTime, setEditedEstimatedTime] = useState("");
  const [editedStatus, setEditedStatus] = useState<Order['status']>("OPEN");
  const [editedItems, setEditedItems] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  // --- 💡 SINCRONIZAÇÃO: Carrega dados do 'order' para o estado interno ---
  useEffect(() => {
    if (order) {
      setEditedStatus(order.status);
      setEditedOrderType(order.type);
      if (order.type == "LOCAL") {
        setEditedDetail(order.tableNumber?.toString());
      } else if (order.type == "PICKUP") {
        setEditedDetail(order.customerName);
      }
      setEditedEstimatedTime(String(order.estimatedTime || ""));
      setEditedItems(order.orderLines);
    }
  }, [order]);

  // --- Funções de Manipulação de Itens (Adaptadas do NewOrderForm) ---

  const handleAddItem = (menuItem: MenuItem) => {
    const id = menuItem.id!;

    const existingItem = editedItems.find((item) => item.menuItemId === id);

    if (existingItem) {
      setEditedItems(
        editedItems.map((item) =>
          item.menuItemId === id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setEditedItems([
        ...editedItems,
        {
          menuItemId: id,
          name: menuItem.name,
          quantity: 1,
          price: menuItem.price,
        },
      ]);
    }

    toast({
      title: `${menuItem.name} adicionado/atualizado no pedido.`,
    });
  };

  const handleRemoveItem = (menuItemId: string) => {
    setEditedItems(editedItems.filter((item) => item.menuItemId !== menuItemId));
  };

  const handleUpdateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(menuItemId);
    } else {
      setEditedItems(
        editedItems.map((item) =>
          item.menuItemId === menuItemId ? { ...item, quantity } : item
        )
      );
    }
  };


  // --- Cálculo do Total ---
  const totalPrice = editedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // --- Submissão do Formulário ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!order) {
      toast({
        title: "Erro",
        description: "Pedido não encontrado para edição.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }


    // Validações
    if (editedOrderType === "PICKUP" && (!editedDetail || !editedDetail.trim())) {
      toast({
        title: "Por favor, insira o nome do cliente",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    if (editedOrderType === "LOCAL" && (!editedDetail || !editedDetail.trim())) {
      toast({
        title: "Por favor, insira o número da mesa",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    if (editedItems.length === 0) {
      toast({
        title: "O pedido deve conter pelo menos um item.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }


    try {
      const updatedOrder: OrderRequestDTO = {
        ...order,
        detail: editedDetail!,
        status: editedStatus,
        type: editedOrderType,
        estimatedTime: parseInt(editedEstimatedTime) || 0,
        orderLines: editedItems,
        total: totalPrice,
      };

      onUpdateOrder(updatedOrder);
      // O toast de sucesso é emitido pelo componente pai (OrdersDashboard)
    } catch (error) {
      toast({
        title: "Erro ao salvar edição",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  if (!order) {
    return null;
  }


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Pedido {order.code}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">


          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Pedido</Label>
                  <Select value={editedOrderType} onValueChange={(value: any) => setEditedOrderType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOCAL">Local</SelectItem>
                      <SelectItem value="PICKUP">Retirada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {editedOrderType === "LOCAL" && (
                  <div className="space-y-2">
                    <Label>Número da Mesa</Label>
                    <Input
                      type="number"
                      placeholder="Ex: 5"
                      value={editedDetail}
                      onChange={(e) => setEditedDetail(e.target.value)}
                    />
                  </div>
                )}

                {editedOrderType === "PICKUP" && (
                  <div className="space-y-2">
                    <Label>Nome do Cliente</Label>
                    <Input
                      type="text"
                      placeholder="Ex: João"
                      value={editedDetail}
                      onChange={(e) => setEditedDetail(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimatedTime">Tempo Estimado (minutos)</Label>
                  <Input
                    id="estimatedTime"
                    type="number"
                    placeholder="(opcional)"
                    value={editedEstimatedTime}
                    onChange={(e) => setEditedEstimatedTime(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Menu Items (Adicionar) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Adicionar/Remover Itens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {categories.map((category) => {
                const categoryItems = menuItems.filter(
                  (item) => item.categoryId === category.id
                );

                if (categoryItems.length === 0) return null;

                return (
                  <div key={category.id} className="space-y-3">
                    <h4 className="font-semibold text-sm text-gray-700">{category.name}</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {categoryItems.map((item) => (
                        <Button
                          key={item.id}
                          type="button"
                          variant="outline"
                          className="justify-start h-auto flex-col items-start p-3 hover:bg-blue-200 hover:border-blue-500 transition-colors text-left"
                          onClick={() => handleAddItem(item)}
                        >
                          <div className="font-medium text-sm break-words whitespace-normal leading-tight w-full">
                            {item.name}
                          </div>

                          <div className="text-xs text-gray-500 whitespace-nowrap">
                            R$ {item.price.toFixed(2)}
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>


          {/* Selected Items */}
          {editedItems.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-900 text-lg">Itens Selecionados</CardTitle>
              </CardHeader>

              <CardContent className="space-y-5">
                {editedItems.map((item) => {
                  return (
                    <div
                      key={item.menuItemId}
                      className="flex items-center justify-between bg-white p-3 rounded-lg border border-orange-200"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">R$ {item.price.toFixed(2)} cada</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateQuantity(item.menuItemId, parseInt(e.target.value) || 0)
                          }
                          className="w-12 px-2 py-1 text-sm border rounded text-center"
                        />

                        <span className="text-sm font-semibold min-w-20 text-right">
                          R$ {(item.price * item.quantity).toFixed(2)}
                        </span>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-100"
                          onClick={() => handleRemoveItem(item.menuItemId)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}

                <div className="border-t border-orange-200 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg text-orange-900">Total Atual:</span>
                    <span className="font-bold text-2xl text-orange-600">
                      R$ {totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={onClose} type="button">Cancelar</Button>
            <Button className=" bg-blue-600 hover:bg-blue-700" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar Edição"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}