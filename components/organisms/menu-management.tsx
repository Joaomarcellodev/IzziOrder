"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/molecules/tabs";
import { useState, useRef, useCallback, useTransition, useEffect } from "react";
import { Plus, Printer, Download, Upload, Loader2, ChevronDown, MoreHorizontal } from "lucide-react";
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
import { importMenuAction, exportMenuAction } from "@/app/actions/menu-excel-actions";
import { getEstablishmentId } from "@/app/actions/establisment_actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/molecules/dropdown-menu";

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
import { printMenu } from "./menu-management/printable-menu";

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
  const [isSaving, setIsSaving] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isMounted, setIsMounted] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
        setIsActionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados de Exclusão
  const [isDeleteItemModalOpen, setIsDeleteItemModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
  const [categoryToDeleteId, setCategoryToDeleteId] = useState("");
  const [categoryToDeleteName, setCategoryToDeleteName] = useState("");

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("file", file);
      
      const result = await importMenuAction(formData);
      
      if (result.success) {
        toast({ title: "Sucesso!", description: result.message });
        window.location.reload(); 
      } else {
        toast({ title: "Erro na Importação", description: result.error });
      }
      
      if (importInputRef.current) importInputRef.current.value = "";
    });
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const estId = await getEstablishmentId();
      const res = await exportMenuAction(estId as string);
      
      if (res.success && res.base64) {
        const response = await fetch(`data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${res.base64}`);
        const blob = await response.blob();
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = res.filename || "cardapio.xlsx";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        
        toast({ title: "Cardápio exportado com sucesso!" });
      } else {
        toast({ title: "Erro na exportação", description: res.error });
      }
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao gerar arquivo." });
    } finally {
      setIsExporting(false);
    }
  };

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

  const processImageFile = (file: File) => {
    setImageFile(file);
    setEditingItem((prev) => (prev ? { ...prev, imageUrl: URL.createObjectURL(file) } : null));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleImageDrop = (file: File) => {
    processImageFile(file);
  };

  const saveItem = async () => {
    if (!editingItem) return;

    const errors = validateMenuItem(editingItem);
    if (errors.length > 0) {
      toast({ title: `Erro: ${errors.join("\n")}` });
      return;
    }

    setIsSaving(true);
    try {
      if (imageFile) {
        editingItem.imageFile = imageFile;
      }

      if (editingItem.id) {
        // pega o item antes da edição
        const oldItem = localMenuItems.find((item) => item.id === editingItem.id);

        const categoryChanged = oldItem?.categoryId !== editingItem.categoryId;

        const oldCategoryName = localCategories.find((c) => c.id === oldItem?.categoryId)?.name;

        const newCategoryName = localCategories.find((c) => c.id === editingItem.categoryId)?.name;

        const { success, error, data } = await updateMenuItem(editingItem.id, editingItem);

        if (success && data) {
          setLocalMenuItems((prevItems) =>
            prevItems.map((item) => (item.id === data.id ? data : item))
          );

          // toast específico quando a categoria mudou
          if (categoryChanged) {
            toast({
              title: "Categoria atualizada",
              description: ` Categoria "${oldCategoryName}" atualizada para "${newCategoryName}".`,
            });
          } else {
            toast({
              title: "Item atualizado com sucesso",
            });
          }
        } else {
          toast({
            title: "Erro ao atualizar item",
            description: error,
          });
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
    } catch (err) {
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao tentar salvar o item.",
      });
    } finally {
      setIsSaving(false);
    }
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
      setIsCategoryModalOpen(false);
    } else {
      toast({ title: `Erro ao adicionar a categoria "${trimmedName}"!` });
    }
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
      setIsEditCategoryModalOpen(false);
      setCategoryToEditId("");
    } else {
      toast({ title: `Erro ao atualizar categoria: ${error}` });
    }
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
      <Tabs defaultValue="itens">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <TabsList className="flex-shrink-0 bg-white border border-gray-200 p-1 rounded-xl h-auto gap-1">
<TabsTrigger 
  value="itens"
  className="px-4 py-2 text-sm font-semibold rounded-lg data-[state=active]:bg-gray-100 data-[state=active]:text-blue-600 data-[state=active]:shadow-none text-gray-900 hover:text-gray-900"
>
  Itens
</TabsTrigger>
<TabsTrigger 
  value="categorias"
  className="px-4 py-2 text-sm font-semibold rounded-lg data-[state=active]:bg-gray-100 data-[state=active]:text-blue-600 data-[state=active]:shadow-none text-gray-900 hover:text-gray-900"
>
  Categorias
</TabsTrigger>
</TabsList>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input 
              type="file" 
              accept=".xlsx" 
              className="hidden" 
              ref={importInputRef} 
              onChange={handleFileChange} 
            />
            
            <div className="relative" ref={actionsRef}>
              <Button 
                variant="outline" 
                size="sm"
                className="font-semibold h-9" 
                onClick={() => setIsActionsOpen(!isActionsOpen)}
                disabled={isPending || isExporting}
              >
                {isExporting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /><span className="inline">Exportando...</span></>
                ) : isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /><span className="inline">Importando...</span></>
                ) : (
                  <><span className="inline">Ferramentas</span><ChevronDown className="w-4 h-4 ml-2 opacity-50" /></>
                )}
              </Button>

              {isActionsOpen && (
                <div className="absolute right-0 mt-1 w-56 rounded-md border bg-popover text-popover-foreground shadow-md z-50 overflow-hidden">
                  <div className="p-1 flex flex-col gap-1">
                    <button 
                      className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-2 sm:py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                      onClick={() => { setIsActionsOpen(false); handleExport(); }}
                    >
                      <Download className="w-4 h-4 mr-2" /> Exportar Cardápio
                    </button>
                    <button 
                      className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-2 sm:py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                      onClick={() => { setIsActionsOpen(false); handleImportClick(); }}
                    >
                      <Upload className="w-4 h-4 mr-2" /> Importar Cardápio
                    </button>
                    <button 
                      className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-2 sm:py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                      onClick={() => { setIsActionsOpen(false); printMenu({ menuItems: localMenuItems, categories: localCategories }); }}
                    >
                      <Printer className="w-4 h-4 mr-2" /> Imprimir Cardápio
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ABA ITENS */}
        <TabsContent value="itens">
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
        </TabsContent>

        {/* ABA CATEGORIAS */}
        <TabsContent value="categorias">
          <CategoryManagement
            categories={localCategories}
            onAddCategory={addNewCategory}
            onEditCategory={openEditCategoryModal}
            onDeleteCategory={openDeleteCategoryModal}
          />
        </TabsContent>
      </Tabs>

      {/* --- Modais --- */}
      <MenuItemModal
        isOpen={isItemModalOpen}
        onClose={closeItemModal}
        editingItem={editingItem}
        setEditingItem={setEditingItem}
        categories={localCategories}
        onSave={saveItem}
        onImageChange={handleImageChange}
        onImageDrop={handleImageDrop}
        fileInputRef={fileInputRef}
        isSaving={isSaving}
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
