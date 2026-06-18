"use client";

import { useState, useCallback, useMemo } from "react";
import { Cart, CartItem } from "@/lib/entities/cart";

export function useCart() {
  const [cartInstance, setCartInstance] = useState<Cart>(new Cart());
  // Utilizamos um contador para forçar re-render, já que Cart muta seus próprios itens
  const [tick, setTick] = useState(0);

  const updateState = useCallback(() => {
    setTick((t) => t + 1);
  }, []);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
      cartInstance.addItem(item);
      updateState();
    },
    [cartInstance, updateState]
  );

  const removeItem = useCallback(
    (menuItemId: string) => {
      cartInstance.removeItem(menuItemId);
      updateState();
    },
    [cartInstance, updateState]
  );

  const updateQuantity = useCallback(
    (menuItemId: string, quantity: number) => {
      cartInstance.updateQuantity(menuItemId, quantity);
      updateState();
    },
    [cartInstance, updateState]
  );

  const updateObservation = useCallback(
    (menuItemId: string, observation: string) => {
      cartInstance.updateObservation(menuItemId, observation);
      updateState();
    },
    [cartInstance, updateState]
  );

  const clear = useCallback(() => {
    cartInstance.clear();
    updateState();
  }, [cartInstance, updateState]);

  // Derivando estado a partir da instância para que os componentes usem facilmente
  const items = useMemo(() => cartInstance.allItems, [cartInstance, tick]);
  const total = useMemo(() => cartInstance.total, [cartInstance, tick]);
  const itemsCount = useMemo(() => cartInstance.itemsCount, [cartInstance, tick]);
  const isEmpty = useMemo(() => cartInstance.isEmpty, [cartInstance, tick]);

  return {
    items,
    total,
    itemsCount,
    isEmpty,
    addItem,
    removeItem,
    updateQuantity,
    updateObservation,
    clear,
    cartInstance, // Expondo a instância caso precisemos de algum método específico como validação
  };
}
