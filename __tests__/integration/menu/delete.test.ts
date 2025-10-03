import { supabase } from "@/lib/supabase/supabaseClient";

describe("Menu DELETE Integration", () => {
  const testCategoryId = "c1d8bc12-dfce-463c-914a-91265b8aaf0b";
  let itemId: string;

  beforeAll(async () => {
    const { data } = await supabase
      .from("menu_items")
      .insert({
        name: "Item para Deletar",
        price: 40,
        category_id: testCategoryId,
        available: true,
      })
      .select()
      .single();
    itemId = data!.id;
  });

  // Casos válidos
  it("should delete an existing item", async () => {
    const { error } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", itemId);

    expect(error).toBeNull();

    const { data } = await supabase
      .from("menu_items")
      .select()
      .eq("id", itemId)
      .maybeSingle();

    expect(data).toBeNull();
  });

  // Casos inválidos
  it("should not fail when deleting non-existent item", async () => {
    const { error } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", "00000000-0000-0000-0000-000000000000");

    expect(error).toBeNull();
  });
});
