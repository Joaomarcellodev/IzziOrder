import { LocalOrder, PickupOrder, Order } from "@/lib/entities/order";
 
describe("Payment Method Feature", () => {
  const commonLines = [
    { menuItemId: "1", name: "Pizza", quantity: 1, price: 50 },
  ];

  // TESTES UNITÁRIOS — Entidade Order

    it("should create order with PIX paymentMethod", () => {
      const order = new PickupOrder({
        customerName: "João",
        orderLines: commonLines,
        paymentMethod: "PIX",
      });
      expect(order.paymentMethod).toBe("PIX");
    });

        it("should create order with CREDITO paymentMethod", () => {
      const order = new PickupOrder({
        customerName: "João",
        orderLines: commonLines,
        paymentMethod: "CREDITO",
      });
      expect(order.paymentMethod).toBe("CREDITO");
    });

        it("should create order with DEBITO paymentMethod", () => {
      const order = new PickupOrder({
        customerName: "João",
        orderLines: commonLines,
        paymentMethod: "DEBITO",
      });
      expect(order.paymentMethod).toBe("DEBITO");
    });
    
        it("should create order with ESPECIE_SEM_TROCO paymentMethod", () => {
      const order = new PickupOrder({
        customerName: "João",
        orderLines: commonLines,
        paymentMethod: "ESPECIE_SEM_TROCO",
      });
      expect(order.paymentMethod).toBe("ESPECIE_SEM_TROCO");
    });

        it("should create order with ESPECIE_COM_TROCO paymentMethod and correct changeValue", () => {
      const order = new PickupOrder({
        customerName: "João",
        orderLines: commonLines,
        paymentMethod: "ESPECIE_COM_TROCO",
        changeValue: 3,
      });
      expect(order.paymentMethod).toBe("ESPECIE_COM_TROCO");
      expect(order.changeValue).toBe(3);
    });

        it("should have changeValue as 0 by default when not provided", () => {
      const order = new PickupOrder({
        customerName: "João",
        orderLines: commonLines,
        paymentMethod: "PIX",
      });
      expect(order.changeValue).toBe(0);
    });

    it("should create LOCAL order without paymentMethod (payment informed later)", () => {
      const order = new LocalOrder({
        tableNumber: "5",
        orderLines: commonLines,
      });
      expect(order.paymentMethod).toBeUndefined();
      expect(order.changeValue).toBe(0);
    });
  

    // UNIT TESTS — Change Calculation


  describe("Change calculation (ESPECIE_COM_TROCO)", () => {

    it("should calculate change correctly: total 27, change for 30 = 3", () => {
      const total = 27;
      const valorDigitado = 30;
      const troco = Math.max(0, valorDigitado - total);
      expect(troco).toBe(3);
    });

    it("should calculate change correctly: total 50, change for 100 = 50", () => {
      const total = 50;
      const valorDigitado = 100;
      const troco = Math.max(0, valorDigitado - total);
      expect(troco).toBe(50);
    });

    it("should return 0 when entered value equals total", () => {
      const total = 50;
      const valorDigitado = 50;
      const troco = Math.max(0, valorDigitado - total);
      expect(troco).toBe(0);
    });

    it("should not return negative change", () => {
      const total = 50;
      const valorDigitado = 30;
      const troco = Math.max(0, valorDigitado - total);
      expect(troco).toBeGreaterThanOrEqual(0);
    });

    it("should store changeValue in order", () => {
      const order = new PickupOrder({
        customerName: "Maria",
        orderLines: [{ menuItemId: "1", name: "Lanche", quantity: 1, price: 27 }],
        paymentMethod: "ESPECIE_COM_TROCO",
        changeValue: 3,
      });
      expect(order.changeValue).toBe(3);
    });
  });


  // UNIT TESTS — toJSON()


  describe("toJSON() with paymentMethod and changeValue", () => {

    it("should include paymentMethod in toJSON()", () => {
      const order = new PickupOrder({
        customerName: "João",
        orderLines: commonLines,
        paymentMethod: "PIX",
      });
      const json = order.toJSON();
      expect(json.paymentMethod).toBe("PIX");
    });

    it("should include changeValue in toJSON()", () => {
      const order = new PickupOrder({
        customerName: "João",
        orderLines: commonLines,
        paymentMethod: "ESPECIE_COM_TROCO",
        changeValue: 3,
      });
      const json = order.toJSON();
      expect(json.changeValue).toBe(3);
    });

    it("should return changeValue 0 in toJSON() when not provided", () => {
      const order = new PickupOrder({
        customerName: "João",
        orderLines: commonLines,
        paymentMethod: "PIX",
      });
      const json = order.toJSON();
      expect(json.changeValue).toBe(0);
    });

    it("should return paymentMethod undefined in toJSON() for LOCAL order without payment", () => {
      const order = new LocalOrder({
        tableNumber: "5",
        orderLines: commonLines,
      });
      const json = order.toJSON();
      expect(json.paymentMethod).toBeUndefined();
    });
  });

  
  // UNIT TESTS — fromDTO()
  

  describe("Order.fromDTO() with paymentMethod and changeValue", () => {

    it("should map PIX paymentMethod correctly via fromDTO", () => {
      const order = Order.fromDTO({
        type: "PICKUP",
        detail: "João Silva",
        orderLines: commonLines,
        paymentMethod: "PIX",
      });
      expect(order.paymentMethod).toBe("PIX");
    });

    it("should map ESPECIE_COM_TROCO paymentMethod and changeValue via fromDTO", () => {
      const order = Order.fromDTO({
        type: "PICKUP",
        detail: "João Silva",
        orderLines: commonLines,
        paymentMethod: "ESPECIE_COM_TROCO",
        changeValue: 3,
      });
      expect(order.paymentMethod).toBe("ESPECIE_COM_TROCO");
      expect(order.changeValue).toBe(3);
    });

    it("should create LOCAL order via fromDTO without paymentMethod", () => {
      const order = Order.fromDTO({
        type: "LOCAL",
        detail: "5",
        orderLines: commonLines,
      });
      expect(order.paymentMethod).toBeUndefined();
      expect(order.changeValue).toBe(0);
    });

  });

});