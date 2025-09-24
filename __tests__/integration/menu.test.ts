// __tests__/menu.integration.test.ts
import { supabase } from "@/lib/supabase/supabaseClient";

describe("Menu CRUD Integration", () => {
  let createdItemId: string | null = null;
  const testCategoryId = "c1d8bc12-dfce-463c-914a-91265b8aaf0b";

  it("should create a menu item", async () => {
    const { data, error } = await supabase
      .from("menu_items")
      .insert({
        name: "Item de Teste",
        description: "Descrição do item de teste",
        price: 10.5,
        category_id: testCategoryId,
        available: true,
        image: "/camera-off.svg",
        position: 0,
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data?.name).toBe("Item de Teste");
    createdItemId = data?.id;
  });

  it("should update the menu item", async () => {
    expect(createdItemId).toBeDefined();
    const { data, error } = await supabase
      .from("menu_items")
      .update({ name: "Item de Teste Atualizado", price: 15 })
      .eq("id", createdItemId)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data?.name).toBe("Item de Teste Atualizado");
    expect(data?.price).toBe(15);
  });

  it("should fetch the menu item", async () => {
    expect(createdItemId).toBeDefined();
    const { data, error } = await supabase
      .from("menu_items")
      .select()
      .eq("id", createdItemId)
      .single();

    expect(error).toBeNull();
    expect(data?.id).toBe(createdItemId);
    expect(data?.name).toBe("Item de Teste Atualizado");
  });

  it("should delete the menu item", async () => {
    expect(createdItemId).toBeDefined();
    const { error } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", createdItemId);

    expect(error).toBeNull();

    // verificar se realmente foi deletado
    const { data, error: fetchError } = await supabase
      .from("menu_items")
      .select()
      .eq("id", createdItemId)
      .single();

    expect(fetchError).not.toBeNull(); // deve dar erro porque o item não existe
    expect(data).toBeNull();
  });
});
