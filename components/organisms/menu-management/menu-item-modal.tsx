"use client";

import { Upload } from "lucide-react";
import { Button } from "@/components/atoms/button";
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
import { MenuItemRequestDTO } from "@/app/actions/menu-item-actions";

interface Category {
  id: string | null;
  name: string;
}

interface MenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: MenuItemRequestDTO | null;
  setEditingItem: React.Dispatch<React.SetStateAction<MenuItemRequestDTO | null>>;
  categories: Category[];
  onSave: () => Promise<void>;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export const MenuItemModal = ({
  isOpen,
  onClose,
  editingItem,
  setEditingItem,
  categories,
  onSave,
  onImageChange,
  fileInputRef,
}: MenuItemModalProps) => {
  if (!editingItem) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingItem.name ? `Edite: ${editingItem.name}` : "Novo Item"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Item</Label>
            <Input
              id="name"
              value={editingItem.name}
              onChange={(e) =>
                setEditingItem((prev) => (prev ? { ...prev, name: e.target.value } : null))
              }
              placeholder="Escreva o nome do Item"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={editingItem.description}
              onChange={(e) =>
                setEditingItem((prev) => (prev ? { ...prev, description: e.target.value } : null))
              }
              placeholder="Escreva a descrição do item "
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                type="number"
                step="1"
                value={editingItem.price === 0 ? "" : editingItem.price}
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
                value={editingItem.categoryId}
                onValueChange={(value) =>
                  setEditingItem((prev) => (prev ? { ...prev, categoryId: value } : null))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id!} value={category.id!}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Imagem</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              {editingItem.imageUrl && editingItem.imageUrl !== "/placeholder-img.svg" ? (
                <img
                  src={editingItem.imageUrl}
                  alt="Pré-visualização da imagem"
                  className="w-32 h-32 object-cover rounded-lg mx-auto mb-2"
                />
              ) : (
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              )}
              <div className="text-sm text-gray-600">
                Arraste e solte uma imagem aqui ou clique para selecionar
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={onImageChange}
                accept="image/*"
                className="hidden"
              />

              <Button
                variant="outline"
                size="sm"
                className="mt-2 bg-transparent"
                onClick={() => fileInputRef.current?.click()}
              >
                Escolha arquivo
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={onSave}
            className="text-white font-semibold"
            style={{ backgroundColor: "#FD7E14" }}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
