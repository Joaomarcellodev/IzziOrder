"use client";

import { ChevronDown, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export interface CategoryFilterProps {
  categories: { id: string; name: string }[];
  activeCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export function CategoryFilter({
  categories,
  activeCategoryId,
  onSelectCategory,
}: CategoryFilterProps) {
  // Identifica o nome da categoria atual para exibir dinamicamente no botão
  const activeCategoryLabel =
    categories.find((c) => c.id === activeCategoryId)?.name ||
    "Todas as Categorias";

  return (
    <div className="w-full flex justify-start sm:justify-center my-2">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            className={cn(
              "h-11 px-5 rounded-xl border font-bold text-xs uppercase tracking-wider shadow-sm",
              "flex items-center gap-2.5 transition-all duration-200 active:scale-95 outline-none",
              activeCategoryId !== null
                ? "bg-[#FD7E14]/5 border-[#FD7E14]/30 text-[#FD7E14] shadow-[#FD7E14]/5"
                : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300",
            )}
          >
            <Layers
              className={cn(
                "w-4 h-4",
                activeCategoryId !== null
                  ? "text-[#FD7E14]"
                  : "text-neutral-400",
              )}
            />

            <span>{activeCategoryLabel}</span>

            <ChevronDown className="w-4 h-4 opacity-60 ml-1 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="start"
            sideOffset={6}
            className="z-50 w-64 bg-white rounded-2xl p-1.5 shadow-xl border border-neutral-100 animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Opção padrão: Todas */}
            <DropdownMenu.Item
              onClick={() => onSelectCategory(null)}
              className={cn(
                "flex items-center w-full px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer outline-none transition-colors select-none mb-0.5",
                activeCategoryId === null
                  ? "bg-[#FD7E14] text-white"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900",
              )}
            >
              Todas as Categorias
            </DropdownMenu.Item>

            <DropdownMenu.Separator className="h-px bg-neutral-100 my-1" />

            {/* Lista Rolável de Categorias */}
            <div className="max-h-64 overflow-y-auto hide-scrollbar">
              {categories.map((category) => {
                const isActive = activeCategoryId === category.id;
                return (
                  <DropdownMenu.Item
                    key={category.id}
                    onClick={() => onSelectCategory(category.id)}
                    className={cn(
                      "flex items-center w-full px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer outline-none transition-colors select-none mb-0.5 last:mb-0",
                      isActive
                        ? "bg-[#FD7E14] text-white"
                        : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900",
                    )}
                  >
                    {category.name}
                  </DropdownMenu.Item>
                );
              })}
            </div>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
