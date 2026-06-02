"use client";

import { X, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Cart } from "@/lib/entities/cart";
import { CartItemRow } from "./cart-item-row";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: {
    items: Cart["allItems"];
    total: number;
    itemsCount: number;
    isEmpty: boolean;
    updateQuantity: (id: string, qty: number) => void;
    removeItem: (id: string) => void;
    updateObservation: (id: string, obs: string) => void;
  };
  onCheckout: () => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  cart,
  onCheckout,
}: CartDrawerProps) {
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      document.body.style.overflow = "hidden";
    } else {
      const timer = setTimeout(() => setShouldRender(false), 300); // Batendo com a duration-300
      document.body.style.overflow = "unset";
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end items-end sm:items-stretch">
      <div
        className={cn(
          "absolute inset-0 bg-neutral-950/40 backdrop-blur-sm transition-opacity duration-300 ease-in-out",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />

      <div
        className={cn(
          "relative w-full max-h-[90vh] sm:max-h-full sm:w-[460px] bg-white rounded-t-3xl sm:rounded-t-none sm:rounded-l-3xl h-full flex flex-col shadow-2xl transition-all duration-300 ease-in-out transform",
          isOpen
            ? "translate-y-0 sm:translate-y-0 sm:translate-x-0"
            : "translate-y-full sm:translate-y-0 sm:translate-x-full",
        )}
      >
        <div className="w-12 h-1 bg-neutral-200 rounded-full mx-auto my-2.5 shrink-0 sm:hidden" />

        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#FD7E14]/10 p-2 rounded-xl">
              <ShoppingBag className="h-5 w-5 text-[#FD7E14]" />
            </div>
            <div>
              <h2 className="text-base font-black text-neutral-900 tracking-tight">
                Sua Sacola
              </h2>
              <p className="text-[11px] font-medium text-neutral-400">
                Verifique os seus itens
              </p>
            </div>
            <span className="bg-neutral-900 text-white text-xs font-black px-2.5 py-0.5 rounded-lg ml-1">
              {cart.itemsCount}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 rounded-xl transition-all active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 bg-neutral-50/50 space-y-4">
          {cart.isEmpty ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-20 h-20 rounded-full bg-white shadow-sm border border-neutral-100 flex items-center justify-center mb-4">
                <ShoppingBag className="h-10 w-10 text-neutral-300" />
              </div>
              <h3 className="text-base font-bold text-neutral-800">
                Sua sacola está vazia
              </h3>
              <p className="text-neutral-500 text-sm max-w-[240px] mt-1 mb-6">
                Parece que você ainda não escolheu suas delícias. Vamos
                adicionar algo?
              </p>
              <Button
                onClick={onClose}
                variant="outline"
                className="rounded-xl border-neutral-200 text-neutral-700 font-bold text-xs uppercase tracking-wider hover:bg-neutral-50"
              >
                Voltar ao Cardápio
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-2 shadow-sm border border-neutral-100/80 flex flex-col gap-1 divide-y divide-neutral-100">
              {cart.items.map((item) => (
                <div key={item.menuItemId} className="p-2 first:pt-1 last:pb-1">
                  <CartItemRow
                    item={item}
                    onUpdateQuantity={cart.updateQuantity}
                    onRemove={cart.removeItem}
                    onUpdateObservation={cart.updateObservation}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {!cart.isEmpty && (
          <div className="p-5 border-t border-neutral-100 bg-white rounded-t-2xl sm:rounded-none shadow-[0_-8px_24px_rgba(0,0,0,0.02)] shrink-0">
            <div className="flex justify-between items-center mb-4">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Total do Pedido
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold">
                  Sem taxas adicionais
                </span>
              </div>
              <span className="text-2xl font-black text-[#FD7E14] tracking-tight">
                R$ {cart.total.toFixed(2).replace(".", ",")}
              </span>
            </div>

            <Button
              onClick={onCheckout}
              className="w-full rounded-xl h-12 bg-neutral-900 hover:bg-[#FD7E14] text-white font-bold text-sm tracking-wide shadow-lg shadow-neutral-900/10 hover:shadow-[#FD7E14]/20 transition-all duration-300 flex items-center justify-center gap-2 group active:scale-[0.99]"
            >
              Confirmar Itens
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
