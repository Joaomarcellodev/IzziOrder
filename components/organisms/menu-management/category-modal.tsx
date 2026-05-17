"use client";

import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/molecules/dialog";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryName: string;
  setCategoryName: (name: string) => void;
  onSave: () => Promise<void>;
}

export const CategoryModal = ({
  isOpen,
  onClose,
  categoryName,
  setCategoryName,
  onSave,
}: CategoryModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Categoria</DialogTitle>
          <DialogDescription>
            Adicione uma nova categoria para organizar seu menu.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <Label htmlFor="newCategory">Nome da Categoria</Label>
          <Input
            id="newCategory"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Ex: Pizzas, Bebidas, etc."
          />
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
