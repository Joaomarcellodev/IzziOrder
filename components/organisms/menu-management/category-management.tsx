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
        <h2 className="text-xl font-bold">Gerenciar Categorias</h2>

        <Button
          onClick={onAddCategory}
          className="text-white font-semibold px-3 h-8 text-sm"
          style={{ backgroundColor: "#FD7E14" }}
        >
          <Plus className="w-4 h-4 mr-1" />
          Adicionar Categoria
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <div key={category.id} className="flex items-center p-2 bg-gray-100 rounded-md">
            <span className="text-sm font-medium mr-2">{category.name}</span>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onEditCategory(category)}
              className="h-8 w-8"
            >
              <SquarePen className="w-4 h-4 text-gray-500 hover:text-gray-700" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onDeleteCategory(category)}
              className="h-8 w-8"
            >
              <Trash className="w-4 h-4 text-red-500 hover:text-red-700" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
