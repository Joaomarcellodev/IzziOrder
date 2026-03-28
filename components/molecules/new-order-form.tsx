"use client";

import { useState } from "react";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/molecules/card";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/organisms/select";
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from "sonner";
import { Category } from "@/app/actions/category-actions";
import { MenuItem } from "@/app/actions/menu-item-actions";
import { OrderLineRequestDTO, OrderRequestDTO } from "@/app/actions/order-actions";

interface NewOrderFormProps {
  menuItems: MenuItem[];
  categories: Category[];
  onSubmit?: (orderData: OrderRequestDTO) => void;
}

export function NewOrderForm({ menuItems, categories, onSubmit }: NewOrderFormProps) {
  const [customerName, setCustomerName] = useState("");
  const [orderType, setOrderType] = useState<"LOCAL" | "PICKUP">("LOCAL");
  const [orderDetail, setOrderDetail] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [selectedItems, setSelectedItems] = useState<OrderLineRequestDTO[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [observationOpen, setObservationOpen] = useState<Record<string, boolean>>({});

  const handleAddItem = (menuItem: MenuItem) => {
    const id = menuItem.id!;

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

    if (orderType === "LOCAL" && !orderDetail.trim()) {
      toast.error("Por favor, insira o número da mesa");
      return;
    }

    if (selectedItems.length === 0) {
      toast.error("Por favor, adicione pelo menos um item ao pedido");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData: OrderRequestDTO = {
        total: totalPrice,
        type: orderType,
        detail: orderDetail,
        estimatedTime: parseInt(estimatedTime),
        orderLines: selectedItems
      };

      onSubmit?.(orderData);

      toast.success("Pedido criado com sucesso!", {
        description: `Pedido de ${customerName} foi registrado.`,
      });

      // Reset form
      setCustomerName("");
      setOrderType("LOCAL");
      setOrderDetail("");
      setEstimatedTime("");
      setSelectedItems([]);

    } catch (error) {
      toast.error("Erro ao criar pedido", {
        description: "Tente novamente mais tarde.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateObservation = (id: string, value: string) => {
    setSelectedItems(prev =>
      prev.map(item =>
        item.menuItemId === id
          ? { ...item, observation: value }
          : item
      )
    );
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Pedido</Label>
              <Select value={orderType} onValueChange={(value: any) => setOrderType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOCAL">Local</SelectItem>
                  <SelectItem value="PICKUP">Retirada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {orderType === "LOCAL" && (
              <div className="space-y-2">
                <Label>Número da Mesa</Label>
                <Input
                  type="number"
                  placeholder="Ex: 5"
                  value={orderDetail}
                  onChange={(e) => setOrderDetail(e.target.value)}
                  required
                />
              </div>
            )}

            {orderType === "PICKUP" && (
              <div className="space-y-2">
                <Label>Nome do Cliente</Label>
                <Input
                  type="text"
                  placeholder="Ex: João"
                  value={orderDetail}
                  onChange={(e) => setOrderDetail(e.target.value)}
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
              placeholder="(opcional)"
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
      {selectedItems.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-900">Itens Selecionados</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            {selectedItems.map((item) => (
              <div
                key={item.menuItemId}
                className="flex-col">
                <div
                  className="flex items-center justify-between bg-white p-3 rounded-lg border border-orange-200"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">R$ {item.price.toFixed(2)} cada</p>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setObservationOpen((prev) => ({
                        ...prev,
                        [item.menuItemId]: true
                      }))}
                    className="text-yellow-600 hover:bg-yellow-100 h-8 w-8 p-0"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>

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
                {observationOpen[item.menuItemId] && (<div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Observação"
                    value={item.observation ?? ""}
                    onChange={(e) => handleUpdateObservation(item.menuItemId, e.target.value)}
                  />
                </div>)}
              </div>
            )
            )}

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
          className="flex-1  bg-blue-600 hover:bg-blue-700 text-white font-bold h-12"
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
            setOrderDetail("");
            setEstimatedTime("");
            setSelectedItems([]);
          }}
        >
          Limpar
        </Button>
      </div>
    </form>
  );
}