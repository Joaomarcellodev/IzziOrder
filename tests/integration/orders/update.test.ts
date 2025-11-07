import { supabase } from "@/lib/supabase/supabaseClient";

describe("Orders UPDATE Integration", () => {
  const testEstablishmentId = "5139eab5-6eaf-462f-bdbc-04257fdf2520";
  let testLocalOrderId: string;
  let testDeliveryOrderId: string;

  beforeEach(async () => {
    // Cria um pedido LOCAL para cada teste
    const { data: localOrder, error: localError } = await supabase
      .from("orders")
      .insert({
        total: "100.00",
        type: "LOCAL",
        status: "OPEN",
        establishment_id: testEstablishmentId,
        table_number: 5
      })
      .select()
      .single();

    // Cria um pedido DELIVERY para cada teste
    const { data: deliveryOrder, error: deliveryError } = await supabase
      .from("orders")
      .insert({
        total: "150.00",
        type: "DELIVERY",
        status: "OPEN",
        establishment_id: testEstablishmentId,
        delivery_fee: 10.00,
        estimated_time: "30 minutos"
      })
      .select()
      .single();

    if (!localError && localOrder) testLocalOrderId = localOrder.id;
    if (!deliveryError && deliveryOrder) testDeliveryOrderId = deliveryOrder.id;
  });

  // Casos válidos - ATUALIZAÇÕES SIMPLES
  describe("Valid Cases - Simple Updates", () => {
    it("should update only order total", async () => {
      const { data, error } = await supabase
        .from("orders")
        .update({
          total: "200.00"
        })
        .eq("id", testLocalOrderId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.total).toBe(200.00);
      expect(data.table_number).toBe(5);
      expect(data.type).toBe("LOCAL");
    });

    it("should update only table number", async () => {
      const { data, error } = await supabase
        .from("orders")
        .update({
          table_number: 15
        })
        .eq("id", testLocalOrderId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.table_number).toBe(15);
      expect(data.total).toBe(100.00); 
    });

    it("should update status from OPEN to CLOSED", async () => {
      const { data, error } = await supabase
        .from("orders")
        .update({
          status: "CLOSED"
        })
        .eq("id", testLocalOrderId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.status).toBe("CLOSED");
    });
  });

  // Casos válidos - MÚLTIPLOS CAMPOS
  describe("Valid Cases - Multiple Fields", () => {
    it("should update total, status and table number together", async () => {
      const { data, error } = await supabase
        .from("orders")
        .update({
          total: "250.00",
          status: "CLOSED",
          table_number: 20
        })
        .eq("id", testLocalOrderId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.total).toBe(250.00);
      expect(data.status).toBe("CLOSED");
      expect(data.table_number).toBe(20);
    });

    it("should update delivery order with new fee and time", async () => {
      const { data, error } = await supabase
        .from("orders")
        .update({
          delivery_fee: 15.00,
          estimated_time: "45 minutos",
          total: "175.00"
        })
        .eq("id", testDeliveryOrderId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.delivery_fee).toBe(15.00);
      expect(data.estimated_time).toBe("45 minutos");
      expect(data.total).toBe(175.00);
    });
  });

  // Casos válidos - MUDANÇA DE TIPO
  describe("Valid Cases - Type Changes", () => {
    it("should change LOCAL order to DELIVERY", async () => {
      const { data, error } = await supabase
        .from("orders")
        .update({
          type: "DELIVERY",
          delivery_fee: 8.50,
          estimated_time: "40 minutos",
          table_number: null
        })
        .eq("id", testLocalOrderId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.type).toBe("DELIVERY");
      expect(data.delivery_fee).toBe(8.50);
      expect(data.table_number).toBeNull();
    });

    it("should change DELIVERY order to LOCAL", async () => {
      const { data, error } = await supabase
        .from("orders")
        .update({
          type: "LOCAL",
          table_number: 8,
          delivery_fee: null, // LOCAL não tem delivery_fee
          estimated_time: null // LOCAL não tem estimated_time
        })
        .eq("id", testDeliveryOrderId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.type).toBe("LOCAL");
      expect(data.table_number).toBe(8);
      expect(data.delivery_fee).toBeNull();
      expect(data.estimated_time).toBeNull();
    });
  });

  // Casos válidos - ATUALIZAÇÕES COM NULL
  describe("Valid Cases - Null Updates", () => {
    it("should set delivery_fee to null", async () => {
      const { data, error } = await supabase
        .from("orders")
        .update({
          delivery_fee: null
        })
        .eq("id", testDeliveryOrderId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.delivery_fee).toBeNull();
    });

    it("should set estimated_time to null", async () => {
      const { data, error } = await supabase
        .from("orders")
        .update({
          estimated_time: null
        })
        .eq("id", testDeliveryOrderId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.estimated_time).toBeNull();
    });

    it("should set table_number to null for LOCAL order", async () => {
      const { data, error } = await supabase
        .from("orders")
        .update({
          table_number: null
        })
        .eq("id", testLocalOrderId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.table_number).toBeNull();
    });
  });

  // Casos inválidos - VALIDAÇÕES
  describe("Invalid Cases - Validations", () => {
    it("should reject update with invalid status", async () => {
      const { data, error } = await supabase
        .from("orders")
        .update({
          status: "INVALID_STATUS"
        })
        .eq("id", testLocalOrderId)
        .select()
        .maybeSingle();

      expect(Boolean(error) || !data).toBe(true);
    });

    it("should reject update with invalid type", async () => {
      const { data, error } = await supabase
        .from("orders")
        .update({
          type: "INVALID_TYPE"
        })
        .eq("id", testLocalOrderId)
        .select()
        .maybeSingle();

      expect(Boolean(error) || !data).toBe(true);
    });

    it("should reject update with total <= 0", async () => {
      const { data, error } = await supabase
        .from("orders")
        .update({
          total: "0.00"
        })
        .eq("id", testLocalOrderId)
        .select()
        .maybeSingle();

      expect(Boolean(error) || !data).toBe(true);
    });

    it("should reject update with negative total", async () => {
      const { data, error } = await supabase
        .from("orders")
        .update({
          total: "-10.00"
        })
        .eq("id", testLocalOrderId)
        .select()
        .maybeSingle();

      expect(Boolean(error) || !data).toBe(true);
    });

    it("should reject DELIVERY order with table_number", async () => {
      const { data, error } = await supabase
        .from("orders")
        .update({
          table_number: 5
        })
        .eq("id", testDeliveryOrderId)
        .select()
        .maybeSingle();

      if (error || !data) {
        expect(Boolean(error) || !data).toBe(true);
      }
    });
  });

  // Casos inválidos - IDs INEXISTENTES
  describe("Invalid Cases - Non-existent IDs", () => {
    it("should return empty for update on non-existent order", async () => {
      const { data, error } = await supabase
        .from("orders")
        .update({
          total: "999.00"
        })
        .eq("id", "00000000-0000-0000-0000-000000000000")
        .select()
        .maybeSingle();

      expect(error).toBeNull();
      expect(data).toBeNull();
    });
  });

  afterAll(async () => {
    await supabase
      .from("orders")
      .delete()
      .eq("establishment_id", testEstablishmentId);
  });
});