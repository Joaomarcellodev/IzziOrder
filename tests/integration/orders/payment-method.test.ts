import { createOrder, updateOrder, getOrderById, OrderRequestDTO } from "@/app/actions/order-actions";
import { createClient } from "@/utils/supabase/server";

describe("Payment Method Integration", () => {
  const testEstablishmentId = process.env.TEST_ESTABLISHMENT_ID;
  const mockMenuItemId = "6cfd93ee-1e3d-430d-b525-f5a30bc96338";
  let supabase: any;
 
  const baseOrderLines = [
    { menuItemId: mockMenuItemId, name: "Pizza", quantity: 1, price: 50.00 }
  ];
 
  beforeAll(async () => {
    supabase = await createClient();
  });
 
  beforeEach(async () => {
    await supabase.from("orders").delete().eq("establishment_id", testEstablishmentId);
  });

 // VALID CASES — createOrder com pagamento
 
  describe("Valid Cases - createOrder com formas de pagamento", () => {
 
    it("should create PICKUP order with PIX and save payment_method in database", async () => {
      const orderDTO: OrderRequestDTO = {
        total: 50.00,
        type: "PICKUP",
        detail: "João Silva",
        orderLines: baseOrderLines,
        paymentMethod: "PIX",
      };
 
      const result = await createOrder(orderDTO, testEstablishmentId);
 
      expect(result.paymentMethod).toBe("PIX");
 
      // Verifica diretamente no banco
      const { data } = await supabase
        .from("orders")
        .select("payment_method")
        .eq("id", result.id)
        .single();
 
      expect(data.payment_method).toBe("PIX");
    });
 
    it("should create PICKUP order with CREDITO and save payment_method in database", async () => {
      const orderDTO: OrderRequestDTO = {
        total: 50.00,
        type: "PICKUP",
        detail: "João Silva",
        orderLines: baseOrderLines,
        paymentMethod: "CREDITO",
      };
 
      const result = await createOrder(orderDTO, testEstablishmentId);
 
      expect(result.paymentMethod).toBe("CREDITO");
 
      const { data } = await supabase
        .from("orders")
        .select("payment_method")
        .eq("id", result.id)
        .single();
 
      expect(data.payment_method).toBe("CREDITO");
    });
 
    it("should create PICKUP order with DEBITO and save payment_method in database", async () => {
      const orderDTO: OrderRequestDTO = {
        total: 50.00,
        type: "PICKUP",
        detail: "João Silva",
        orderLines: baseOrderLines,
        paymentMethod: "DEBITO",
      };
 
      const result = await createOrder(orderDTO, testEstablishmentId);
 
      expect(result.paymentMethod).toBe("DEBITO");
 
      const { data } = await supabase
        .from("orders")
        .select("payment_method")
        .eq("id", result.id)
        .single();
 
      expect(data.payment_method).toBe("DEBITO");
    });
 
    it("should create PICKUP order with ESPECIE_SEM_TROCO and save payment_method in database", async () => {
      const orderDTO: OrderRequestDTO = {
        total: 50.00,
        type: "PICKUP",
        detail: "João Silva",
        orderLines: baseOrderLines,
        paymentMethod: "ESPECIE_SEM_TROCO",
      };
 
      const result = await createOrder(orderDTO, testEstablishmentId);
 
      expect(result.paymentMethod).toBe("ESPECIE_SEM_TROCO");
 
      const { data } = await supabase
        .from("orders")
        .select("payment_method")
        .eq("id", result.id)
        .single();
 
      expect(data.payment_method).toBe("ESPECIE_SEM_TROCO");
    });
 
    it("should create PICKUP order with ESPECIE_COM_TROCO and save change_value in database", async () => {
      const orderDTO: OrderRequestDTO = {
        total: 27.00,
        type: "PICKUP",
        detail: "João Silva",
        orderLines: [{ menuItemId: mockMenuItemId, name: "Lanche", quantity: 1, price: 27.00 }],
        paymentMethod: "ESPECIE_COM_TROCO",
        changeValue: 3.00, // troco para 30
      };
 
      const result = await createOrder(orderDTO, testEstablishmentId);
 
      expect(result.paymentMethod).toBe("ESPECIE_COM_TROCO");
      expect(result.changeValue).toBe(3.00);
 
      // Verifica diretamente no banco
      const { data } = await supabase
        .from("orders")
        .select("payment_method, change_value")
        .eq("id", result.id)
        .single();
 
      expect(data.payment_method).toBe("ESPECIE_COM_TROCO");
      expect(Number(data.change_value)).toBe(3.00);
    });
 
    it("should create LOCAL order without payment_method (NULL in database)", async () => {
      const orderDTO: OrderRequestDTO = {
        total: 50.00,
        type: "LOCAL",
        detail: "5",
        orderLines: baseOrderLines,
      };
 
      const result = await createOrder(orderDTO, testEstablishmentId);
 
      expect(result.paymentMethod).toBeUndefined();
 
      // Verifica diretamente no banco que está NULL
      const { data } = await supabase
        .from("orders")
        .select("payment_method")
        .eq("id", result.id)
        .single();
 
      expect(data.payment_method).toBeNull();
    });
 
    it("should create LOCAL order with change_value as 0 by default", async () => {
      const orderDTO: OrderRequestDTO = {
        total: 50.00,
        type: "LOCAL",
        detail: "5",
        orderLines: baseOrderLines,
      };
 
      const result = await createOrder(orderDTO, testEstablishmentId);
 
      // Verifica diretamente no banco
      const { data } = await supabase
        .from("orders")
        .select("change_value")
        .eq("id", result.id)
        .single();
 
      expect(Number(data.change_value)).toBe(0);
    });
  });


   // VALID CASES — updateOrder com pagamento
  // ─────────────────────────────────────────────
 
  describe("Valid Cases - updateOrder com formas de pagamento", () => {
 
    it("should update LOCAL order adding payment method and save in database", async () => {
      // Cria pedido LOCAL sem pagamento
      const created = await createOrder({
        total: 50.00,
        type: "LOCAL",
        detail: "5",
        orderLines: baseOrderLines,
      }, testEstablishmentId);
 
      // Edita adicionando forma de pagamento
      const updateDTO: OrderRequestDTO = {
        id: created.id,
        total: 50.00,
        type: "LOCAL",
        detail: "5",
        orderLines: baseOrderLines,
        paymentMethod: "PIX",
      };
 
      const result = await updateOrder(updateDTO);
 
      expect(result.paymentMethod).toBe("PIX");
 
      // Verifica no banco
      const { data } = await supabase
        .from("orders")
        .select("payment_method")
        .eq("id", created.id)
        .single();
 
      expect(data.payment_method).toBe("PIX");
    });
 
    it("should update payment method from PIX to CREDITO", async () => {
      const created = await createOrder({
        total: 50.00,
        type: "PICKUP",
        detail: "João Silva",
        orderLines: baseOrderLines,
        paymentMethod: "PIX",
      }, testEstablishmentId);
 
      const updateDTO: OrderRequestDTO = {
        id: created.id,
        total: 50.00,
        type: "PICKUP",
        detail: "João Silva",
        orderLines: baseOrderLines,
        paymentMethod: "CREDITO",
      };
 
      const result = await updateOrder(updateDTO);
 
      expect(result.paymentMethod).toBe("CREDITO");
    });
 
    it("should update order adding ESPECIE_COM_TROCO and save change_value", async () => {
      const created = await createOrder({
        total: 27.00,
        type: "LOCAL",
        detail: "5",
        orderLines: [{ menuItemId: mockMenuItemId, name: "Lanche", quantity: 1, price: 27.00 }],
      }, testEstablishmentId);
 
      const updateDTO: OrderRequestDTO = {
        id: created.id,
        total: 27.00,
        type: "LOCAL",
        detail: "5",
        orderLines: [{ menuItemId: mockMenuItemId, name: "Lanche", quantity: 1, price: 27.00 }],
        paymentMethod: "ESPECIE_COM_TROCO",
        changeValue: 3.00,
      };
 
      const result = await updateOrder(updateDTO);
 
      expect(result.paymentMethod).toBe("ESPECIE_COM_TROCO");
      expect(result.changeValue).toBe(3.00);
 
      // Verifica no banco
      const { data } = await supabase
        .from("orders")
        .select("payment_method, change_value")
        .eq("id", created.id)
        .single();
 
      expect(data.payment_method).toBe("ESPECIE_COM_TROCO");
      expect(Number(data.change_value)).toBe(3.00);
    });
  });

   // VALID CASES — getOrderById com pagamento
 
  describe("Valid Cases - getOrderById retorna paymentMethod e changeValue", () => {
 
    it("should return paymentMethod when fetching order by id", async () => {
      const created = await createOrder({
        total: 50.00,
        type: "PICKUP",
        detail: "João Silva",
        orderLines: baseOrderLines,
        paymentMethod: "PIX",
      }, testEstablishmentId);
 
      const result = await getOrderById(created.id!);
 
      expect(result.paymentMethod).toBe("PIX");
    });
 
    it("should return changeValue when fetching order with ESPECIE_COM_TROCO", async () => {
      const created = await createOrder({
        total: 27.00,
        type: "PICKUP",
        detail: "João Silva",
        orderLines: [{ menuItemId: mockMenuItemId, name: "Lanche", quantity: 1, price: 27.00 }],
        paymentMethod: "ESPECIE_COM_TROCO",
        changeValue: 3.00,
      }, testEstablishmentId);
 
      const result = await getOrderById(created.id!);
 
      expect(result.paymentMethod).toBe("ESPECIE_COM_TROCO");
      expect(result.changeValue).toBe(3.00);
    });
 
    it("should return paymentMethod as undefined for LOCAL order without payment", async () => {
      const created = await createOrder({
        total: 50.00,
        type: "LOCAL",
        detail: "5",
        orderLines: baseOrderLines,
      }, testEstablishmentId);
 
      const result = await getOrderById(created.id!);
 
      expect(result.paymentMethod).toBeUndefined();
    });
  });

   // INVALID CASES
 
  describe("Invalid Cases", () => {
 
    it("should reject order with invalid payment method", async () => {
      const orderDTO: OrderRequestDTO = {
        total: 50.00,
        type: "PICKUP",
        detail: "João Silva",
        orderLines: baseOrderLines,
        paymentMethod: "INVALIDO" as any,
      };
 
      await expect(createOrder(orderDTO, testEstablishmentId)).rejects.toThrow();
    });
 
    it("should not save negative change_value", async () => {
      const orderDTO: OrderRequestDTO = {
        total: 50.00,
        type: "PICKUP",
        detail: "João Silva",
        orderLines: baseOrderLines,
        paymentMethod: "ESPECIE_COM_TROCO",
        changeValue: -5, // troco negativo não faz sentido
      };
 
      // O banco salva 0 no mínimo pois o frontend garante Math.max(0, ...)
      const result = await createOrder(orderDTO, testEstablishmentId);
 
      const { data } = await supabase
        .from("orders")
        .select("change_value")
        .eq("id", result.id)
        .single();
 
      expect(Number(data.change_value)).toBeGreaterThanOrEqual(0);
    });
  });
 
  afterAll(async () => {
    await supabase.from("orders").delete().eq("establishment_id", testEstablishmentId);
  });


  });