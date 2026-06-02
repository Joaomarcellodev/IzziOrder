"use client";

import { ShoppingBag, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CartSummaryProps {
  itemsCount: number;
  total: number;
  onClick: () => void;
}

export function CartSummary({ itemsCount, total, onClick }: CartSummaryProps) {
  if (itemsCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-neutral-50 via-neutral-50/95 to-transparent backdrop-blur-sm z-40 sm:bottom-6 sm:left-auto sm:right-6 sm:p-0 sm:bg-none sm:backdrop-blur-none animate-in fade-in slide-in-from-bottom-6 duration-300">
      <div className="container mx-auto max-w-4xl sm:w-80">
        <button
          onClick={onClick}
          className={cn(
            "w-full bg-[#FD7E14] hover:bg-[#e67212] text-white rounded-2xl p-4 flex items-center justify-between transition-all duration-300",
            "shadow-xl shadow-[#FD7E14]/20 hover:shadow-[#FD7E14]/30",
            "active:scale-[0.98] group relative overflow-hidden",
          )}
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />

          <div className="flex items-center gap-3.5 relative z-10">
            <div className="relative bg-white/15 p-2 rounded-xl">
              <ShoppingBag className="h-5 w-5 text-white" />
              <span className="absolute -top-1.5 -right-1.5 bg-neutral-900 text-white text-[10px] font-black h-5 w-5 flex items-center justify-center rounded-full border-2 border-[#FD7E14] shadow-sm">
                {itemsCount}
              </span>
            </div>

            <div className="text-left">
              <span className="block text-sm font-black tracking-wide uppercase text-white">
                Ver Carrinho
              </span>
              <span className="text-[11px] font-medium text-amber-100/90 flex items-center gap-0.5">
                Avançar para o checkout
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-10 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 font-black text-base tracking-tight">
            <span>R$ {total.toFixed(2).replace(".", ",")}</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </button>
      </div>
    </div>
  );
}
