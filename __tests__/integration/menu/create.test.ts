import { supabase } from "@/lib/supabase/supabaseClient";

describe("Menu CREATE Integration", () => {
  const testCategoryId = "c1d8bc12-dfce-463c-914a-91265b8aaf0b";
  const testEstablishmentId = "5139eab5-6eaf-462f-bdbc-04257fdf2520";

  // Casos válidos
  it("should create a valid menu item", async () => {
    const { data, error } = await supabase
      .from("menu_items")
      .insert({
        name: "Item Válido",
        description: "Criado via teste",
        price: 20,
        category_id: testCategoryId,
        available: true,
        establishment_id: testEstablishmentId,
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data?.id).toBeDefined();
  });

  it("should allow price = 0", async () => {
    const { data, error } = await supabase
      .from("menu_items")
      .insert({
        name: "Item Grátis",
        description: "Preço zero",
        price: 0,
        category_id: testCategoryId,
        available: true,
        establishment_id: testEstablishmentId,
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data?.price).toBe(0);
  });

  // Casos inválidos
  it("should reject creation with negative price", async () => {
    const { data, error } = await supabase
      .from("menu_items")
      .insert({
        name: "Preço Negativo",
        price: -10,
        category_id: testCategoryId,
        available: true,
        establishment_id: testEstablishmentId,
      })
      .select()
      .maybeSingle();

    expect(Boolean(error) || !data).toBe(true);
  });

  it("should reject creation without name", async () => {
    const { data, error } = await supabase
      .from("menu_items")
      .insert({
        price: 10,
        category_id: testCategoryId,
        available: true,
        establishment_id: testEstablishmentId,
      })
      .select()
      .maybeSingle();

    expect(Boolean(error) || !data).toBe(true);
  });

  it("should reject creation without price", async () => {
    const { data, error } = await supabase
      .from("menu_items")
      .insert({
        name: "Sem preço",
        category_id: testCategoryId,
        available: true,
        establishment_id: testEstablishmentId,
      })
      .select()
      .maybeSingle();

    expect(Boolean(error) || !data).toBe(true);
  });
});
