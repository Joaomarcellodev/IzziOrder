import { validateCheckout, CheckoutData } from "@/lib/validators/checkout";

describe("Checkout Validator", () => {
  const validCheckout: CheckoutData = {
    customerName: "João Silva",
    phone: "11999887766",
    orderType: "PICKUP",
    paymentMethod: "PIX",
    cartTotal: 50.0,
  };

  describe("Customer Name", () => {
    it("should pass with valid name", () => {
      const errors = validateCheckout(validCheckout);
      expect(errors).toHaveLength(0);
    });

    it("should fail with empty name", () => {
      const errors = validateCheckout({ ...validCheckout, customerName: "" });
      expect(errors).toContain("O nome deve ter pelo menos 3 caracteres.");
    });

    it("should fail with short name", () => {
      const errors = validateCheckout({ ...validCheckout, customerName: "Jo" });
      expect(errors).toContain("O nome deve ter pelo menos 3 caracteres.");
    });

    it("should fail with whitespace-only name", () => {
      const errors = validateCheckout({
        ...validCheckout,
        customerName: "  ",
      });
      expect(errors).toContain("O nome deve ter pelo menos 3 caracteres.");
    });
  });

  describe("Phone", () => {
    it("should pass with 11-digit phone", () => {
      const errors = validateCheckout({
        ...validCheckout,
        phone: "11999887766",
      });
      expect(errors).toHaveLength(0);
    });

    it("should pass with 10-digit phone", () => {
      const errors = validateCheckout({
        ...validCheckout,
        phone: "1133445566",
      });
      expect(errors).toHaveLength(0);
    });

    it("should pass with formatted phone", () => {
      const errors = validateCheckout({
        ...validCheckout,
        phone: "(11) 99988-7766",
      });
      expect(errors).toHaveLength(0);
    });

    it("should fail with too short phone", () => {
      const errors = validateCheckout({ ...validCheckout, phone: "12345" });
      expect(errors).toContain(
        "Informe um telefone válido com DDD (10 ou 11 dígitos)."
      );
    });

    it("should fail with empty phone", () => {
      const errors = validateCheckout({ ...validCheckout, phone: "" });
      expect(errors).toContain(
        "Informe um telefone válido com DDD (10 ou 11 dígitos)."
      );
    });
  });

  describe("Order Type", () => {
    it("should pass with PICKUP type", () => {
      const errors = validateCheckout({
        ...validCheckout,
        orderType: "PICKUP",
      });
      expect(errors).toHaveLength(0);
    });

    it("should pass with DELIVERY type and valid address", () => {
      const errors = validateCheckout({
        ...validCheckout,
        orderType: "DELIVERY",
        address: "Rua das Flores, 123",
      });
      expect(errors).toHaveLength(0);
    });

    it("should fail with invalid order type", () => {
      const errors = validateCheckout({
        ...validCheckout,
        orderType: "INVALID" as any,
      });
      expect(errors).toContain(
        "Selecione o tipo de pedido (retirada ou delivery)."
      );
    });
  });

  describe("Address (Delivery)", () => {
    it("should fail when delivery without address", () => {
      const errors = validateCheckout({
        ...validCheckout,
        orderType: "DELIVERY",
        address: "",
      });
      expect(errors).toContain(
        "Endereço de entrega é obrigatório e precisa de pelo menos 5 caracteres."
      );
    });

    it("should fail when delivery with short address", () => {
      const errors = validateCheckout({
        ...validCheckout,
        orderType: "DELIVERY",
        address: "Rua",
      });
      expect(errors).toContain(
        "Endereço de entrega é obrigatório e precisa de pelo menos 5 caracteres."
      );
    });

    it("should not require address for PICKUP", () => {
      const errors = validateCheckout({
        ...validCheckout,
        orderType: "PICKUP",
        address: undefined,
      });
      expect(errors).toHaveLength(0);
    });
  });

  describe("Payment Method", () => {
    it("should pass with PIX", () => {
      const errors = validateCheckout({
        ...validCheckout,
        paymentMethod: "PIX",
      });
      expect(errors).toHaveLength(0);
    });

    it("should pass with CREDITO", () => {
      const errors = validateCheckout({
        ...validCheckout,
        paymentMethod: "CREDITO",
      });
      expect(errors).toHaveLength(0);
    });

    it("should pass with DEBITO", () => {
      const errors = validateCheckout({
        ...validCheckout,
        paymentMethod: "DEBITO",
      });
      expect(errors).toHaveLength(0);
    });

    it("should pass with ESPECIE_SEM_TROCO", () => {
      const errors = validateCheckout({
        ...validCheckout,
        paymentMethod: "ESPECIE_SEM_TROCO",
      });
      expect(errors).toHaveLength(0);
    });

    it("should pass with ESPECIE_COM_TROCO and valid change value", () => {
      const errors = validateCheckout({
        ...validCheckout,
        paymentMethod: "ESPECIE_COM_TROCO",
        changeValue: 100,
        cartTotal: 50,
      });
      expect(errors).toHaveLength(0);
    });

    it("should fail with invalid payment method", () => {
      const errors = validateCheckout({
        ...validCheckout,
        paymentMethod: "BITCOIN" as any,
      });
      expect(errors).toContain("Selecione uma forma de pagamento válida.");
    });
  });

  describe("Change Value (Espécie com Troco)", () => {
    it("should fail when change value is 0", () => {
      const errors = validateCheckout({
        ...validCheckout,
        paymentMethod: "ESPECIE_COM_TROCO",
        changeValue: 0,
        cartTotal: 50,
      });
      expect(errors).toContain("Informe o valor para troco.");
    });

    it("should fail when change value is less than total", () => {
      const errors = validateCheckout({
        ...validCheckout,
        paymentMethod: "ESPECIE_COM_TROCO",
        changeValue: 30,
        cartTotal: 50,
      });
      expect(errors).toContain(
        "O valor para troco deve ser maior que o total do pedido."
      );
    });

    it("should fail when change value equals total", () => {
      const errors = validateCheckout({
        ...validCheckout,
        paymentMethod: "ESPECIE_COM_TROCO",
        changeValue: 50,
        cartTotal: 50,
      });
      expect(errors).toContain(
        "O valor para troco deve ser maior que o total do pedido."
      );
    });

    it("should not validate change value for other payment methods", () => {
      const errors = validateCheckout({
        ...validCheckout,
        paymentMethod: "PIX",
        changeValue: undefined,
      });
      expect(errors).toHaveLength(0);
    });
  });

  describe("Multiple errors", () => {
    it("should return all errors at once", () => {
      const errors = validateCheckout({
        customerName: "",
        phone: "",
        orderType: "DELIVERY",
        address: "",
        paymentMethod: "" as any,
        cartTotal: 50,
      });

      expect(errors.length).toBeGreaterThanOrEqual(4);
    });
  });
});
