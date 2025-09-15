"use client";

import { useState } from "react";
import { GripVertical, Edit, Upload } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/molecules/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/molecules/dialog";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { Textarea } from "@/components/atoms/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/organisms/select";
import { Switch } from "@/components/atoms/switch";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { createMenuItem, updateMenuItem } from "@/app/actions/menu";

interface MenuItem {
  id: string | null;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
}

interface MenuManagementProps {
  menuItems: MenuItem[];
}

const categories = ["Hambúrgueres", "Pizzas", "Saladas", "Bebidas", "Sobremesas"];

export function MenuManagement({ menuItems: menuItems }: MenuManagementProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const filteredItems =
    selectedCategory === "All"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  const toggleAvailability = async (itemId: string) => {
    const itemToUpdate = menuItems.find(item => item.id === itemId);
    if (!itemToUpdate) return;

    const newAvailability = !itemToUpdate.available;

    const { success, error } = await updateMenuItem(itemId, { available: newAvailability });
    if (success) {
      toast({ title: `${itemToUpdate.name} ${newAvailability ? "agora disponível" : "agora indisponível"}` });
    } else {
      toast({ title: `Erro: ${error}` });
    }
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem({ ...item });
    setIsModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingItem(null);
    setIsModalOpen(false);
  };

  const saveItem = async () => {
    if (!editingItem) return;

    const itemData = {
      name: editingItem.name,
      description: editingItem.description,
      price: editingItem.price,
      category: editingItem.category,
      image: editingItem.image,
      available: editingItem.available,
    };

    if (editingItem.id) {
      const { success, error } = await updateMenuItem(editingItem.id, itemData);
      if (success) {
        toast({ title: "Item atualizado com sucesso" });
      } else {
        toast({ title: `Erro: ${error}` })
      }
    } else {
      const { success, error } = await createMenuItem(itemData);
      if (success) {
        toast({ title: "Item adicionado com sucesso" });
      } else {
        toast({ title: `Erro: ${error}` })
      }
    }

    closeEditModal();
  };

  const addNewItem = () => {
    const newItem = {
      id: null,
      name: "",
      description: "",
      price: 0,
      category: categories[0],
      image: "/diverse-food-spread.png",
      available: true,
    };
    setEditingItem(newItem);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6">
      {/* Header with Category Filter */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={addNewItem}
          className="text-white font-semibold"
          style={{ backgroundColor: "#FD7E14" }}
        >
          + Adicionar Item
        </Button>
      </div>

      {/* Menu Items List */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          /* Empty State */
          <Card className="p-12 text-center">
            <div className="space-y-4">
              <div className="text-6xl">👨‍🍳</div>
              <div className="text-lg text-gray-600">Categoria Vazia.</div>
              <Button
                onClick={addNewItem}
                className="text-white font-semibold"
                style={{ backgroundColor: "#FD7E14" }}
              >
                + Adicionar o primeiro item
              </Button>
            </div>
          </Card>
        ) : (
          filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Drag Handle */}
                  <div className="cursor-grab text-gray-400 hover:text-gray-600">
                    <GripVertical className="w-5 h-5" />
                  </div>

                  {/* Item Image */}
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />

                  {/* Item Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                      {item.description}
                    </p>
                    <div className="text-lg font-semibold text-gray-900 mt-2">
                      R$ {item.price.toFixed(2)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-4">
                    {/* Availability Toggle */}
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={item.available}
                        onCheckedChange={() => toggleAvailability(item.id!)}
                        className="data-[state=checked]:bg-blue-600"
                      />
                      <span
                        className={cn(
                          "text-sm font-medium",
                          item.available ? "text-blue-600" : "text-gray-400"
                        )}
                      >
                        {item.available ? "Disponível" : "Indisponível"}
                      </span>
                    </div>

                    {/* Edit Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(item)}
                      className="hover:bg-gray-50"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Item Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem?.name ? `Edite: ${editingItem.name}` : "Novo Item"}
            </DialogTitle>
          </DialogHeader>

          {editingItem && (
            <div className="space-y-6 py-4">
              {/* Item Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Item</Label>
                <Input
                  id="name"
                  value={editingItem.name}
                  onChange={(e) =>
                    setEditingItem((prev) =>
                      prev ? { ...prev, name: e.target.value } : null
                    )
                  }
                  placeholder="Escreva o nome do Item"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={editingItem.description}
                  onChange={(e) =>
                    setEditingItem((prev) =>
                      prev ? { ...prev, description: e.target.value } : null
                    )
                  }
                  placeholder="Escreva a descrição do item "
                  rows={3}
                />
              </div>

              {/* Price and Category */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={editingItem.price}
                    onChange={(e) =>
                      setEditingItem((prev) =>
                        prev
                          ? {
                            ...prev,
                            price: Number.parseFloat(e.target.value) || 0,
                          }
                          : null
                      )
                    }
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={editingItem.category}
                    onValueChange={(value) =>
                      setEditingItem((prev) =>
                        prev ? { ...prev, category: value } : null
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Imagem</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">
                    Arraste e solte uma imagem aqui ou clique para selecionar
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 bg-transparent"
                  >
                    Escolha arquivo
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeEditModal}>
              Cancelar
            </Button>
            <Button
              onClick={saveItem}
              className="text-white font-semibold"
              style={{ backgroundColor: "#FD7E14" }}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
