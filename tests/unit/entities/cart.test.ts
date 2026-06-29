import { Cart, CartItem } from "@/lib/entities/cart";

describe("Cart Entity", () => {
  const sampleItem: CartItem = {
    menuItemId: "item-1",
    name: "X-Calabresa",
    price: 25.0,
    quantity: 1,
    imageUrl: "/x-calabresa.png",
  };

  const secondItem: CartItem = {
    menuItemId: "item-2",
    name: "Coca-Cola",
    price: 8.0,
    quantity: 2,
  };

  describe("addItem", () => {
    it("should add a new item to the cart", () => {
      const cart = new Cart();
      cart.addItem(sampleItem);

      expect(cart.allItems).toHaveLength(1);
      expect(cart.allItems[0].name).toBe("X-Calabresa");
      expect(cart.allItems[0].quantity).toBe(1);
    });

    it("should increment quantity when adding an existing item", () => {
      const cart = new Cart();
      cart.addItem(sampleItem);
      cart.addItem({ menuItemId: "item-1", name: "X-Calabresa", price: 25.0 });

      expect(cart.allItems).toHaveLength(1);
      expect(cart.allItems[0].quantity).toBe(2);
    });

    it("should default quantity to 1 when not specified", () => {
      const cart = new Cart();
      cart.addItem({ menuItemId: "item-1", name: "Pizza", price: 40.0 });

      expect(cart.allItems[0].quantity).toBe(1);
    });

    it("should add multiple different items", () => {
      const cart = new Cart();
      cart.addItem(sampleItem);
      cart.addItem(secondItem);

      expect(cart.allItems).toHaveLength(2);
    });
  });

  describe("removeItem", () => {
    it("should remove an item from the cart", () => {
      const cart = new Cart([sampleItem, secondItem]);
      cart.removeItem("item-1");

      expect(cart.allItems).toHaveLength(1);
      expect(cart.allItems[0].menuItemId).toBe("item-2");
    });

    it("should throw error when removing non-existing item", () => {
      const cart = new Cart();
      expect(() => cart.removeItem("non-existing")).toThrow(
        "Item não encontrado no carrinho."
      );
    });
  });

  describe("updateQuantity", () => {
    it("should update the quantity of an item", () => {
      const cart = new Cart([sampleItem]);
      cart.updateQuantity("item-1", 5);

      expect(cart.allItems[0].quantity).toBe(5);
    });

    it("should remove item when quantity is set to 0", () => {
      const cart = new Cart([sampleItem]);
      cart.updateQuantity("item-1", 0);

      expect(cart.isEmpty).toBe(true);
    });

    it("should throw error for negative quantity", () => {
      const cart = new Cart([sampleItem]);
      expect(() => cart.updateQuantity("item-1", -1)).toThrow(
        "Quantidade não pode ser negativa."
      );
    });

    it("should throw error for non-existing item", () => {
      const cart = new Cart();
      expect(() => cart.updateQuantity("non-existing", 3)).toThrow(
        "Item não encontrado no carrinho."
      );
    });
  });

  describe("updateObservation", () => {
    it("should update the observation of an item", () => {
      const cart = new Cart([sampleItem]);
      cart.updateObservation("item-1", "Sem cebola");

      expect(cart.allItems[0].observation).toBe("Sem cebola");
    });

    it("should throw error for non-existing item", () => {
      const cart = new Cart();
      expect(() => cart.updateObservation("non-existing", "Teste")).toThrow(
        "Item não encontrado no carrinho."
      );
    });
  });

  describe("total", () => {
    it("should calculate total correctly with single item", () => {
      const cart = new Cart([sampleItem]);
      expect(cart.total).toBe(25.0);
    });

    it("should calculate total correctly with multiple items", () => {
      const cart = new Cart([sampleItem, secondItem]);
      // 25*1 + 8*2 = 41
      expect(cart.total).toBe(41.0);
    });

    it("should return 0 for empty cart", () => {
      const cart = new Cart();
      expect(cart.total).toBe(0);
    });
  });

  describe("itemsCount", () => {
    it("should count total items including quantities", () => {
      const cart = new Cart([sampleItem, secondItem]);
      // 1 + 2 = 3
      expect(cart.itemsCount).toBe(3);
    });

    it("should return 0 for empty cart", () => {
      const cart = new Cart();
      expect(cart.itemsCount).toBe(0);
    });
  });

  describe("clear", () => {
    it("should remove all items from the cart", () => {
      const cart = new Cart([sampleItem, secondItem]);
      cart.clear();

      expect(cart.isEmpty).toBe(true);
      expect(cart.total).toBe(0);
      expect(cart.itemsCount).toBe(0);
    });
  });

  describe("validateForCheckout", () => {
    it("should throw error for empty cart", () => {
      const cart = new Cart();
      expect(() => cart.validateForCheckout()).toThrow(
        "O carrinho está vazio. Adicione itens antes de finalizar."
      );
    });

    it("should pass validation for valid cart", () => {
      const cart = new Cart([sampleItem]);
      expect(() => cart.validateForCheckout()).not.toThrow();
    });

    it("should throw error for item with negative price", () => {
      const cart = new Cart([
        { menuItemId: "bad", name: "Bad Item", price: -5, quantity: 1 },
      ]);
      expect(() => cart.validateForCheckout()).toThrow(
        'Preço inválido para o item "Bad Item".'
      );
    });
  });

  describe("toOrderLines", () => {
    it("should convert cart items to order lines format", () => {
      const cart = new Cart([
        { ...sampleItem, observation: "Bem passado" },
      ]);
      const lines = cart.toOrderLines();

      expect(lines).toHaveLength(1);
      expect(lines[0]).toEqual({
        menuItemId: "item-1",
        name: "X-Calabresa",
        quantity: 1,
        price: 25.0,
        observation: "Bem passado",
      });
      // Should not include imageUrl
      expect(lines[0]).not.toHaveProperty("imageUrl");
    });
  });

  describe("constructor with initialItems", () => {
    it("should initialize with provided items", () => {
      const cart = new Cart([sampleItem, secondItem]);
      expect(cart.allItems).toHaveLength(2);
      expect(cart.total).toBe(41.0);
    });

    it("should not mutate original array", () => {
      const original = [sampleItem];
      const cart = new Cart(original);
      cart.addItem(secondItem);

      expect(original).toHaveLength(1);
      expect(cart.allItems).toHaveLength(2);
    });
  });

  describe("allItems immutability", () => {
    it("should return a copy, not the internal array", () => {
      const cart = new Cart([sampleItem]);
      const items = cart.allItems;
      items.push(secondItem);

      expect(cart.allItems).toHaveLength(1);
    });
  });
});
