import { signupService } from "@/app/actions/auth-actions";
import { createCategory } from "@/app/actions/category-actions";
import { getEstablishmentId } from "@/app/actions/establisment_actions";
import { createMenuItem, deleteMenuItem, MenuItemRequestDTO } from "@/app/actions/menu-item-actions";
import { SignUpUser } from "@/lib/entities/sign-up-user";
import { createClient } from "@/utils/supabase/server";

describe("Menu DELETE Integration", () => {
  let createdUserIds: string[] = []
  let categoryId: string;
  let itemId: string;
  const email = `test_menu_delete_${Date.now()}@email.com`
  const password = "12345678A"
  const name = "Menu Delete User"

  beforeAll(async () => {
    const user = new SignUpUser(name, email, password, password)
    const result = await signupService(user)
    createdUserIds.push(result.user!.id)

    const supabase = await createClient()
    await supabase.auth.signInWithPassword({ email, password })

    await getEstablishmentId(supabase);

    const categoryResult = await createCategory("Categoria Teste");
    categoryId = categoryResult.data!.id;

    const menuItem: MenuItemRequestDTO = {
      id: null,
      name: "Item para Deletar",
      description: "Original",
      price: 40,
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
    it("should delete an existing item", async () => {
      const result = await deleteMenuItem(itemId);

      expect(result.success).toBe(true);

      // Verify it was soft-deleted (is_active = false)
      const supabase = await createClient();
      const { data } = await supabase
        .from("menu_items")
        .select("is_active")
        .eq("id", itemId)
        .single();

      expect(data?.is_active).toBe(false);
    });
  })

  describe("Invalid Cases", () => {
    it("should fail when deleting non-existent item", async () => {
      const result = await deleteMenuItem("00000000-0000-0000-0000-000000000000");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Item de menu não encontrado.");
    });
  })
});
