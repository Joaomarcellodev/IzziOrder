import { supabase } from "@/lib/supabase/supabaseClient";

describe("Tables CREATE Integration", () => {
  const testEstablishmentId = "5139eab5-6eaf-462f-bdbc-04257fdf2520";

  const valid_table_number_1 = 1;
  const valid_table_number_2 = 2;
  const negative_table_number = -1;

  // casos validos
  describe("Valid Cases", () => {
    it("should create a valid table (1001)", async () => {
      const { data, error } = await supabase
        .from("tables")
        .insert({ table_number: valid_table_number_1, establishment_id: testEstablishmentId })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.table_number).toBe(valid_table_number_1);
    });

    it("should create another valid table (1002)", async () => {
      const { data, error } = await supabase
        .from("tables")
        .insert({ table_number: valid_table_number_2, establishment_id: testEstablishmentId })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.table_number).toBe(valid_table_number_2);
    });
  });

  // casos invalidos
  describe("Invalid Cases", () => {
    it("should reject negative table_number", async () => {
      const { data, error } = await supabase
        .from("tables")
        .insert({ table_number: negative_table_number, establishment_id: testEstablishmentId })
        .select()
        .maybeSingle();

      expect(Boolean(error) || !data).toBe(true);
    });

    it("should reject table without table_number", async () => {
      const { data, error } = await supabase
        .from("tables")
        .insert({ establishment_id: testEstablishmentId })
        .select()
        .maybeSingle();

      expect(Boolean(error) || !data).toBe(true);
    });

    it("should reject table without establishment_id", async () => {
      const { data, error } = await supabase
        .from("tables")
        .insert({ table_number: 5 })
        .select()
        .maybeSingle();

      expect(Boolean(error) || !data).toBe(true);
    });

    it("should reject table with invalid establishment_id", async () => {
      const { data, error } = await supabase
        .from("tables")
        .insert({ table_number: 3, establishment_id: "00000000-0000-0000-0000-000000000000" })
        .select()
        .maybeSingle();

      expect(Boolean(error) || !data).toBe(true);
    });
  });

  // limpa os dados inseridos
  afterAll(async () => {
    await supabase
      .from("tables")
      .delete()
      .in("table_number", [valid_table_number_1, valid_table_number_2])
      .eq("establishment_id", testEstablishmentId);
  });
});
