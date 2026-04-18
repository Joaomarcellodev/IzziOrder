import { signupService } from "@/app/actions/auth-actions";
import { createCategory } from "@/app/actions/category-actions";
import { getEstablishmentId } from "@/app/actions/establisment_actions";
import { createMenuItem, updateMenuItem, MenuItemRequestDTO } from "@/app/actions/menu-item-actions";
import { SignUpUser } from "@/lib/entities/sign-up-user";
import { createClient } from "@/utils/supabase/server";

describe("Menu UPDATE Integration", () => {
  let createdUserIds: string[] = []
  let categoryId: string;
  let itemId: string;
  const email = `test_menu_update_${Date.now()}@email.com`
  const password = "12345678A"
  const name = "Menu Update User"

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
      name: "Item para Update",
      description: "Original",
      price: 25,
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
    it("should update name and price", async () => {
      const updateData: MenuItemRequestDTO = {
        id: itemId,
        name: "Item Atualizado",
        description: "Original",
        price: 50,
        categoryId: categoryId,
        available: true,
        imageUrl: "/camera-off.svg"
      };

      const result = await updateMenuItem(itemId, updateData);

      expect(result.success).toBe(true);
      expect(result.data.name).toBe("Item Atualizado");
      expect(result.data.price).toBe(50);
    });
  })

  describe("Invalid Cases", () => {
    it("should not update with invalid price", async () => {
      const updateData: MenuItemRequestDTO = {
        id: itemId,
        name: "Item Errado",
        description: "Original",
        price: -1,
        categoryId: categoryId,
        available: true
      };

      const result = await updateMenuItem(itemId, updateData);

      expect(result.success).toBe(false);
      expect(result.error).toContain("O preço não pode ser negativo.");
    });
  })
});
