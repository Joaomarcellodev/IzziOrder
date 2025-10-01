"use client";

import { useState, useRef, useCallback } from "react";
import { GripVertical, Edit, Trash, Upload, Plus, CameraOff } from "lucide-react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/molecules/card";
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
  updateMenuOrdernation,
} from "@/app/actions/menuItem";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/app/actions/category";
import { validateMenuItem } from "@/lib/validators/menuItem";

// Interfaces (Mantidas as originais)
interface MenuItem {
  id: string | null;
  name: string;
  description: string;
  price: number;
  category_id: string;
  image: string;
  available: boolean;
}

interface Category {
  id: string | null;
  name: string;
}

interface MenuItemCardProps {
  item: MenuItem;
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  toggleAvailability: (itemId: string) => Promise<void>;
  openEditModal: (item: MenuItem) => void;
  openDeleteModal: (itemId: string) => void;
  onDrop: (dragIndex: number) => void;
}

interface DragItem {
  id: string;
  index: number;
}

interface DropCollectedProps {
  handlerId: string | symbol | null;
}

interface MenuManagementProps {
  menuItems: MenuItem[];
  categories: Category[];
}

const ItemTypes = {
  CARD: "card",
};

// ---
// ## Componente MenuItemCard (Layout Compacto e Responsivo Horizontal)
// ---

