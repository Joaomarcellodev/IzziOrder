export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  observation?: string;
  imageUrl?: string;
}

export class Cart {
  private items: CartItem[] = [];

  constructor(initialItems?: CartItem[]) {
    if (initialItems) {
      this.items = initialItems.map(item => ({ ...item }));
    }
  }

  addItem(item: Omit<CartItem, "quantity"> & { quantity?: number }): void {
    const existing = this.items.find((i) => i.menuItemId === item.menuItemId);

    if (existing) {
      existing.quantity += item.quantity ?? 1;
    } else {
      this.items.push({
        ...item,
        quantity: item.quantity ?? 1,
      });
    }
  }

  removeItem(menuItemId: string): void {
    const index = this.items.findIndex((i) => i.menuItemId === menuItemId);
    if (index === -1) {
      throw new Error("Item não encontrado no carrinho.");
    }
    this.items.splice(index, 1);
  }

  updateQuantity(menuItemId: string, quantity: number): void {
    if (quantity < 0) {
      throw new Error("Quantidade não pode ser negativa.");
    }

    const item = this.items.find((i) => i.menuItemId === menuItemId);
    if (!item) {
      throw new Error("Item não encontrado no carrinho.");
    }

    if (quantity === 0) {
      this.removeItem(menuItemId);
      return;
    }

    item.quantity = quantity;
  }

  updateObservation(menuItemId: string, observation: string): void {
    const item = this.items.find((i) => i.menuItemId === menuItemId);
    if (!item) {
      throw new Error("Item não encontrado no carrinho.");
    }
    item.observation = observation;
  }

  get total(): number {
    return this.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
  }

  get itemsCount(): number {
    return this.items.reduce((acc, item) => acc + item.quantity, 0);
  }

  get allItems(): CartItem[] {
    return [...this.items];
  }

  get isEmpty(): boolean {
    return this.items.length === 0;
  }

  clear(): void {
    this.items = [];
  }

  validateForCheckout(): void {
    if (this.isEmpty) {
      throw new Error("O carrinho está vazio. Adicione itens antes de finalizar.");
    }

    for (const item of this.items) {
      if (item.quantity <= 0) {
        throw new Error(`Quantidade inválida para o item "${item.name}".`);
      }
      if (item.price < 0) {
        throw new Error(`Preço inválido para o item "${item.name}".`);
      }
    }
  }

  toOrderLines() {
    return this.items.map((item) => ({
      menuItemId: item.menuItemId,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      observation: item.observation,
    }));
  }
}
