// File: src/components/molecules/edit-order-modal.tsx

import React, { useState, useEffect } from "react"; // 💡 Importar useEffect
import { Order } from "@/app/actions/orders";
import { MenuItem } from "@/app/actions/menuItem";
import { Category } from "@/app/actions/category";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../molecules/dialog"; 
import { Button } from "../atoms/button";
import { toast } from "sonner";

interface EditOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null; // 💡 Ajustado para Order | null
  onUpdateOrder: (updatedOrder: Order) => void;
  menuItems: MenuItem[];
  categories: Category[];
}

export function EditOrderModal({ 
    isOpen, 
    onClose, 
    order, 
    onUpdateOrder, 
    menuItems, 
    categories 
}: EditOrderModalProps) {
  
  // 1. INICIALIZAÇÃO SEGURA: Use valores padrão (vazio/OPEN)
  const [editedCustomerName, setEditedCustomerName] = useState("");
  const [editedStatus, setEditedStatus] = useState<Order['status']>("OPEN"); 
  // ... (outros estados para itens, se houver)

  // 2. SINCRONIZAÇÃO NO CLIENTE: Atualiza o estado quando a prop 'order' muda
  useEffect(() => {
    if (order) {
        setEditedCustomerName(order.customerName);
        setEditedStatus(order.status);
    }
  }, [order]); // Roda apenas no lado do cliente e quando 'order' é atualizado


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!order) {
      toast.error("Erro", { description: "Pedido não encontrado para edição." });
      return;
    }

    const updatedOrder: Order = {
      ...order,
      customerName: editedCustomerName,
      status: editedStatus, 
    };

    onUpdateOrder(updatedOrder);
  };
  
  // 💡 Adicionando um retorno antecipado de segurança (como no ViewOrderModal)
  if (!order) {
      return null;
  }
  
  // Agora o resto do componente usa os estados internos sincronizados (editedCustomerName, editedStatus)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Pedido {order.code}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          
          {/* Campo de Edição do Nome do Cliente */}
          <div>
            <label className="text-sm font-medium">Nome do Cliente</label>
            <input 
              type="text" 
              value={editedCustomerName} 
              onChange={(e) => setEditedCustomerName(e.target.value)} 
              className="mt-1 block w-full border rounded-md p-2"
            />
          </div>

          {/* Campo de Edição de Status */}
          <div>
            <label className="text-sm font-medium">Status</label>
            <select 
              value={editedStatus} 
              onChange={(e) => setEditedStatus(e.target.value as Order['status'])}
              className="mt-1 block w-full border rounded-md p-2"
            >
                <option value="OPEN">Aberto</option>
                <option value="CLOSED">Finalizado</option>
            </select>
          </div>
          
          <p className="text-sm text-gray-500">
            * Implementar aqui a lógica de seleção e edição de itens.
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={onClose} type="button">Cancelar</Button>
            <Button type="submit">Salvar Edição</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}