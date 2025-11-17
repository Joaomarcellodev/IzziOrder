"use client";

import { useState } from "react";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/molecules/card";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/organisms/select";
import { Trash2 } from 'lucide-react';
import { toast } from "sonner";
import { Category } from "@/app/actions/category";
import { MenuItem } from "@/app/actions/menuItem";

export interface OrderLine {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
}

interface NewOrderFormProps {
  menuItems: MenuItem[];
  categories: Category[];
  onSubmit?: (orderData: any) => void;
}

export function NewOrderForm({ menuItems, categories, onSubmit }: NewOrderFormProps) {
  const [customerName, setCustomerName] = useState("");
  const [orderType, setOrderType] = useState<"LOCAL" | "DELIVERY">("LOCAL");
  const [tableNumber, setTableNumber] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("30");
  const [selectedItems, setSelectedItems] = useState<OrderLine[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddItem = (menuItem: MenuItem) => {
    const id = menuItem.id!; // Corrigido: garantir que não é null

    const existingItem = selectedItems.find(
      (item) => item.menuItemId === id
    );

    if (existingItem) {
      setSelectedItems(
        selectedItems.map((item) =>
          item.menuItemId === id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          menuItemId: id,
          name: menuItem.name,
          quantity: 1,
          price: menuItem.price,
        },
      ]);
    }

    toast.success(`${menuItem.name} adicionado ao pedido`);
  };

  const handleRemoveItem = (menuItemId: string) => {
    setSelectedItems(selectedItems.filter((item) => item.menuItemId !== menuItemId));
  };

  const handleUpdateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(menuItemId);
    } else {
      setSelectedItems(
        selectedItems.map((item) =>
          item.menuItemId === menuItemId ? { ...item, quantity } : item
        )
      );
    }
  };

  const totalPrice = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      toast.error("Por favor, insira o nome do cliente");
      return;
    }

    if (orderType === "LOCAL" && !tableNumber.trim()) {
      toast.error("Por favor, insira o número da mesa");
      return;
    }

    if (selectedItems.length === 0) {
      toast.error("Por favor, adicione pelo menos um item ao pedido");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        customerName,
        type: orderType,
        tableNumber: orderType === "LOCAL" ? tableNumber : undefined,
        estimatedTime: parseInt(estimatedTime),
        orderLines: selectedItems,
        total: totalPrice,
        status: "OPEN" as const,
      };

      onSubmit?.(orderData);

      toast.success("Pedido criado com sucesso!", {
        description: `Pedido de ${customerName} foi registrado.`,
      });

      // Reset form
      setCustomerName("");
      setOrderType("LOCAL");
      setTableNumber("");
      setEstimatedTime("30");
      setSelectedItems([]);

    } catch (error) {
      toast.error("Erro ao criar pedido", {
        description: "Tente novamente mais tarde.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customerName">Nome do Cliente</Label>
            <Input
              id="customerName"
              placeholder="Ex: João Silva"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Pedido</Label>
              <Select value={orderType} onValueChange={(value: any) => setOrderType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOCAL">Local (Mesa)</SelectItem>
                  <SelectItem value="DELIVERY">Entrega (Delivery)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {orderType === "LOCAL" && (
              <div className="space-y-2">
                <Label>Número da Mesa</Label>
                <Input
                  type="number"
                  placeholder="Ex: 5"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  required
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimatedTime">Tempo Estimado (minutos)</Label>
            <Input
              id="estimatedTime"
              type="number"
              min="1"
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Menu Items */}
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Itens</CardTitle>
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
                      className="justify-start h-auto flex-col items-start p-3 hover:bg-orange-50 hover:border-orange-300 transition-colors"
                      onClick={() => handleAddItem(item)}
                    >
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-xs text-gray-500">
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
      {selectedItems.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-900">Itens Selecionados</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {selectedItems.map((item) => (
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
                <span className="font-bold text-lg text-orange-900">Total:</span>
                <span className="font-bold text-2xl text-orange-600">
                  R$ {totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit */}
      <div className="flex gap-3">
        <Button
          type="submit"
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold h-12"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Criando pedido..." : "Criar Pedido"}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="flex-1 h-12"
          onClick={() => {
            setCustomerName("");
            setOrderType("LOCAL");
            setTableNumber("");
            setEstimatedTime("30");
            setSelectedItems([]);
          }}
        >
          Limpar
        </Button>
      </div>
    </form>
  );
}
