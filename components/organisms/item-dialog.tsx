import { Upload } from "lucide-react";
import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/molecules/dialog";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { Textarea } from "@/components/atoms/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";


interface ItemDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: any; 
  setEditingItem: React.Dispatch<React.SetStateAction<any>>;
  categories: any[];
  onSave: () => void;
  onClose: () => void;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export function ItemDialog({
  isOpen,
  onOpenChange,
  editingItem,
  setEditingItem,
  categories,
  onSave,
  onClose,
  handleImageChange,
  fileInputRef,
}: ItemDialogProps) {
  if (!editingItem) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingItem?.id ? `Edite: ${editingItem.name}` : "Novo Item"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Item</Label>
            <Input
              id="name"
              value={editingItem.name}
              onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
              placeholder="Escreva o nome do Item"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={editingItem.description}
              onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
              placeholder="Escreva a descrição do item"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={editingItem.price === 0 ? "" : editingItem.price}
                onChange={(e) =>
                  setEditingItem({
                    ...editingItem,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={editingItem.categoryId}
                onValueChange={(value) => setEditingItem({ ...editingItem, categoryId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Imagem</Label>
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {editingItem.imageUrl && editingItem.imageUrl !== "/placeholder-img.svg" ? (
                <img
                  src={editingItem.imageUrl}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg mx-auto mb-2"
                />
              ) : (
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              )}
              <div className="text-sm text-gray-600">
                Arraste e solte ou clique para selecionar
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
              <Button variant="outline" size="sm" className="mt-2 bg-transparent">
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
            className="text-white font-semibold bg-[#FD7E14] hover:bg-[#e67212]"
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}