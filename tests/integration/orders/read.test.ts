import { supabase } from "@/utils/supabase/supabaseClient";

describe("Orders READ Integration", () => {
  const testEstablishmentId = "5139eab5-6eaf-462f-bdbc-04257fdf2520";
  let testOrderId1: string;
  let testOrderId2: string;

  beforeAll(async () => {
    const { data: order1, error: error1 } = await supabase
      .from("orders")
      .insert({
        total: "50.75",
        type: "LOCAL",
        status: "OPEN",
        establishment_id: testEstablishmentId,
        table_number: 10
      })
      .select()
      .single();

    const { data: order2, error: error2 } = await supabase
      .from("orders")
      .insert({
        total: "69.90",
        type: "DELIVERY",
        status: "CLOSED",
        establishment_id: testEstablishmentId,
        delivery_fee: 5.00,
        estimated_time: "30 minutos"
      })
      .select()
      .single();

    if (!error1 && order1) testOrderId1 = order1.id;
    if (!error2 && order2) testOrderId2 = order2.id;
  });

  // Casos válidos
  describe("Valid Cases", () => {
    it("should retrieve all orders for establishment", async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("establishment_id", testEstablishmentId)
        .order("date", { ascending: false });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.length).toBeGreaterThanOrEqual(2);
    });

    it("should retrieve specific order by ID", async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", testOrderId1)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.id).toBe(testOrderId1);
      expect(data.total).toBe(50.75);
      expect(data.type).toBe("LOCAL");
    });

    it("should filter orders by status", async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("establishment_id", testEstablishmentId)
        .eq("status", "OPEN");

      expect(error).toBeNull();
      expect(data).toBeDefined();
      data!.forEach(order => {
        expect(order.status).toBe("OPEN");
      });
    });

    it("should filter orders by type", async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("establishment_id", testEstablishmentId)
        .eq("type", "DELIVERY");

      expect(error).toBeNull();
      expect(data).toBeDefined();
      data!.forEach(order => {
        expect(order.type).toBe("DELIVERY");
      });
    });

    it("should retrieve orders with date ordering", async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("establishment_id", testEstablishmentId)
        .order("date", { ascending: false });

      expect(error).toBeNull();
      expect(data).toBeDefined();

      // Verifica se está ordenado por data decrescente
      if (data!.length > 1) {
        const firstDate = new Date(data![0].date);
        const secondDate = new Date(data![1].date);
        expect(firstDate.getTime()).toBeGreaterThanOrEqual(secondDate.getTime());
      }
    });
  });

  // Casos inválidos
  describe("Invalid Cases", () => {
    it("should return empty for non-existent order ID", async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", "00000000-0000-0000-0000-000000000000")
        .maybeSingle();

      expect(error).toBeNull();
      expect(data).toBeNull();
    });

    it("should return empty for invalid establishment ID", async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("establishment_id", "00000000-0000-0000-0000-000000000000");

      expect(error).toBeNull();
      expect(data).toEqual([]);
    });

    it("should return empty for invalid status filter", async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("establishment_id", testEstablishmentId)
        .eq("status", "INVALID_STATUS");

      expect(error).toBeNull();
      expect(data).toEqual([]);
    });
  });

  afterAll(async () => {
    if (testOrderId1) {
      await supabase.from("orders").delete().eq("id", testOrderId1);
    }
    if (testOrderId2) {
      await supabase.from("orders").delete().eq("id", testOrderId2);
    }
  });
});