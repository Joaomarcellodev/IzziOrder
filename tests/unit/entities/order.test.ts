import { LocalOrder, PickupOrder, DeliveryOrder, Order } from "@/lib/entities/order";

describe("Order Entity Hierarchy", () => {
  const commonLines = [
    { menuItemId: "1", name: "Pizza", quantity: 1, price: 50 },
  ];

  describe("LocalOrder", () => {
    it("should create a valid LocalOrder", () => {
      const order = new LocalOrder({
        id: "123456789-abc",
        tableNumber: "5",
        orderLines: commonLines,
      });
      expect(order.type).toBe("LOCAL");
      expect(order.code).toBe("#LOC-123456");
      expect(order.tableNumber).toBe("5");
    });

    it("should throw error if table number is missing", () => {
      expect(() => new LocalOrder({
        id: "123",
        tableNumber: "",
        orderLines: commonLines,
      })).toThrow("Mesa é obrigatória para pedidos locais.");
    });
  });

  describe("PickupOrder", () => {
    it("should create a valid PickupOrder", () => {
      const order = new PickupOrder({
        id: "987654321-xyz",
        customerName: "Tiago",
        orderLines: commonLines,
      });
      expect(order.type).toBe("PICKUP");
      expect(order.code).toBe("#PIC-987654");
      expect(order.customerName).toBe("Tiago");
    });

    it("should throw error if customer name is too short", () => {
      expect(() => new PickupOrder({
        id: "123",
        customerName: "Ti",
        orderLines: commonLines,
      })).toThrow("Pedido do tipo retirada precisa de pelo menos 3 caracteres no nome do cliente.");
    });
  });

  describe("DeliveryOrder", () => {
    it("should create a valid DeliveryOrder", () => {
      const order = new DeliveryOrder({
        id: "555666",
        address: "Rua das Flores, 123",
        deliveryFee: 10,
        orderLines: commonLines,
      });
      expect(order.type).toBe("DELIVERY");
      expect(order.code).toBe("#DLV-555666");
      expect(order.total).toBe(60); // 50 + 10
    });

    it("should throw error if address is too short", () => {
      expect(() => new DeliveryOrder({
        address: "Rua",
        deliveryFee: 10,
        orderLines: commonLines,
      })).toThrow("Endereço de entrega é obrigatório e precisa de pelo menos 5 caracteres.");
    });

    it("should throw error if delivery fee is negative", () => {
      expect(() => new DeliveryOrder({
        address: "Rua das Flores, 123",
        deliveryFee: -5,
        orderLines: commonLines,
      })).toThrow("Taxa de entrega não pode ser negativa.");
    });
  });

  describe("Order Base Logic", () => {
    it("should calculate total correctly", () => {
      const order = new LocalOrder({
        id: "123",
        tableNumber: "5",
        orderLines: [
          { menuItemId: "1", name: "Pizza", quantity: 2, price: 50 },
          { menuItemId: "2", name: "Coke", quantity: 1, price: 10 },
        ],
      });
      expect(order.total).toBe(110);
    });

    it("should calculate itemsCount correctly", () => {
      const order = new LocalOrder({
        id: "123",
        tableNumber: "5",
        orderLines: [
          { menuItemId: "1", name: "Pizza", quantity: 2, price: 50 },
          { menuItemId: "2", name: "Coke", quantity: 3, price: 10 },
        ],
      });
      expect(order.itemsCount).toBe(5);
    });

    it("should throw error if order has no lines", () => {
      expect(() => new LocalOrder({
        id: "123",
        tableNumber: "5",
        orderLines: [],
      })).toThrow("O pedido deve conter pelo menos um item.");
    });

    it("should change status to CLOSED when close() is called", () => {
      const order = new LocalOrder({
        tableNumber: "1",
        orderLines: commonLines,
      });
      expect(order.status).toBe("OPEN");
      order.close();
      expect(order.status).toBe("CLOSED");
    });

    it("should throw error when closing an already closed order", () => {
      const order = new LocalOrder({
        tableNumber: "1",
        orderLines: commonLines,
        status: "CLOSED"
      });
      expect(() => order.close()).toThrow("Pedido já está fechado.");
    });

    it("should change status to OPEN when reopen() is called", () => {
      const order = new LocalOrder({
        tableNumber: "1",
        orderLines: commonLines,
        status: "CLOSED"
      });
      expect(order.status).toBe("CLOSED");
      order.reopen();
      expect(order.status).toBe("OPEN");
    });

    it("should throw error when reopening an already open order", () => {
      const order = new LocalOrder({
        tableNumber: "1",
        orderLines: commonLines,
        status: "OPEN"
      });
      expect(() => order.reopen()).toThrow("Pedido já está aberto.");
    });

    it("should set current date if not provided", () => {
      const order = new LocalOrder({
        tableNumber: "1",
        orderLines: commonLines,
      });
      expect(order.date).toBeDefined();
      expect(new Date(order.date!).getTime()).toBeLessThanOrEqual(Date.now());
    });

    it("should preserve estimatedTime", () => {
      const order = new LocalOrder({
        tableNumber: "1",
        orderLines: commonLines,
        estimatedTime: 30,
      });
      expect(order.estimatedTime).toBe(30);
    });
  });

  describe("Order.fromDTO", () => {
    it("should create LocalOrder from DTO", () => {
      const order = Order.fromDTO({
        type: "LOCAL",
        detail: "10",
        orderLines: commonLines,
      });
      expect(order).toBeInstanceOf(LocalOrder);
      expect((order as LocalOrder).tableNumber).toBe("10");
    });

    it("should create PickupOrder from DTO", () => {
      const order = Order.fromDTO({
        type: "PICKUP",
        detail: "John Doe",
        orderLines: commonLines,
      });
      expect(order).toBeInstanceOf(PickupOrder);
      expect((order as PickupOrder).customerName).toBe("John Doe");
    });

    it("should create DeliveryOrder from DTO", () => {
      const order = Order.fromDTO({
        type: "DELIVERY",
        detail: "Rua Central, 500",
        deliveryFee: 15,
        orderLines: commonLines,
      });
      expect(order).toBeInstanceOf(DeliveryOrder);
      expect((order as DeliveryOrder).address).toBe("Rua Central, 500");
      expect((order as DeliveryOrder).deliveryFee).toBe(15);
    });

    it("should throw error for invalid type", () => {
      expect(() => Order.fromDTO({
        type: "INVALID" as any,
        orderLines: commonLines,
      })).toThrow("Tipo de pedido inválido.");
    });
  });
});
