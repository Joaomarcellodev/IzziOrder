"use client";

import { useState, useMemo } from "react";
import { PublicMenuData, PublicMenuItem } from "@/app/actions/public-menu-actions";
import { createPublicOrder } from "@/app/actions/public-order-actions";
import { CategoryFilter } from "./category-filter";
import { ProductCard } from "./product-card";
import { useCart } from "@/hooks/use-cart";
import { CartDrawer } from "./cart-drawer";
import { CartSummary } from "./cart-summary";
import { CheckoutModal } from "./checkout-modal";
import { OrderConfirmation } from "./order-confirmation";
import { CheckoutData } from "@/lib/validators/checkout";

export function PublicMenuView({
  establishment,
  categories,
  menuItems,
}: PublicMenuData) {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  
  const cart = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  const [confirmationData, setConfirmationData] = useState<{
    orderId: string;
    dailySeq: number;
    phone: string;
  } | null>(null);

  const filteredItems = useMemo(() => {
    if (!activeCategoryId) return menuItems;
    return menuItems.filter((item) => item.categoryId === activeCategoryId);
  }, [menuItems, activeCategoryId]);

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
      setIsCartOpen(false);
      setIsCheckoutOpen(true);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleCheckoutSubmit = async (data: CheckoutData) => {
    try {
      const orderLines = cart.items.map(item => ({
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

      // Sucesso
      setIsCheckoutOpen(false);
      cart.clear();
      setConfirmationData({
        orderId: result.orderId,
        dailySeq: result.dailySeq,
        phone: data.phone,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error: any) {
      throw new Error(error.message || "Erro ao finalizar pedido.");
    }
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
    <div className="pb-24">
      {/* Mensagem de boas-vindas */}
      <div className="mb-8 text-center md:text-left">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
          Faça seu pedido
        </h2>
        <p className="text-gray-500">
          Escolha os itens abaixo e monte seu pedido rapidamente.
        </p>
      </div>

      {/* Filtro de Categorias */}
      {categories.length > 0 && (
        <CategoryFilter
          categories={categories}
          activeCategoryId={activeCategoryId}
          onSelectCategory={setActiveCategoryId}
        />
      )}

      {/* Grid de Produtos */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              onAdd={handleAddToCart}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-500 text-lg">
            Nenhum produto encontrado nesta categoria.
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

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onBack={() => {
          setIsCheckoutOpen(false);
          setIsCartOpen(true);
        }}
        cartTotal={cart.total}
        onSubmit={handleCheckoutSubmit}
      />
    </div>
  );
}
