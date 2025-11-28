import { supabase } from "@/utils/supabase/supabaseClient";

describe("Tables UPDATE Integration", () => {
  const testEstablishmentId = "5139eab5-6eaf-462f-bdbc-04257fdf2520"; // ID de teste
  const createdTableIds: string[] = [];

  // Casos válidos
  it("should update a table_number successfully", async () => {
    const { data: table, error: insertError } = await supabase
      .from("tables")
      .insert({ table_number: 1, establishment_id: testEstablishmentId })
      .select()
      .single();

    expect(insertError).toBeNull();
    createdTableIds.push(table.id);

    const { data, error } = await supabase
      .from("tables")
      .update({ table_number: 2 })
      .eq("id", table.id)
      .eq("establishment_id", testEstablishmentId)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data?.table_number).toBe(2);
  });

  // Casos inválidos
  it("should not update if table ID does not exist", async () => {
    const { data, error } = await supabase
      .from("tables")
      .update({ table_number: 9 })
      .eq("id", "00000000-0000-0000-0000-000000000000")
      .eq("establishment_id", testEstablishmentId)
      .select()
      .maybeSingle();

    expect(Boolean(error) || !data).toBe(true);
  });

  it("should reject negative table_number", async () => {
    const { data: table, error: insertError } = await supabase
      .from("tables")
      .insert({ table_number: 10, establishment_id: testEstablishmentId })
      .select()
      .single();

    expect(insertError).toBeNull();
    createdTableIds.push(table.id);

    const { data, error } = await supabase
      .from("tables")
      .update({ table_number: -5 })
      .eq("id", table.id)
      .eq("establishment_id", testEstablishmentId)
      .select()
      .maybeSingle();

    expect(Boolean(error) || !data).toBe(true);
  });

  it("should reject duplicate table_number for the same establishment", async () => {
    const { data: tables, error: insertError } = await supabase
      .from("tables")
      .insert([
        { table_number: 11, establishment_id: testEstablishmentId },
        { table_number: 12, establishment_id: testEstablishmentId },
      ])
      .select();

    expect(insertError).toBeNull();
    expect(tables?.length).toBe(2);

    if (!tables || tables.length < 2) {
      throw new Error("Failed to insert test tables");
    }

    createdTableIds.push(tables[0].id, tables[1].id);

    const { data, error } = await supabase
      .from("tables")
      .update({ table_number: 11 })
      .eq("id", tables[1].id)
      .eq("establishment_id", testEstablishmentId)
      .select()
      .maybeSingle();

    expect(Boolean(error) || !data).toBe(true);
  });

  // Limpeza após todos os testes
  afterAll(async () => {
    if (createdTableIds.length === 0) return;
    await supabase
      .from("tables")
      .delete()
      .in("id", createdTableIds)
      .eq("establishment_id", testEstablishmentId);
  });
});
