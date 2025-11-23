import { supabase } from "@/utils/supabase/supabaseClient";

describe("Tables DELETE Integration", () => {
  const testEstablishmentId = "5139eab5-6eaf-462f-bdbc-04257fdf2520"; // ID de teste
  let tableToDeleteId: string;

  beforeAll(async () => {
    // Criar uma mesa válida para deletar depois
    const { data, error } = await supabase
      .from("tables")
      .insert({
        table_number: 999,
        establishment_id: testEstablishmentId,
      })
      .select()
      .single();

    if (error) throw new Error(`Setup failed: ${error.message}`);
    tableToDeleteId = data.id;
  });

  // Casos válidos
  describe("Valid Cases", () => {
    it("should delete an existing table successfully", async () => {
      const { data, error } = await supabase
        .from("tables")
        .delete()
        .eq("id", tableToDeleteId)
        .eq("establishment_id", testEstablishmentId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data?.id).toBe(tableToDeleteId);

      // Verifica se realmente foi deletado
      const { data: check } = await supabase
        .from("tables")
        .select()
        .eq("id", tableToDeleteId)
        .maybeSingle();

      expect(check).toBeNull();
    });
  });

  // Casos inválidos
  describe("Invalid Cases", () => {
    it("should reject deletion of a non-existent table", async () => {
      const { data, error } = await supabase
        .from("tables")
        .delete()
        .eq("id", "00000000-0000-0000-0000-000000000000")
        .eq("establishment_id", testEstablishmentId)
        .select()
        .maybeSingle();

      expect(Boolean(error) || !data).toBe(true);
    });

    it("should reject deletion with invalid establishment_id", async () => {
      // cria uma mesa temporária
      const { data: temp } = await supabase
        .from("tables")
        .insert({
          table_number: 888,
          establishment_id: testEstablishmentId,
        })
        .select()
        .single();

      const { data, error } = await supabase
        .from("tables")
        .delete()
        .eq("id", temp.id)
        .eq("establishment_id", "invalid-establishment")
        .select()
        .maybeSingle();

      expect(Boolean(error) || !data).toBe(true);

      // limpa a mesa se ainda existir
      await supabase.from("tables").delete().eq("id", temp.id);
    });
  });
});
