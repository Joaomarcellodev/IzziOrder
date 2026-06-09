"use client";

import { Plus, SquarePen, Trash } from "lucide-react";
import { Button } from "@/components/atoms/button";

interface Category {
  id: string | null;
  name: string;
}

interface CategoryManagementProps {
  categories: Category[];
  onAddCategory: () => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (category: Category) => void;
}

export const CategoryManagement = ({
  categories,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}: CategoryManagementProps) => {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div>
  <h2 className="text-xl font-bold text-gray-900">Gerenciar Categorias</h2>
  <p className="text-sm text-gray-500 mt-1">{categories.length} categorias cadastradas</p>
</div>

        <Button
          onClick={onAddCategory}
          className="text-white font-semibold px-3 h-8 text-sm"
          style={{ backgroundColor: "#FD7E14" }}
        >
          <Plus className="w-4 h-4 mr-1" />
          Adicionar Categoria
        </Button>
      </div>
      {categories.length === 0 ? (
  <div className="text-center py-12 text-gray-400">
    <p className="text-lg">Nenhuma categoria cadastrada.</p>
    <p className="text-sm mt-1">Adicione uma categoria para organizar seu cardápio.</p>
  </div>
) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
  {categories.map((category) => (
    <div key={category.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <span className="text-sm font-semibold text-gray-800">{category.name}</span>
<div className="flex items-center gap-1">
  <Button
    size="icon"
    variant="ghost"
    onClick={() => onEditCategory(category)}
    className="h-8 w-8 text-gray-400 hover:text-gray-700 hover:bg-gray-100"
  >
    <SquarePen className="w-4 h-4" />
  </Button>
  <Button
    size="icon"
    variant="ghost"
    onClick={() => onDeleteCategory(category)}
    className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
  >
    <Trash className="w-4 h-4" />
  </Button>
</div>
          </div>
        ))}
      </div>
      )}
    </div> 
  );
};
