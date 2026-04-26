"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/molecules/card";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/organisms/select";
import { Pencil, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Category } from "@/app/actions/category-actions";
import { MenuItem } from "@/app/actions/menu-item-actions";
import { OrderRequestDTO } from "@/app/actions/order-actions";

interface NewOrderFormProps {
  menuItems: MenuItem[];
  categories: Category[];
  onSubmit?: (orderData: OrderRequestDTO) => void;
  onCancel?: () => void;
  initialData?: OrderRequestDTO;
  isEdit?: boolean;
}

export function NewOrderForm({ 
  menuItems, 
  categories, 
  onSubmit, 
  onCancel,
  initialData,
  isEdit = false 
}: NewOrderFormProps) {
  const [orderType, setOrderType] = useState<"LOCAL" | "PICKUP">("LOCAL");
  const [orderDetail, setOrderDetail] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [observationOpen, setObservationOpen] = useState<Record<string, boolean>>({});

  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
      setOrderType(initialData.type as "LOCAL" | "PICKUP");
      setOrderDetail(initialData.detail || "");
      setEstimatedTime(String(initialData.estimatedTime || ""));
      setSelectedItems(initialData.orderLines || []);
      
      const obs: Record<string, boolean> = {};
      (initialData.orderLines || []).forEach(item => {
        if (item.observation) obs[item.menuItemId] = true;
      });
      setObservationOpen(obs);
    }
  }, [initialData]);

  const handleAddItem = (menuItem: MenuItem) => {
    const id = menuItem.id!;
    const existingItem = selectedItems.find((item) => item.menuItemId === id);

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
      toast({ title: "Por favor, insira o número da mesa" });
      return;
    }

    if (selectedItems.length === 0) {
      toast({ title: "O pedido deve conter pelo menos um item." });
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData: OrderRequestDTO = {
        id: initialData?.id,
        total: totalPrice,
        type: orderType,
        detail: orderDetail,
        estimatedTime: parseInt(estimatedTime) || 0,
        orderLines: selectedItems
      };

      onSubmit?.(orderData);

      if (!isEdit) {
        toast({ title: "Pedido registrado com sucesso!" });
        handleClearForm();
      }
    } catch (error) {
      toast({
        title: isEdit ? "Erro ao salvar edição" : "Erro ao criar pedido",
        description: "Tente novamente mais tarde.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearForm = () => {
    setOrderType("LOCAL");
    setOrderDetail("");
    setEstimatedTime("");
    setSelectedItems([]);
    setObservationOpen({});
  };

  const handleUpdateObservation = (id: string, value: string) => {
    setSelectedItems(prev =>
      prev.map(item =>
        item.menuItemId === id ? { ...item, observation: value } : item
      )
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações do Pedido</CardTitle>
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

            <div className="space-y-2">
              <Label>{orderType === "LOCAL" ? "Número da Mesa" : "Nome do Cliente"}</Label>
              <Input
                type="text"
                placeholder={orderType === "LOCAL" ? "Ex: 5" : "Ex: João"}
                value={orderDetail}
                onChange={(e) => setOrderDetail(e.target.value)}
              />
            </div>
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

      <Card>
        <CardHeader>
          <CardTitle>Adicionar Itens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {categories.map((category) => {
            const categoryItems = menuItems.filter(item => item.categoryId === category.id);
            if (categoryItems.length === 0) return null;
            return (
              <div key={category.id} className="space-y-3">
                <h4 className="font-bold text-sm text-blue-700 uppercase tracking-wide">{category.name}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {categoryItems.map((item) => (
                    <Button
                      key={item.id}
                      type="button"
                      variant="outline"
                      className="justify-start h-auto flex-col items-start p-3 hover:bg-blue-200 hover:border-blue-500 transition-colors text-left"
                      onClick={() => handleAddItem(item)}
                    >
                      <div className="font-medium text-sm break-words whitespace-normal leading-tight w-full">{item.name}</div>
                      <div className="text-xs text-gray-500 italic">R$ {item.price.toFixed(2)}</div>
                    </Button>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {selectedItems.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-900">Itens Selecionados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {selectedItems.map((item) => (
              <div key={item.menuItemId} className="flex-col overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-3 rounded-lg border border-orange-200 gap-3">
                  <div className="flex-1 min-w-0 pr-1">
                    <p className="font-medium text-sm truncate">{item.name}</p>
                    <p className="text-[10px] text-gray-500">R$ {item.price.toFixed(2)} cada</p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateQuantity(item.menuItemId, parseInt(e.target.value) || 0)}
                        className="w-12 px-2 py-1 text-sm border rounded text-center font-bold"
                      />

                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setObservationOpen(prev => ({ ...prev, [item.menuItemId]: !prev[item.menuItemId] }))}
                          className="text-yellow-600 hover:bg-yellow-100 h-8 w-8 p-0"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-100"
                          onClick={() => handleRemoveItem(item.menuItemId)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>

                    <span className="text-sm font-bold text-gray-900 min-w-[70px] text-right">
                      R$ {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
                {observationOpen[item.menuItemId] && (
                  <div className="mt-2">
                    <Input
                      type="text"
                      placeholder="Observação"
                      value={item.observation ?? ""}
                      className="text-xs"
                      onChange={(e) => handleUpdateObservation(item.menuItemId, e.target.value)}
                    />
                  </div>
                )}
              </div>
            ))}
            <div className="border-t border-orange-200 pt-3 flex items-center justify-between font-bold text-orange-900">
              <span className="text-lg">Total:</span>
              <span className="text-xl">R$ {totalPrice.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1 h-12 rounded-xl font-semibold"
          onClick={isEdit ? onCancel : handleClearForm}
        >
          {isEdit ? "Cancelar" : "Limpar"}
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processando..." : isEdit ? "Salvar Edição" : "Criar Pedido"}
        </Button>
      </div>
    </div>
  );
}
