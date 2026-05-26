"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { PublicMenuItem } from "@/app/actions/public-menu-actions";
import { PLACEHOLDER_IMAGE_URL } from "@/lib/constants";
import Image from "next/image";

interface ProductCardProps {
  item: PublicMenuItem;
  onAdd: (item: PublicMenuItem) => void;
}

export function ProductCard({ item, onAdd }: ProductCardProps) {
  const imageUrl = item.imageUrl && item.imageUrl !== "" ? item.imageUrl : PLACEHOLDER_IMAGE_URL;

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col h-full">
      {/* Imagem */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-50 flex-shrink-0">
        <Image
          src={imageUrl}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Conteúdo */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-gray-900 line-clamp-1 mb-1">
          {item.name}
        </h3>
        
        <p className="text-sm text-gray-500 line-clamp-2 flex-1 min-h-[40px] mb-4">
          {item.description}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <span className="text-lg font-bold text-blue-600">
            R$ {item.price.toFixed(2).replace(".", ",")}
          </span>
          
          <Button
            onClick={() => onAdd(item)}
            size="sm"
            className="rounded-full h-9 px-4 bg-gray-900 hover:bg-blue-600 hover:scale-105 transition-all shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3px]" />
            <span className="font-semibold text-sm">Adicionar</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
