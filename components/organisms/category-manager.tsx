import { Plus, Edit, Trash } from "lucide-react";
import { Button } from "@/components/atoms/button";

interface Category {
  id: string;
  name: string;
}

interface CategoryManagerProps {
  categories: Category[];
  onAddCategory: () => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (category: Category) => void;
}

export function CategoryManager({
  categories,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}: CategoryManagerProps) {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Gerenciar Categorias</h2>

        <Button
          onClick={onAddCategory}
          className="text-white font-semibold px-3 h-8 text-sm bg-[#FD7E14] hover:bg-[#e67212]"
        >
          <Plus className="w-4 h-4 mr-1" />
          Adicionar Categoria
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center p-2 bg-gray-100 rounded-md border border-gray-200"
          >
            <span className="text-sm font-medium mr-2 text-gray-700">
              {category.name}
            </span>
            
            <div className="flex items-center">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onEditCategory(category)}
                className="h-8 w-8 hover:bg-gray-200"
              >
                <Edit className="w-4 h-4 text-gray-500 hover:text-gray-700" />
              </Button>
              
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onDeleteCategory(category)}
                className="h-8 w-8 hover:bg-red-50"
              >
                <Trash className="w-4 h-4 text-red-500 hover:text-red-700" />
              </Button>
            </div>
          </div>
        ))}

        {categories.length === 0 && (
          <p className="text-sm text-gray-400 italic">Nenhuma categoria cadastrada.</p>
        )}
      </div>
    </div>
  );
}