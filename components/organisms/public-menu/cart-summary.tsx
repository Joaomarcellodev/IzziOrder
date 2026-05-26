"use client";

import { ShoppingBag } from "lucide-react";

interface CartSummaryProps {
  itemsCount: number;
  total: number;
  onClick: () => void;
}

export function CartSummary({ itemsCount, total, onClick }: CartSummaryProps) {
  if (itemsCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-200 z-40 transform transition-all duration-300 md:hidden">
      <div className="container mx-auto max-w-4xl">
        <button
          onClick={onClick}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingBag className="h-6 w-6" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-blue-600">
                {itemsCount}
              </span>
            </div>
            <span className="font-semibold text-left leading-tight">
              Ver Carrinho <br />
              <span className="text-xs font-normal opacity-80">
                Finalizar pedido
              </span>
            </span>
          </div>

          <div className="font-bold text-lg">
            R$ {total.toFixed(2).replace(".", ",")}
          </div>
        </button>
      </div>
    </div>
  );
}
