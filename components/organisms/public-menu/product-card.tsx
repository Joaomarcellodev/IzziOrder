"use client";

import { Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { PublicMenuItem } from "@/app/actions/public-menu-actions";
import { PLACEHOLDER_IMAGE_URL } from "@/lib/constants";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  item: PublicMenuItem;
  onAdd: (item: PublicMenuItem) => void;
}

export function ProductCard({ item, onAdd }: ProductCardProps) {
  const imageUrl =
    item.imageUrl && item.imageUrl !== ""
      ? item.imageUrl
      : PLACEHOLDER_IMAGE_URL;

  const isAvailable = item.available !== false;

  return (
    <div
      className={cn(
        "group bg-white rounded-2xl border border-neutral-100/80 shadow-sm transition-all duration-300 flex flex-row sm:flex-col h-36 sm:h-full overflow-hidden w-full",
        isAvailable
          ? "hover:shadow-md hover:border-neutral-200/60"
          : "opacity-60 grayscale-[30%] pointer-events-none select-none bg-neutral-50/50",
      )}
    >
      <div className="relative aspect-square w-32 sm:aspect-video sm:w-full overflow-hidden bg-neutral-50 shrink-0">
        <Image
          src={imageUrl}
          alt={item.name}
          fill
          className={cn(
            "object-cover transition-transform duration-500",
            isAvailable && "group-hover:scale-105",
          )}
          sizes="(max-width: 640px) 128px, (max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {!isAvailable && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center p-1">
            <span className="bg-white text-neutral-900 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md shadow-sm">
              Esgotado
            </span>
          </div>
        )}
      </div>

      {/* SEÇÃO DE CONTEÚDO */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between min-w-0">
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-black text-neutral-900 line-clamp-1 group-hover:text-[#FD7E14] transition-colors">
            {item.name}
          </h3>

          <p className="text-xs sm:text-sm text-neutral-500 line-clamp-2 sm:line-clamp-2 sm:min-h-[40px]">
            {item.description || "Sem descrição disponível para este produto."}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 mt-2 sm:mt-4">
          <div className="flex flex-col">
            <span className="text-base sm:text-xl font-black text-[#FD7E14] tracking-tight">
              R$ {item.price.toFixed(2).replace(".", ",")}
            </span>
          </div>

          <Button
            onClick={() => isAvailable && onAdd(item)}
            disabled={!isAvailable}
            size="sm"
            className={cn(
              "rounded-xl h-9 px-3 sm:px-4 bg-neutral-900 text-white font-bold text-xs tracking-wide transition-all shadow-sm flex items-center gap-1.5 active:scale-95",
              isAvailable &&
                "hover:bg-[#FD7E14] hover:shadow-[#FD7E14]/20 hover:scale-105",
            )}
          >
            <Plus className="w-3.5 h-3.5 stroke-[3px]" />
            <span className="hidden xs:inline sm:inline">Adicionar</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
