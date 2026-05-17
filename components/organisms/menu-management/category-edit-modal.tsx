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

interface CategoryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryName: string;
  setCategoryName: (name: string) => void;
  onSave: () => Promise<void>;
}

export const CategoryEditModal = ({
  isOpen,
  onClose,
  categoryName,
  setCategoryName,
  onSave,
}: CategoryEditModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Categoria</DialogTitle>
          <DialogDescription>
            Altere o nome da categoria selecionada.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <Label htmlFor="editCategoryName">Novo Nome da Categoria</Label>
          <Input
            id="editCategoryName"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Escreva o novo nome"
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
