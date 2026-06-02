"use client";

import { useState, useMemo, useTransition } from "react";
import {
  PublicMenuData,
  PublicMenuItem,
} from "@/app/actions/public-menu-actions";
import { createPublicOrder } from "@/app/actions/public-order-actions";
import { CategoryFilter } from "./category-filter";
import { ProductCard } from "./product-card";
import { useCart } from "@/hooks/use-cart";
import { CartDrawer } from "./cart-drawer";
import { CartSummary } from "./cart-summary";
import { CheckoutModal } from "./checkout-modal";
import { OrderConfirmation } from "./order-confirmation";
import { CheckoutData } from "@/lib/validators/checkout";
import { Search, ShoppingBag, X, AlertCircle, Loader2 } from "lucide-react";

export function PublicMenuView({
  establishment,
  categories,
  menuItems,
}: PublicMenuData) {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const cart = useCart();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const [confirmationData, setConfirmationData] = useState<{
    orderId: string;
    dailySeq: number;
    phone: string;
  } | null>(null);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        !activeCategoryId || item.categoryId === activeCategoryId;
      const matchesSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [menuItems, activeCategoryId, searchQuery]);

  const handleAddToCart = (item: PublicMenuItem) => {
    cart.addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
    });

    setIsCartOpen(true);
  };

  const handleProceedToCheckout = () => {
    try {
      cart.cartInstance.validateForCheckout();
      setErrorMessage(null);
      setIsCartOpen(false);
      setIsCheckoutOpen(true);
    } catch (error: any) {
      setErrorMessage(error.message || "Verifique os itens do seu carrinho.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleCheckoutSubmit = async (data: CheckoutData) => {
    startTransition(async () => {
      try {
        setErrorMessage(null);
        const orderLines = cart.items.map((item) => ({
          menuItemId: item.menuItemId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          observation: item.observation,
        }));

        const result = await createPublicOrder(establishment.id, {
          ...data,
          orderLines,
        });

        setIsCheckoutOpen(false);
        cart.clear();
        setConfirmationData({
          orderId: result.orderId,
          dailySeq: result.dailySeq,
          phone: data.phone,
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (error: any) {
        setErrorMessage(
          error.message || "Erro ao processar o pedido. Tente novamente.",
        );
      }
    });
  };

  if (confirmationData) {
    return (
      <OrderConfirmation
        orderId={confirmationData.orderId}
        dailySeq={confirmationData.dailySeq}
        phone={confirmationData.phone}
        establishmentName={establishment.name}
        onNewOrder={() => setConfirmationData(null)}
      />
    );
  }

  return (
    <div className="pb-32 relative">
      {errorMessage && (
        <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm font-medium">{errorMessage}</div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-500 hover:text-red-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="text-left space-y-1">
          <h2 className="text-2xl md:text-3xl font-black text-neutral-900 tracking-tight">
            Menu Principal
          </h2>
          <p className="text-sm text-neutral-500">
            Escolha os itens frescos abaixo para montar seu combo.
          </p>
        </div>

        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-[#FD7E14] transition-colors" />
          <input
            type="text"
            placeholder="Buscar no cardápio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm placeholder-neutral-400 focus:outline-none focus:border-[#FD7E14] focus:ring-4 focus:ring-[#FD7E14]/10 transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {categories.length > 0 && (
        <div className="sticky top-16 z-30 bg-neutral-50/90 backdrop-blur-md py-3 -mx-4 px-4 mb-6 border-b border-neutral-100/50">
          <CategoryFilter
            categories={categories}
            activeCategoryId={activeCategoryId}
            onSelectCategory={setActiveCategoryId}
          />
        </div>
      )}

      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => (
            <ProductCard key={item.id} item={item} onAdd={handleAddToCart} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-neutral-200/60 shadow-sm flex flex-col items-center justify-center p-6">
          <div className="w-12 h-12 rounded-full bg-neutral-50 flex items-center justify-center mb-3">
            <ShoppingBag className="w-6 h-6 text-neutral-400" />
          </div>
          <h3 className="text-base font-bold text-neutral-800">
            Nenhum item disponível
          </h3>
          <p className="text-neutral-500 text-sm max-w-xs mt-1">
            Não encontramos resultados para a sua busca ou categoria
            selecionada.
          </p>
        </div>
      )}

      <CartSummary
        onClick={() => setIsCartOpen(true)}
        itemsCount={cart.itemsCount}
        total={cart.total}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onCheckout={handleProceedToCheckout}
      />

      <div className={isPending ? "pointer-events-none opacity-80" : ""}>
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => !isPending && setIsCheckoutOpen(false)}
          onBack={() => {
            if (!isPending) {
              setIsCheckoutOpen(false);
              setIsCartOpen(true);
            }
          }}
          cartTotal={cart.total}
          onSubmit={handleCheckoutSubmit}
        />
      </div>

      {isPending && (
        <div className="fixed inset-0 bg-neutral-950/20 backdrop-blur-[1px] z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-xl shadow-xl flex items-center gap-3 font-semibold text-sm text-neutral-800 border">
            <Loader2 className="w-5 h-5 text-[#FD7E14] animate-spin" />
            Processando seu pedido...
          </div>
        </div>
      )}
    </div>
  );
}
