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
  



});