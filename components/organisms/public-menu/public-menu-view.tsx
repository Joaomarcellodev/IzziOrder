"use client";

import { useState, useMemo } from "react";
import { PublicMenuData, PublicMenuItem } from "@/app/actions/public-menu-actions";
import { CategoryFilter } from "./category-filter";
import { ProductCard } from "./product-card";
import { useCart } from "@/hooks/use-cart";
import { CartDrawer } from "./cart-drawer";
import { CartSummary } from "./cart-summary";

export function PublicMenuView({
  establishment,
  categories,
  menuItems,
}: PublicMenuData) {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  
  const cart = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

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
        onCheckout={() => {
          // Por enquanto apenas loga
          console.log("Indo para checkout");
          // setIsCartOpen(false); // Mantém aberto por enquanto ou navega
        }} 
      />
    </div>
  );
}
