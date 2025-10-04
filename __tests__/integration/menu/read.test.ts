import { supabase } from "@/lib/supabase/supabaseClient";

describe("Menu READ Integration", () => {
  const testCategoryId = "c1d8bc12-dfce-463c-914a-91265b8aaf0b";
  let itemId: string;

  beforeAll(async () => {
    const { data } = await supabase
      .from("menu_items")
      .insert({
        name: "Item para Leitura",
        price: 10,
        category_id: testCategoryId,
        available: true,
      })
      .select()
      .single();
    itemId = data!.id;
  });

  // Casos válidos
  it("should fetch an item by ID", async () => {
    const { data, error } = await supabase
      .from("menu_items")
      .select()
      .eq("id", itemId)
      .single();

    expect(error).toBeNull();
    expect(data?.id).toBe(itemId);
  });

  it("should list available items", async () => {
    const { data, error } = await supabase
      .from("menu_items")
      .select()
      .eq("available", true);

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  // Casos inválidos
  it("should return null for non-existent item", async () => {
    const { data } = await supabase
      .from("menu_items")
      .select()
      .eq("id", "00000000-0000-0000-0000-000000000000")
      .maybeSingle();

    expect(data).toBeNull();
  });
});
