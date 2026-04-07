"use client";

import React, { useState, useMemo, useRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Plus } from "lucide-react";
import { Button } from "@/components/atoms/button";

import { CategoryManager } from "./category-manager";
import { MenuContent } from "./menu-content";
import { ItemDialog } from "./item-dialog";
import { CategoryDialog } from "./category-dialog";
import { ConfirmDeleteModal } from "./confirm-delete-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

// 1. Interfaces Internas Estritas (Garantem que ID é string)
interface Category {
  id: string;
  name: string;
  establishment_id?: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  available: boolean;
  categoryId: string;
  index?: number;
}

interface MenuManagementProps {
  menuItems: any[]; // Aceita o que vier do server (com possiveis nulls)
  categories: any[]; 
}

export default function MenuManagement({
  menuItems,
  categories,
}: MenuManagementProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [localCategories, setLocalCategories] = useState<Category[]>(() => 
    categories.map(cat => ({ ...cat, id: cat.id ?? "" }))
  );
  
  const [items, setItems] = useState<MenuItem[]>(() => 
    menuItems.map(item => ({ ...item, id: item.id ?? "" }))
  );

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [isDeleteItemModalOpen, setIsDeleteItemModalOpen] = useState(false);
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);

  const [editingItem, setEditingItem] = useState<any>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [categoryToDeleteName, setCategoryToDeleteName] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredItems = useMemo(() => {
    if (selectedCategory === "All") return items;
    return items.filter((item) => item.categoryId === selectedCategory);
  }, [items, selectedCategory]);

  const addNewItem = () => {
    setEditingItem({
      name: "",
      description: "",
      price: 0,
      categoryId: selectedCategory !== "All" ? selectedCategory : "",
      imageUrl: "",
      available: true,
    });
    setIsItemModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setIsItemModalOpen(true);
  };

  const closeItemModal = () => {
    setEditingItem(null);
    setIsItemModalOpen(false);
  };

  const saveItem = () => {
    console.log("Salvando item:", editingItem);
    closeItemModal();
  };

  const toggleAvailability = (id: string) => {
    setItems(prev =>
      prev.map((item) =>
        item.id === id ? { ...item, available: !item.available } : item,
      ),
    );
  };

  const openDeleteModal = (item: any) => {
    setItemToDelete(item);
    setIsDeleteItemModalOpen(true);
  };

  const handleConfirmDeleteItem = () => {
    setItems(prev => prev.filter((i) => i.id !== itemToDelete.id));
    setIsDeleteItemModalOpen(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingItem) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingItem({ ...editingItem, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const addNewCategory = () => {
    setNewCategoryName("");
    setIsCategoryModalOpen(true);
  };

  const saveCategory = () => {
    const newCat = { id: Math.random().toString(), name: newCategoryName };
    setLocalCategories([...localCategories, newCat]);
    setIsCategoryModalOpen(false);
  };

  const openEditCategoryModal = (category: any) => {
    setNewCategoryName(category.name);
    setIsEditCategoryModalOpen(true);
  };

  const saveEditedCategory = () => {
    setIsEditCategoryModalOpen(false);
  };

  const openDeleteCategoryModal = (category: any) => {
    setCategoryToDeleteName(category.name);
    setIsDeleteCategoryModalOpen(true);
  };

  const handleConfirmDeleteCategory = () => {
    setIsDeleteCategoryModalOpen(false);
  };

  const moveItem = (dragIndex: number, hoverIndex: number) => {
    console.log(`Movendo de ${dragIndex} para ${hoverIndex}`);
  };

  const handleDrop = (index: number) => {
    console.log("Item solto na posição:", index);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-4 sm:p-6 space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Gestão de Cardápio</h1>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48 bg-white">
                <SelectValue placeholder="Todas as Categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Todas as Categorias</SelectItem>
                {localCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={addNewItem}
              className="text-white font-semibold bg-[#FD7E14] hover:bg-[#e67212] shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" /> Adicionar Item
            </Button>
          </div>
        </div>

        <hr className="border-gray-200" />

        <CategoryManager
          categories={localCategories}
          onAddCategory={addNewCategory}
          onEditCategory={openEditCategoryModal}
          onDeleteCategory={openDeleteCategoryModal}
        />

        <div className="pt-4">
          <h2 className="text-xl font-bold mb-4">Itens do Menu</h2>
          <MenuContent
            items={filteredItems}
            onAddItem={addNewItem}
            onMoveItem={moveItem}
            onToggleAvailability={toggleAvailability}
            onEditItem={openEditModal}
            onDeleteItem={openDeleteModal}
            onDrop={handleDrop}
          />
        </div>

        <ItemDialog
          isOpen={isItemModalOpen}
          onOpenChange={setIsItemModalOpen}
          editingItem={editingItem}
          setEditingItem={setEditingItem}
          categories={localCategories}
          onSave={saveItem}
          onClose={closeItemModal}
          handleImageChange={handleImageChange}
          fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>}
        />

        <CategoryDialog
          isOpen={isCategoryModalOpen || isEditCategoryModalOpen}
          onOpenChange={isEditCategoryModalOpen ? setIsEditCategoryModalOpen : setIsCategoryModalOpen}
          title={isEditCategoryModalOpen ? "Editar Categoria" : "Nova Categoria"}
          description="Organize seus produtos por grupos para facilitar a navegação."
          value={newCategoryName}
          onChange={setNewCategoryName}
          onSave={isEditCategoryModalOpen ? saveEditedCategory : saveCategory}
        />

        <ConfirmDeleteModal
          isOpen={isDeleteItemModalOpen}
          onOpenChange={setIsDeleteItemModalOpen}
          onConfirm={handleConfirmDeleteItem}
          title={`Excluir "${itemToDelete?.name}"?`}
          description="Esta ação não pode ser desfeita."
        />

        <ConfirmDeleteModal
          isOpen={isDeleteCategoryModalOpen}
          onOpenChange={setIsDeleteCategoryModalOpen}
          onConfirm={handleConfirmDeleteCategory}
          title={`Excluir Categoria "${categoryToDeleteName}"?`}
          description="Isso afetará os itens vinculados."
        />
      </div>
    </DndProvider>
  );
}