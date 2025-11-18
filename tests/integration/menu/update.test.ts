import { supabase } from "@/utils/supabase/supabaseClient";

describe("Menu UPDATE Integration", () => {
  const testCategoryId = "c1d8bc12-dfce-463c-914a-91265b8aaf0b";
  const testEstablishmentId = "5139eab5-6eaf-462f-bdbc-04257fdf2520";
  let itemId: string;

  beforeAll(async () => {
    const { data } = await supabase
      .from("menu_items")
      .insert({
        name: "Item para Update",
        price: 25,
        category_id: testCategoryId,
        available: true,
        establishment_id: testEstablishmentId,
      })
      .select()
      .single();
    itemId = data!.id;
  });

  // Casos válidos
  it("should update name and price", async () => {
    const { data, error } = await supabase
      .from("menu_items")
      .update({ name: "Item Atualizado", price: 50 })
      .eq("id", itemId)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data?.name).toBe("Item Atualizado");
    expect(data?.price).toBe(50);
  });

  // Casos inválidos
  it("should not update a non-existent item", async () => {
    const { data } = await supabase
      .from("menu_items")
      .update({ price: 999 })
      .eq("id", "00000000-0000-0000-0000-000000000000")
      .maybeSingle();

    expect(data).toBeNull();
  });
});
