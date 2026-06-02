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

  useEffect(() => {
    if (scrollRef.current) {
      const activeElement = scrollRef.current.querySelector(
        '[data-active="true"]',
      );
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [activeCategoryId]);

  return (
    <div className="relative w-full">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-2.5 pb-1 snap-x scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-1"
      >
        <button
          data-active={activeCategoryId === null}
          onClick={() => onSelectCategory(null)}
          className={cn(
            "flex-none snap-start whitespace-nowrap rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider border transition-all duration-200 active:scale-95 shadow-sm",
            activeCategoryId === null
              ? "bg-[#FD7E14] text-white border-[#FD7E14] shadow-[#FD7E14]/20 ring-2 ring-[#FD7E14]/10"
              : "bg-white text-neutral-600 border-neutral-200/80 hover:bg-neutral-50 hover:text-neutral-900",
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
                "flex-none snap-start whitespace-nowrap rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider border transition-all duration-200 active:scale-95 shadow-sm",
                isActive
                  ? "bg-[#FD7E14] text-white border-[#FD7E14] shadow-[#FD7E14]/20 ring-2 ring-[#FD7E14]/10"
                  : "bg-white text-neutral-600 border-neutral-200/80 hover:bg-neutral-50 hover:text-neutral-900",
              )}
            >
              {category.name}
            </button>
          );
        })}
      </div>

      <div className="absolute top-0 right-0 bottom-1 w-12 bg-gradient-to-l from-neutral-50/90 to-transparent pointer-events-none md:w-16" />
      <div className="absolute top-0 left-0 bottom-1 w-12 bg-gradient-to-r from-neutral-50/90 to-transparent pointer-events-none md:w-16" />
    </div>
  );
}
