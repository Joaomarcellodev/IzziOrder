import { supabase } from "@/utils/supabase/supabaseClient";

describe("Tables READ Integration", () => {
  const testEstablishmentId = "5139eab5-6eaf-462f-bdbc-04257fdf2520"; // ID de teste

  // Casos válidos
  it("should fetch all tables for a valid establishment_id", async () => {
    const { data, error } = await supabase
      .from("tables")
      .select()
      .eq("establishment_id", testEstablishmentId);

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
    data?.forEach((table) => {
      expect(table.establishment_id).toBe(testEstablishmentId);
      expect(table.table_number).toBeGreaterThan(0);
    });
  });

  // Casos inválidos
  it("should return empty array for non-existent establishment_id", async () => {
    const { data, error } = await supabase
      .from("tables")
      .select()
      .eq("establishment_id", "00000000-0000-0000-0000-000000000000"); // UUID que não existe

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
    expect(data?.length).toBe(0);
  });
});
