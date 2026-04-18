import { signupService } from "@/app/actions/auth-actions";
import { createCategory } from "@/app/actions/category-actions";
import { getEstablishmentId } from "@/app/actions/establisment_actions";
import { createMenuItem, getMenuItems, MenuItemRequestDTO } from "@/app/actions/menu-item-actions";
import { SignUpUser } from "@/lib/entities/sign-up-user";
import { createClient } from "@/utils/supabase/server";

describe("Menu READ Integration", () => {
  let createdUserIds: string[] = []
  let categoryId: string;
  let itemId: string;
  let establishmentId: string;
  const email = `test_menu_read_${Date.now()}@email.com`
  const password = "12345678A"
  const name = "Menu Read User"

  beforeAll(async () => {
    const user = new SignUpUser(name, email, password, password)
    const result = await signupService(user)
    createdUserIds.push(result.user!.id)

    const supabase = await createClient()
    await supabase.auth.signInWithPassword({ email, password })

    establishmentId = await getEstablishmentId(supabase);

    const categoryResult = await createCategory("Categoria Teste");
    categoryId = categoryResult.data!.id;

    const menuItem: MenuItemRequestDTO = {
      id: null,
      name: "Item para Leitura",
      description: "Original",
      price: 10,
      categoryId: categoryId,
      available: true
    };
    const itemResult = await createMenuItem(menuItem);
    itemId = itemResult.data.id;
  });

  afterAll(async () => {
    const supabase = await createClient()
    for (const id of createdUserIds) {
      await supabase.auth.admin.deleteUser(id)
    }
  });

  describe("Valid Cases", () => {
    it("should fetch an item by ID using getMenuItems", async () => {
      const result = await getMenuItems(establishmentId);

      expect(result.success).toBe(true);
      const item = result.data!.find((i: any) => i.id === itemId);
      expect(item).toBeDefined();
      expect(item!.name).toBe("Item para Leitura");
    });
  })

  describe("Invalid Cases", () => {
    it("should return null for non-existent item (direct supabase as no server action for single item)", async () => {
      const supabase = await createClient();
      const { data } = await supabase
        .from("menu_items")
        .select()
        .eq("id", "00000000-0000-0000-0000-000000000000")
        .maybeSingle();

      expect(data).toBeNull();
    });
  })
});