const MenuItemCard = ({
  item,
  index,
  moveItem,
  toggleAvailability,
  openEditModal,
  openDeleteModal,
  onDrop,
}: MenuItemCardProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop<DragItem, void, DropCollectedProps>({
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
    end: (draggedItem, monitor) => {
      if (monitor.didDrop()) {
        onDrop(draggedItem.index);
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Aplica o drop no card
  drop(ref);

  // O drag é aplicado no GripVertical
  const dragRef = drag(useRef<HTMLDivElement>(null));

  const hasImage = item.image && item.image !== "/placeholder-img.svg";

  return (
    <Card
      ref={ref}
      className={cn("hover:shadow-md transition-shadow", {
        "opacity-50": isDragging,
      })}
      data-handler-id={handlerId}
    >
      <CardContent className="p-3 sm:p-4">
        {/* Container Principal: Horizontal e Alinhado ao Centro */}
        <div className="flex items-center gap-3 sm:gap-4">

          {/* Coluna 1: Drag Handle (Sempre visível à esquerda) */}
          <div
            ref={dragRef as any}
            className="cursor-grab text-gray-400 hover:text-gray-600 flex-shrink-0"
            data-handler-id={handlerId}
          >
            <GripVertical className="w-5 h-5" />
          </div>

          {/* Coluna 2: Imagem/Placeholder (Ajustada para Mobile/Desktop) */}
          {hasImage ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover bg-gray-100 flex-shrink-0"
            />
          ) : (
            // Placeholder compacto 
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center border border-gray-200"
            >
              <CameraOff className="w-6 h-6 text-gray-400" />
            </div>
          )}

          {/* Coluna 3: Detalhes do Item (Foco - Expansível) */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {item.name}
            </h3>
            {/* Descrição: Oculta no mobile para manter a compacidade */}
            <p className="text-xs text-gray-500 truncate mt-0.5 hidden md:block">
              {item.description}
            </p>
            <div className="text-base sm:text-lg font-semibold text-gray-900 mt-1">
              R$ {item.price.toFixed(2)}
            </div>
          </div>

          {/* Coluna 4: Disponibilidade e Ações (AJUSTADO PARA COMPACTO) */}
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">

            {/* Disponibilidade: APENAS O SWITCH COM CORREÇÃO DE TAMANHO */}
            <div className="flex items-center flex-shrink-0">
              <Switch
                checked={item.available}
                onCheckedChange={() => toggleAvailability(item.id!)}
                // Classes ajustadas para o Switch compacto (w-9 h-5)
                className="data-[state=checked]:bg-blue-600 w-9 h-5"
              />
              {/* O nome "Disponível" foi removido */}
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-1.5 sm:gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => openEditModal(item)}
                className="h-7 w-7 sm:h-8 sm:w-8"
              >
                <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => openDeleteModal(item.id!)}
                className="h-7 w-7 sm:h-8 sm:w-8"
              >
                <Trash className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ---
// ## Componente MenuManagement (Com Modificações no Layout)
// ---

export function MenuManagement({
  menuItems: initialMenuItems,
  categories: initialCategories,
}: MenuManagementProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryToEditId, setCategoryToEditId] = useState("");

  const [localMenuItems, setLocalMenuItems] =
    useState<MenuItem[]>(initialMenuItems);
  const [localCategories, setLocalCategories] = useState<Category[]>(
    initialCategories || []
  );
  const { toast } = useToast();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados de Exclusão
  const [isDeleteItemModalOpen, setIsDeleteItemModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] =
    useState(false);
  const [categoryToDeleteId, setCategoryToDeleteId] = useState("");
  const [categoryToDeleteName, setCategoryToDeleteName] = useState("");

  const filteredItems =
    selectedCategory === "All"
      ? localMenuItems
      : localMenuItems.filter((item) => item.category_id === selectedCategory);

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
        title: `${itemToUpdate.name} ${newAvailability ? "agora disponível" : "agora indisponível"
          }`,
      });
    } else {
      toast({
        title: `Erro ao atualizar disponibilidade`,
        description: error,
      });
    }
  };

  const openDeleteModal = (itemId: string) => {
    const item = localMenuItems.find((i) => i.id === itemId);
    if (item) {
      setItemToDelete(item);
      setIsDeleteItemModalOpen(true);
    }
  };

  const handleConfirmDeleteItem = async () => {
    if (!itemToDelete || !itemToDelete.id) return;

    setIsDeleteItemModalOpen(false);

    const { success, error } = await serverDeleteMenuItem(itemToDelete.id);

    if (success) {
      setLocalMenuItems((prevItems) =>
        prevItems.filter((item) => item.id !== itemToDelete.id)
      );
      toast({
        title: "Item excluído com sucesso!",
        description: `O item '${itemToDelete.name}' foi removido do menu.`,
      });
    } else {
      toast({
        title: "Erro ao excluir item",
        description: error,
        variant: "destructive",
      });
    }

    setItemToDelete(null);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem({ ...item });
    setIsItemModalOpen(true);
    setImageFile(null);
  };

  const closeItemModal = () => {
    setEditingItem(null);
    setIsItemModalOpen(false);
    setImageFile(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setEditingItem((prev) =>
        prev ? { ...prev, image: URL.createObjectURL(file) } : null
      );
    }
  };

  const saveItem = async () => {
    if (!editingItem) return;

    const errors = validateMenuItem(editingItem);
    if (errors.length > 0) {
      toast({ title: `Erro: ${errors.join("\n")}` });
      return;
    }

    const formData = new FormData();
    formData.append("name", editingItem.name);
    formData.append("description", editingItem.description);
    formData.append("price", editingItem.price.toString());
    formData.append("category_id", editingItem.category_id);
    formData.append("available", editingItem.available.toString());

    if (imageFile) {
      formData.append("imageFile", imageFile);
    } else {
      formData.append("image", editingItem.image);
    }

    if (editingItem.id) {
      const { success, error, data } = await updateMenuItem(
        editingItem.id,
        formData
      );
      if (success && data) {
        setLocalMenuItems((prevItems) =>
          prevItems.map((item) => (item.id === data.id ? data : item))
        );
        toast({ title: "Item atualizado com sucesso" });
      } else {
        toast({ title: `Erro: ${error}` });
      }
    } else {
      const { success, error, data } = await createMenuItem(formData);
      if (success && data) {
        setLocalMenuItems((prevItems) => [...prevItems, data]);
        toast({ title: "Item adicionado com sucesso" });
      } else {
        toast({ title: `Erro: ${error}` });
      }
    }

    closeItemModal();
  };

  const addNewItem = () => {
    const newItem = {
      id: null,
      name: "",
      description: "",
      price: 0,
      category_id: "",
      image: "/placeholder-img.svg",
      available: true,
    };
    setEditingItem(newItem);
    setIsItemModalOpen(true);
    setImageFile(null);
  };

  const addNewCategory = () => {
    setNewCategoryName("");
    setIsCategoryModalOpen(true);
  };

  const saveCategory = async () => {
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) {
      toast({ title: `Categoria precisa de nome!` });
      return;
    }

    const { success, error, data } = await createCategory(trimmedName);

    if (success && data) {
      setLocalCategories((prev) => [...prev, data]);
      toast({ title: `Categoria "${data.name}" adicionada!` });
    } else {
      toast({ title: `Erro ao adicionar a categoria "${trimmedName}"!` });
    }

    setIsCategoryModalOpen(false);
  };

  const openEditCategoryModal = (category: Category) => {
    setCategoryToEditId(category.id!);
    setNewCategoryName(category.name);
    setIsEditCategoryModalOpen(true);
  };

  const saveEditedCategory = async () => {
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) return;

    const category = localCategories.find((cat) => cat.id === categoryToEditId);
    if (!category) return;

    if (trimmedName === category.name) {
      setIsEditCategoryModalOpen(false);
      return;
    }

    const { success, data, error } = await updateCategory(
      category.id!,
      trimmedName
    );

    if (success && data) {
      setLocalCategories((prev) =>
        prev.map((cat) => (cat.id === data.id ? data : cat))
      );

      toast({ title: `Categoria atualizada para "${data.name}"!` });
    } else {
      toast({ title: `Erro ao atualizar categoria: ${error}` });
    }

    setIsEditCategoryModalOpen(false);
    setCategoryToEditId("");
  };

  const openDeleteCategoryModal = (category: Category) => {
    setCategoryToDeleteId(category.id!);
    setCategoryToDeleteName(category.name);
    setIsDeleteCategoryModalOpen(true);
  };

  const handleConfirmDeleteCategory = async () => {
    const { success, error } = await deleteCategory(categoryToDeleteId);

    if (success) {
      setLocalCategories((prev) =>
        prev.filter((cat) => cat.id !== categoryToDeleteId)
      );
      // Opcionalmente, selecionar "All" se a categoria excluída era a ativa
      if (selectedCategory === categoryToDeleteId) {
        setSelectedCategory("All");
      }

      toast({
        title: `Categoria "${categoryToDeleteName}" foi excluída!`,
      });
    } else {
      toast({
        title: `Erro: "${error}"`,
      });
    }
    setIsDeleteCategoryModalOpen(false);
    setCategoryToDeleteId("");
    setCategoryToDeleteName("");
  };

  const moveItem = useCallback((dragIndex: number, hoverIndex: number) => {
    setLocalMenuItems((prevItems) => {
      const newItems = [...prevItems];
      const [movedItem] = newItems.splice(dragIndex, 1);
      newItems.splice(hoverIndex, 0, movedItem as MenuItem);
      return newItems;
    });
  }, []);

  const handleDrop = useCallback(async () => {
    const newPosition = localMenuItems.map((item) => item.id!);
    const { success, error } = await updateMenuOrdernation(newPosition);

    if (success) {
      toast({
        title: "Ordem atualizada",
        description: "Os itens do menu foram reordenados com sucesso.",
      });
    } else {
      toast({
        title: "Erro ao atualizar a ordem.",
        description: error,
        variant: "destructive",
      });
    }
  }, [localMenuItems, toast]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-4 sm:p-6">
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex-1 min-w-0">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Todas as Categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Todas as Categorias</SelectItem>
                {localCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id!}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Botões de Ação: APENAS ADICIONAR ITEM */}
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              onClick={addNewItem}
              className="w-full sm:w-auto text-white font-semibold"
              style={{ backgroundColor: "#FD7E14" }}
            >
              <Plus className="w-4 h-4 mr-2" /> Adicionar Item
            </Button>
            {/* O botão 'Adicionar Categoria' foi movido para baixo */}
          </div>
        </div>

        {/* Lista de Itens do Menu */}
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
                openDeleteModal={openDeleteModal}
                onDrop={handleDrop}
              />
            ))
          )}
        </div>

        {/* Gerenciar Categorias - SEÇÃO MODIFICADA */}
        <div className="mt-8">
          {/* Nova div para alinhamento do título e botão */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Gerenciar Categorias</h2>
            
            {/* Botão Adicionar Categoria movido e ajustado para ser compacto */}
            <Button
              onClick={addNewCategory}
              className="text-white font-semibold px-3 h-8 text-sm"
              style={{ backgroundColor: "#FD7E14" }}
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar Categoria
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {localCategories.map((category) => (
              <div
                key={category.id}
                className="flex items-center p-2 bg-gray-100 rounded-md"
              >
                <span className="text-sm font-medium mr-2">
                  {category.name}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => openEditCategoryModal(category)}
                  className="h-8 w-8"
                >
                  <Edit className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => openDeleteCategoryModal(category)}
                  className="h-8 w-8"
                >
                  <Trash className="w-4 h-4 text-red-500 hover:text-red-700" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* --- Modais --- */}

        {/* Modal de Item (Adicionar/Editar) */}
        <Dialog open={isItemModalOpen} onOpenChange={setIsItemModalOpen}>
          <DialogContent className="max-w-md sm:max-w-2xl">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço (R$)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="1"
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
                      value={editingItem.category_id}
                      onValueChange={(value) =>
                        setEditingItem((prev) =>
                          prev ? { ...prev, category_id: value } : null
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {localCategories.map((category) => (
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
                    {editingItem.image &&
                      editingItem.image !== "/placeholder-img.svg" ? (
                      <img
                        src={editingItem.image}
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
                      onChange={handleImageChange}
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
            )}
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={closeItemModal}>
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

        {/* Modal de Adicionar Categoria */}
        <Dialog
          open={isCategoryModalOpen}
          onOpenChange={setIsCategoryModalOpen}
        >
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
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Ex: Pizzas, Bebidas, etc."
              />
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCategoryModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={saveCategory}
                className="text-white font-semibold"
                style={{ backgroundColor: "#FD7E14" }}
              >
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Editar Categoria */}
        <Dialog
          open={isEditCategoryModalOpen}
          onOpenChange={setIsEditCategoryModalOpen}
        >
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
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Escreva o novo nome"
              />
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditCategoryModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={saveEditedCategory}
                className="text-white font-semibold"
                style={{ backgroundColor: "#FD7E14" }}
              >
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Confirmação para Exclusão de ITEM */}
        <Dialog
          open={isDeleteItemModalOpen}
          onOpenChange={setIsDeleteItemModalOpen}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                Tem certeza que deseja excluir o item "{itemToDelete?.name}"?
              </DialogTitle>
              <DialogDescription>
                Esta ação é permanente e removerá o item do seu menu.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDeleteItemModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleConfirmDeleteItem}>
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Confirmação para Exclusão de CATEGORIA */}
        <Dialog
          open={isDeleteCategoryModalOpen}
          onOpenChange={setIsDeleteCategoryModalOpen}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                Tem certeza que deseja excluir a categoria "
                {categoryToDeleteName}"?
              </DialogTitle>
              <DialogDescription>
                Esta ação é permanente e removerá a categoria e todos os itens
                de menu associados a ela.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDeleteCategoryModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDeleteCategory}
              >
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DndProvider>
  );
}