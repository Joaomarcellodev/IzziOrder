"use client";

import React, { useState, useEffect } from "react";
import { Order } from "@/app/actions/order-actions";
import { MenuItem } from "@/app/actions/menu-item-actions";
import { Category } from "@/app/actions/category-actions";
// Componentes UI do seu sistema
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../molecules/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../molecules/card";
import { Input } from "../atoms/input";
import { Label } from "../atoms/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../organisms/select";
import { Button } from "../atoms/button";
import { toast } from "sonner";
import { Trash2 } from 'lucide-react';

// Reutilizando a interface de linha de pedido (OrderLine)
export interface OrderLine {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
}

interface EditOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  // A interface Order deve ter sido atualizada para incluir `notes` no seu ambiente
  order: Order & { notes?: string } | null;
  onUpdateOrder: (updatedOrder: Order & { notes?: string }) => void;
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
  const [editedCustomerName, setEditedCustomerName] = useState("");
  const [editedOrderType, setEditedOrderType] = useState<"LOCAL" | "DELIVERY">("LOCAL");
  const [editedTableNumber, setEditedTableNumber] = useState("");
  const [editedEstimatedTime, setEditedEstimatedTime] = useState("30");
  const [editedStatus, setEditedStatus] = useState<Order['status']>("OPEN");
  // 1. Novo estado para observações
  const [editedNotes, setEditedNotes] = useState("");
  const [editedItems, setEditedItems] = useState<OrderLine[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- 💡 SINCRONIZAÇÃO: Carrega dados do 'order' para o estado interno ---
  useEffect(() => {
    if (order) {
      setEditedCustomerName(order.customerName);
      setEditedStatus(order.status);
      setEditedOrderType(order.type);
      setEditedTableNumber(order.tableNumber || "");
      setEditedEstimatedTime(String(order.estimatedTime || 30));
      // 2. Sincroniza o novo estado de observações
      setEditedNotes(order.notes || "");
      // Garante que os itens são carregados corretamente
      setEditedItems(order.items as OrderLine[] || []);
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

    toast.success(`${menuItem.name} adicionado/atualizado no pedido.`);
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
      toast.error("Erro", { description: "Pedido não encontrado para edição." });
      setIsSubmitting(false);
      return;
    }

    // Validações
    if (!editedCustomerName.trim()) {
      toast.error("Por favor, insira o nome do cliente");
      setIsSubmitting(false);
      return;
    }
    if (editedOrderType === "LOCAL" && !editedTableNumber.trim()) {
      toast.error("Por favor, insira o número da mesa");
      setIsSubmitting(false);
      return;
    }
    if (editedItems.length === 0) {
      toast.error("Por favor, adicione pelo menos um item ao pedido");
      setIsSubmitting(false);
      return;
    }


    try {
      const updatedOrder: Order & { notes?: string } = {
        ...order,
        customerName: editedCustomerName,
        status: editedStatus,
        type: editedOrderType,
        tableNumber: editedOrderType === "LOCAL" ? editedTableNumber : undefined,
        estimatedTime: parseInt(editedEstimatedTime),
        // 4. Inclui as observações atualizadas
        notes: editedNotes.trim() || undefined,
        items: editedItems, // Lista de itens atualizada
        total: totalPrice, // Total calculado
      };

      onUpdateOrder(updatedOrder);
      // O toast de sucesso é emitido pelo componente pai (OrdersDashboard)
    } catch (error) {
      toast.error("Erro ao salvar edição", {
        description: "Tente novamente mais tarde.",
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
              <div className="space-y-2">
                <Label htmlFor="customerName">Nome do Cliente</Label>
                <Input
                  id="customerName"
                  placeholder="Ex: João Silva"
                  value={editedCustomerName}
                  onChange={(e) => setEditedCustomerName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Pedido</Label>
                  <Select value={editedOrderType} onValueChange={(value: any) => setEditedOrderType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOCAL">Local (Mesa)</SelectItem>
                      <SelectItem value="DELIVERY">Retirada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {editedOrderType === "LOCAL" && (
                  <div className="space-y-2">
                    <Label>Número da Mesa</Label>
                    <Input
                      type="number"
                      placeholder="Ex: 5"
                      value={editedTableNumber}
                      onChange={(e) => setEditedTableNumber(e.target.value)}
                      required
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
                    min="1"
                    value={editedEstimatedTime}
                    onChange={(e) => setEditedEstimatedTime(e.target.value)}
                  />
                </div>

                {/* <div className="space-y-2">
                  <Label>Status Atual</Label>
                  <Select value={editedStatus} onValueChange={(value: any) => setEditedStatus(value)}>
                    <SelectTrigger className="font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">Aberto</SelectItem>
                      <SelectItem value="CLOSED">Finalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div> */}
              </div>

              {/* 3. Novo campo para observações */}
              <div className="space-y-2">
                <Label htmlFor="notes">Observações do Pedido</Label>
                <Input
                  id="notes"
                  placeholder="Ex: Precisa de talheres e guardanapos."
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                />
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
                  (item) => item.category_id === category.id
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
                {editedItems.map((item) => (
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
                ))}

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