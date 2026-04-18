import { signupService } from "@/app/actions/auth-actions";
import { createCategory } from "@/app/actions/category-actions";
import { getEstablishmentId } from "@/app/actions/establisment_actions";
import { createMenuItem, MenuItemRequestDTO } from "@/app/actions/menu-item-actions";
import { SignUpUser } from "@/lib/entities/sign-up-user";
import { createClient } from "@/utils/supabase/server";

describe("Menu CREATE Integration", () => {
  let createdUserIds: string[] = []
  let categoryId: string;
  const email = `test_menu_create_${Date.now()}@email.com`
  const password = "12345678A"
  const name = "Menu Create User"

  beforeAll(async () => {
    const user = new SignUpUser(name, email, password, password)
    const result = await signupService(user)
    createdUserIds.push(result.user!.id)

    const supabase = await createClient()
    await supabase.auth.signInWithPassword({ email, password })

    await getEstablishmentId(supabase);

    const categoryResult = await createCategory("Categoria Teste");
    categoryId = categoryResult.data!.id;
  });

  afterAll(async () => {
    const supabase = await createClient()
    for (const id of createdUserIds) {
      await supabase.auth.admin.deleteUser(id)
    }
  });

  describe("Valid Cases", () => {
    it("should create a valid menu item", async () => {
      const menuItem: MenuItemRequestDTO = {
        id: null,
        name: "Item Válido",
        description: "Criado via teste",
        price: 20,
        categoryId: categoryId,
        available: true
      };

      const result = await createMenuItem(menuItem);

      expect(result.success).toBe(true);
      expect(result.data.id).toBeDefined();
      expect(result.data.name).toBe("Item Válido");
    });

    it("should aceppt price = 0", async () => {
      const menuItem: MenuItemRequestDTO = {
        id: null,
        name: "Item Grátis",
        description: "Preço zero",
        price: 0,
        categoryId: categoryId,
        available: true
      };

      const result = await createMenuItem(menuItem);

      expect(result.success).toBe(true);
    })
  });

  describe("Invalid Cases", () => {
    it("should reject creation with negative price", async () => {
      const menuItem: MenuItemRequestDTO = {
        id: null,
        name: "Preço Negativo",
        description: "Preço negativo",
        price: -10,
        categoryId: categoryId,
        available: true
      };

      const result = await createMenuItem(menuItem);

      expect(result.success).toBe(false);
      expect(result.error).toContain("O preço não pode ser negativo.");
    });

    it("should reject creation without name", async () => {
      const menuItem: MenuItemRequestDTO = {
        id: null,
        name: "",
        description: "Sem nome",
        price: 10,
        categoryId: categoryId,
        available: true
      };

      const result = await createMenuItem(menuItem);

      expect(result.success).toBe(false);
      expect(result.error).toContain("O nome deve ter pelo menos 3 caracteres.");
    });
  })
});
