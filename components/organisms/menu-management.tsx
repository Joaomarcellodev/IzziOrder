"use client";

import { useState, useRef, useCallback } from "react";
import { Plus } from "lucide-react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Button } from "@/components/atoms/button";
import { Card } from "@/components/molecules/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/organisms/select";
import { useToast } from "@/hooks/use-toast";
import {
  createMenuItem,
  updateMenuItem,
  updateMenuItemAvailability,
  deleteMenuItem as serverDeleteMenuItem,
  updateMenuOrdernation,
  MenuItem,
  MenuItemRequestDTO,
} from "@/app/actions/menu-item-actions";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/app/actions/category-actions";
import { validateMenuItem } from "@/lib/validators/menuItem";

// Subcomponents
import { MenuItemCard } from "./menu-management/menu-item-card";
import { MenuItemModal } from "./menu-management/menu-item-modal";
import { CategoryModal } from "./menu-management/category-modal";
import { CategoryEditModal } from "./menu-management/category-edit-modal";
import {
  ItemDeleteConfirmationModal,
  CategoryDeleteConfirmationModal,
} from "./menu-management/delete-confirmation-modal";
import { CategoryManagement } from "./menu-management/category-management";

// Interfaces
interface Category {
  id: string | null;
  name: string;
}

interface MenuManagementProps {
  menuItems: MenuItem[];
  categories: Category[];
}

export function MenuManagement({
  menuItems: initialMenuItems,
  categories: initialCategories,
}: MenuManagementProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [editingItem, setEditingItem] = useState<MenuItemRequestDTO | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryToEditId, setCategoryToEditId] = useState("");

  const [localMenuItems, setLocalMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [localCategories, setLocalCategories] = useState<Category[]>(initialCategories || []);
  const { toast } = useToast();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados de Exclusão
  const [isDeleteItemModalOpen, setIsDeleteItemModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
  const [categoryToDeleteId, setCategoryToDeleteId] = useState("");
  const [categoryToDeleteName, setCategoryToDeleteName] = useState("");

  const filteredItems =
    selectedCategory === "All"
      ? localMenuItems
      : localMenuItems.filter((item) => item.categoryId === selectedCategory);

  const toggleAvailability = async (itemId: string) => {
    const itemToUpdate = localMenuItems.find((item) => item.id === itemId);
    if (!itemToUpdate) return;

    const newAvailability = !itemToUpdate.available;

    const { success, error } = await updateMenuItemAvailability(itemId, newAvailability);
    if (success) {
      setLocalMenuItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId ? { ...item, available: newAvailability } : item
        )
      );
      toast({
        title: `${itemToUpdate.name} ${newAvailability ? "agora disponível" : "agora indisponível"}`,
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
      setLocalMenuItems((prevItems) => prevItems.filter((item) => item.id !== itemToDelete.id));
      toast({
        title: "Item excluído com sucesso!",
        description: `O item '${itemToDelete.name}' foi removido do menu.`,
      });
    } else {
      toast({
        title: "Erro ao excluir item",
        description: error,
      });
    }

    setItemToDelete(null);
  };

  const openEditModal = (item: MenuItemRequestDTO) => {
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
      setEditingItem((prev) => (prev ? { ...prev, imageUrl: URL.createObjectURL(file) } : null));
    }
  };

  const saveItem = async () => {
    if (!editingItem) return;

    const errors = validateMenuItem(editingItem);
    if (errors.length > 0) {
      toast({ title: `Erro: ${errors.join("\n")}` });
      return;
    }

    if (imageFile) {
      editingItem.imageFile = imageFile;
    }

    if (editingItem.id) {
      const { success, error, data } = await updateMenuItem(editingItem.id, editingItem);
      if (success && data) {
        setLocalMenuItems((prevItems) =>
          prevItems.map((item) => (item.id === data.id ? data : item))
        );
      } else {
        toast({ title: `Erro: ${error}` });
      }
    } else {
      const { success, error, data } = await createMenuItem(editingItem);
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
      categoryId: "",
      image: "/placeholder-img.svg",
      imageFile: null,
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

    const { success, data, error } = await updateCategory(category.id!, trimmedName);

    if (success && data) {
      setLocalCategories((prev) => prev.map((cat) => (cat.id === data.id ? data : cat)));

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
      setLocalCategories((prev) => prev.filter((cat) => cat.id !== categoryToDeleteId));
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
      });
    }
  }, [localMenuItems, toast]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-4 sm:p-6">
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex-1 min-w-0">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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

          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              onClick={addNewItem}
              className="w-full sm:w-auto text-white font-semibold"
              style={{ backgroundColor: "#FD7E14" }}
            >
              <Plus className="w-4 h-4 mr-2" /> Adicionar Item
            </Button>
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

        {/* Gerenciar Categorias */}
        <CategoryManagement
          categories={localCategories}
          onAddCategory={addNewCategory}
          onEditCategory={openEditCategoryModal}
          onDeleteCategory={openDeleteCategoryModal}
        />

        {/* --- Modais --- */}

        <MenuItemModal
          isOpen={isItemModalOpen}
          onClose={closeItemModal}
          editingItem={editingItem}
          setEditingItem={setEditingItem}
          categories={localCategories}
          onSave={saveItem}
          onImageChange={handleImageChange}
          fileInputRef={fileInputRef}
        />

        <CategoryModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          categoryName={newCategoryName}
          setCategoryName={setNewCategoryName}
          onSave={saveCategory}
        />

        <CategoryEditModal
          isOpen={isEditCategoryModalOpen}
          onClose={() => setIsEditCategoryModalOpen(false)}
          categoryName={newCategoryName}
          setCategoryName={setNewCategoryName}
          onSave={saveEditedCategory}
        />

        <ItemDeleteConfirmationModal
          isOpen={isDeleteItemModalOpen}
          onClose={() => setIsDeleteItemModalOpen(false)}
          itemName={itemToDelete?.name}
          onConfirm={handleConfirmDeleteItem}
        />

        <CategoryDeleteConfirmationModal
          isOpen={isDeleteCategoryModalOpen}
          onClose={() => setIsDeleteCategoryModalOpen(false)}
          categoryName={categoryToDeleteName}
          onConfirm={handleConfirmDeleteCategory}
        />
      </div>
    </DndProvider>
  );
}