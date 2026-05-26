"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { CartItem } from "@/lib/entities/cart";
import Image from "next/image";
import { PLACEHOLDER_IMAGE_URL } from "@/lib/constants";

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onUpdateObservation?: (id: string, obs: string) => void;
}

export function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
  onUpdateObservation,
}: CartItemRowProps) {
  const imageUrl =
    item.imageUrl && item.imageUrl !== ""
      ? item.imageUrl
      : PLACEHOLDER_IMAGE_URL;

  return (
    <div className="flex gap-4 py-4 border-b border-gray-100 last:border-0 relative group">
      {/* Imagem (Ocultar em telas muito pequenas se quiser, mas aqui mantemos pequena) */}
      <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 shadow-sm border border-gray-100">
        <Image
          src={imageUrl}
          alt={item.name}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div className="flex justify-between items-start gap-2">
          <h4 className="font-bold text-gray-900 leading-tight line-clamp-2">
            {item.name}
          </h4>
          <button
            onClick={() => onRemove(item.menuItemId)}
            className="text-gray-400 hover:text-red-500 transition-colors p-1 -mr-1 rounded-md hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Campo de observação (opcional) */}
        {onUpdateObservation && (
          <Input
            value={item.observation || ""}
            onChange={(e) =>
              onUpdateObservation(item.menuItemId, e.target.value)
            }
            placeholder="Ex: Sem cebola"
            className="h-7 text-xs px-2 mt-1 mb-2 bg-gray-50 border-gray-200"
          />
        )}

        <div className="flex justify-between items-center mt-auto pt-1">
          <div className="flex items-center gap-3 bg-gray-100/80 rounded-lg p-1 border border-gray-200/60 shadow-sm">
            <button
              onClick={() => onUpdateQuantity(item.menuItemId, item.quantity - 1)}
              className="h-6 w-6 flex items-center justify-center rounded-md bg-white text-gray-600 hover:text-blue-600 shadow-sm transition-colors disabled:opacity-50"
              disabled={item.quantity <= 1}
            >
              <Minus className="h-3 w-3 stroke-[3px]" />
            </button>
            <span className="w-4 text-center font-bold text-sm text-gray-800">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.menuItemId, item.quantity + 1)}
              className="h-6 w-6 flex items-center justify-center rounded-md bg-white text-gray-600 hover:text-blue-600 shadow-sm transition-colors"
            >
              <Plus className="h-3 w-3 stroke-[3px]" />
            </button>
          </div>

          <span className="font-bold text-gray-900">
            R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}
          </span>
        </div>
      </div>
    </div>
  );
}
