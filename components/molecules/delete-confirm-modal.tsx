"use client";

import * as React from "react";
import { Button } from "@/components/atoms/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { OrderDTO } from "@/app/auth/orders/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/molecules/dialog";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (orderId: string) => Promise<void>;
  order: OrderDTO | null;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  order,
}: DeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!order) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(order.id!);
      onClose();
    } catch (error) {
      console.error("Erro ao deletar:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const TitleText = `Tem certeza que deseja excluir o pedido "${order.code}"?`;
  const MessageText = "Esta ação é permanente e removerá o pedido do sistema.";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{TitleText}</DialogTitle>
          <DialogDescription>{MessageText}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full sm:flex-1"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="w-full sm:flex-1 bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              "Excluir"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
