"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

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
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Rola para a categoria ativa ao abrir/mudar
  useEffect(() => {
    if (scrollRef.current) {
      const activeElement = scrollRef.current.querySelector('[data-active="true"]');
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center"
        });
      }
    }
  }, [activeCategoryId]);

  return (
    <div className="relative mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 snap-x"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <button
          data-active={activeCategoryId === null}
          onClick={() => onSelectCategory(null)}
          className={cn(
            "flex-none snap-start whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 shadow-sm border",
            activeCategoryId === null
              ? "bg-blue-600 text-white border-blue-600 shadow-blue-200"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
          )}
        >
          Todos
        </button>
        
        {categories.map((category) => {
          const isActive = activeCategoryId === category.id;
          return (
            <button
              key={category.id}
              data-active={isActive}
              onClick={() => onSelectCategory(category.id)}
              className={cn(
                "flex-none snap-start whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 shadow-sm border",
                isActive
                  ? "bg-blue-600 text-white border-blue-600 shadow-blue-200"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              )}
            >
              {category.name}
            </button>
          );
        })}
      </div>
      
      {/* Sombras laterais para indicar scroll */}
      <div className="absolute top-0 right-0 bottom-2 w-8 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none sm:hidden"></div>
      <div className="absolute top-0 left-0 bottom-2 w-8 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none sm:hidden"></div>
    </div>
  );
}
