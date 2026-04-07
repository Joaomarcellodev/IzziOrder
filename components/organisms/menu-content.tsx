import { Button } from "@/components/atoms/button";
import { Card } from "../molecules/card";
import { MenuItemCard } from "./menu-item-card";

interface MenuContentProps {
  items: any[]; 
  onAddItem: () => void;
  onMoveItem: (dragIndex: number, hoverIndex: number) => void;
  onToggleAvailability: (id: string, currentStatus: boolean) => void; 
  onEditItem: (item: any) => void;
  onDeleteItem: (item: any) => void; 
  onDrop: (draggedId: string, targetId: string) => void; 
}

export function MenuContent({
  items,
  onAddItem,
  onMoveItem,
  onToggleAvailability,
  onEditItem,
  onDeleteItem,
  onDrop,
}: MenuContentProps) {
  
  if (items.length === 0) {
    return (
      <Card className="p-12 text-center border-dashed bg-gray-50/50">
        <div className="space-y-4">
          <div className="text-6xl animate-bounce-slow">👨‍🍳</div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-gray-900">Categoria Vazia</h3>
            <p className="text-sm text-gray-500">
              Parece que você ainda não adicionou produtos aqui.
            </p>
          </div>
          <Button
            onClick={onAddItem}
            className="text-white font-semibold bg-[#FD7E14] hover:bg-[#e67212] transition-all"
          >
            + Adicionar o primeiro item
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <MenuItemCard
          key={item.id!}
          item={item}
          index={index}
          moveItem={onMoveItem}
          toggleAvailability={() => onToggleAvailability(item.id!, item.available)}
          openEditModal={onEditItem}
          openDeleteModal={(id) => onDeleteItem(item)} // Ajuste conforme sua função do pai
          onDrop={() => onDrop(item.id, "target-id-logica")} 
        />
      ))}
    </div>
  );
}