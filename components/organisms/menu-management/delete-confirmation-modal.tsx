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

interface ItemDeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string | undefined;
  onConfirm: () => Promise<void>;
}

export const ItemDeleteConfirmationModal = ({
  isOpen,
  onClose,
  itemName,
  onConfirm,
}: ItemDeleteConfirmationModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Tem certeza que deseja excluir o item "{itemName}"?
          </DialogTitle>
          <DialogDescription>
            Esta ação é permanente e removerá o item do seu menu.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface CategoryDeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryName: string;
  onConfirm: () => Promise<void>;
}

export const CategoryDeleteConfirmationModal = ({
  isOpen,
  onClose,
  categoryName,
  onConfirm,
}: CategoryDeleteConfirmationModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Tem certeza que deseja excluir a categoria "{categoryName}"?
          </DialogTitle>
          <DialogDescription>
            Esta ação é permanente e removerá a categoria e todos os itens de menu associados a ela.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
