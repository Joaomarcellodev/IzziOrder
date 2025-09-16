"use client";

import { useState, useRef, useCallback } from "react";
import { GripVertical, Edit, Trash, Upload } from "lucide-react";
import { useDrag, useDrop, DndProvider, DropTargetMonitor } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
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
import {
  createMenuItem,
  updateMenuItem,
  updateMenuItemAvailability,
  deleteMenuItem as serverDeleteMenuItem,
} from "@/app/actions/menu";

interface MenuItem {
  id: string | null;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
}

interface MenuItemCardProps {
  item: MenuItem;
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  toggleAvailability: (itemId: string) => Promise<void>;
  openEditModal: (item: MenuItem) => void;
  handleDelete: (itemId: string) => Promise<void>;
}

interface DragItem {
  id: string;
  index: number;
}

// Interface para as props coletadas do useDrop
interface DropCollectedProps {
  handlerId: string | symbol | null;
}

interface MenuManagementProps {
  menuItems: MenuItem[];
}

const categories = [
  "Hambúrgueres",
  "Pizzas",
  "Saladas",
  "Bebidas",
  "Sobremesas",
];

const ItemTypes = {
  CARD: "card",
};

const MenuItemCard = ({
  item,
  index,
  moveItem,
  toggleAvailability,
  openEditModal,
  handleDelete,
}: MenuItemCardProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    DropCollectedProps
  >({
    accept: ItemTypes.CARD,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(draggedItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = draggedItem.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();

      if (!clientOffset) return;

      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveItem(dragIndex, hoverIndex);
      draggedItem.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: () => {
      return { id: item.id!, index: index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <Card
      ref={ref}
      className={cn("hover:shadow-md transition-shadow", {
        "opacity-50": isDragging,
      })}
      data-handler-id={handlerId}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="cursor-grab text-gray-400 hover:text-gray-600">
            <GripVertical className="w-5 h-5" />
          </div>
          <img
            src={item.image || "/placeholder.svg"}
            alt={item.name}
            className="w-16 h-16 rounded-lg object-cover"
          />
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
          <div className="flex items-center gap-4">
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => openEditModal(item)}
              className="hover:bg-gray-50"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(item.id!)}
              className="hover:bg-red-50"
            >
              <Trash className="w-4 h-4 text-red-600" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export function MenuManagement({ menuItems: initialMenuItems }: MenuManagementProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localMenuItems, setLocalMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const { toast } = useToast();

  const filteredItems =
    selectedCategory === "All"
      ? localMenuItems
      : localMenuItems.filter((item) => item.category === selectedCategory);

  const toggleAvailability = async (itemId: string) => {
    const itemToUpdate = localMenuItems.find((item) => item.id === itemId);
    if (!itemToUpdate) return;

    const newAvailability = !itemToUpdate.available;

    const { success, error } = await updateMenuItemAvailability(
      itemId,
      newAvailability
    );
    if (success) {
      setLocalMenuItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId ? { ...item, available: newAvailability } : item
        )
      );
      toast({
        title: `${itemToUpdate.name} ${
          newAvailability ? "agora disponível" : "agora indisponível"
        }`,
      });
    } else {
      toast({ title: `Erro: ${error}` });
    }
  };

  const deleteItem = async (itemId: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este item?")) {
      return;
    }

    const { success, error } = await serverDeleteMenuItem(itemId);

    if (success) {
      setLocalMenuItems((prevItems) =>
        prevItems.filter((item) => item.id !== itemId)
      );
      toast({ title: "Item excluído com sucesso!" });
    } else {
      toast({ title: `Erro ao excluir item: ${error}` });
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

  const validateMenuItem = (item: MenuItem) => {
    const errors: string[] = [];

    if (!item.name || item.name.trim().length < 3) {
      errors.push("O nome deve ter pelo menos 3 caracteres.");
    }

    if (item.price <= 0) {
      errors.push("O preço deve ser maior que zero.");
    }

    return errors;
  };

  const saveItem = async () => {
    if (!editingItem) return;

    const errors = validateMenuItem(editingItem);

    if (errors.length > 0) {
      toast({ title: `Erro: ${errors.join("\n")}` });
      return;
    }

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
        setLocalMenuItems((prevItems) =>
          prevItems.map((item) =>
            item.id === editingItem.id ? { ...item, ...itemData } : item
          )
        );
        toast({ title: "Item atualizado com sucesso" });
      } else {
        toast({ title: `Erro: ${error}` });
      }
    } else {
      const { success, error } = await createMenuItem(itemData);
      if (success) {
        const newItemWithId = { ...editingItem, id: `temp-${Date.now()}` };
        setLocalMenuItems((prevItems) => [...prevItems, newItemWithId]);
        toast({ title: "Item adicionado com sucesso" });
      } else {
        toast({ title: `Erro: ${error}` });
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
      image: "placeholder.svg",
      available: true,
    };
    setEditingItem(newItem);
    setIsModalOpen(true);
  };

  const moveItem = useCallback((dragIndex: number, hoverIndex: number) => {
    setLocalMenuItems((prevItems) => {
      const newItems = [...prevItems];
      const [movedItem] = newItems.splice(dragIndex, 1);
      newItems.splice(hoverIndex, 0, movedItem as MenuItem);
      return newItems;
    });
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Todas as Categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <div>
              <Button
                onClick={addNewItem}
                className="text-white font-semibold"
                style={{ backgroundColor: "#FD7E14" }}
              >
                + Adicionar Item
              </Button>
            </div>
            <div>
              <Button
                onClick={addNewItem}
                className="text-white font-semibold"
                style={{ backgroundColor: "#FD7E14" }}
              >
                + Adicionar Categoria
              </Button>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
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
            filteredItems.map((item, index) => (
              <MenuItemCard
                key={item.id!}
                item={item}
                index={index}
                moveItem={moveItem}
                toggleAvailability={toggleAvailability}
                openEditModal={openEditModal}
                handleDelete={deleteItem}
              />
            ))
          )}
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingItem?.name ? `Edite: ${editingItem.name}` : "Novo Item"}
              </DialogTitle>
            </DialogHeader>
            {editingItem && (
              <div className="space-y-6 py-4">
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
    </DndProvider>
  );
}