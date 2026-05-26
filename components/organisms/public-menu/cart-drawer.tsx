"use client";

import { X, ShoppingBag } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Cart } from "@/lib/entities/cart";
import { CartItemRow } from "./cart-item-row";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

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
  // Prevent scrolling on body when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          "relative w-full md:w-[450px] bg-white h-full flex flex-col shadow-2xl transition-transform duration-300 ease-in-out transform",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-gray-700" />
            <h2 className="text-lg font-bold text-gray-900">Seu Pedido</h2>
            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {cart.itemsCount}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
          {cart.isEmpty ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
              <ShoppingBag className="h-16 w-16 text-gray-300" />
              <p className="text-lg">Seu carrinho está vazio</p>
              <Button onClick={onClose} variant="outline" className="rounded-full">
                Adicionar itens
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-2">
              {cart.items.map((item) => (
                <CartItemRow
                  key={item.menuItemId}
                  item={item}
                  onUpdateQuantity={cart.updateQuantity}
                  onRemove={cart.removeItem}
                  onUpdateObservation={cart.updateObservation}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!cart.isEmpty && (
          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="flex justify-between items-center mb-4 text-gray-900">
              <span className="font-medium">Total</span>
              <span className="text-xl font-bold">
                R$ {cart.total.toFixed(2).replace(".", ",")}
              </span>
            </div>
            <Button
              onClick={onCheckout}
              className="w-full rounded-2xl h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-600/20"
            >
              Avançar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
