import { calculateNextPosition, createMenuItem, MenuItemRequestDTO } from "@/app/actions/menu-item-actions";
import { createClient } from "@/utils/supabase/server";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";

jest.mock("@/utils/supabase/server");
jest.mock("@vercel/blob");
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));
jest.mock("@/utils/config", () => ({
  ESTABLISHMENT_ID: "est123"
}));

describe("UNIT — createMenuItem", () => {
  let mockSupabase: any;
  let singleCallCount: number;

  beforeEach(() => {
    jest.clearAllMocks();
    singleCallCount = 0;

    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn(),
      insert: jest.fn().mockReturnThis(),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    (put as jest.Mock).mockResolvedValue({ url: "https://mock.com/image.jpg" });

    // Mock sequence for single() calls
    mockSupabase.single.mockImplementation(() => {
      singleCallCount++;

      switch (singleCallCount) {
        case 1:
          return Promise.resolve({
            data: { id: "cat123", establishment_id: "est123" },
            error: null,
          });
        case 2:
          return Promise.resolve({
            data: null,
            error: null,
          });
        default:
          return Promise.resolve({ data: null, error: null });
      }
    });

    mockSupabase.select.mockImplementation((columns?: string) => {
      const lastFromCall = mockSupabase.from.mock.calls.at(-1)?.[0];

      if (lastFromCall === "menu_items" && columns === "position") {
        return {
          order: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        };
      }
      return mockSupabase;
    });

    mockSupabase.insert.mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: {
            id: "1",
            name: "Pizza",
            description: "Cheesy pizza",
            price: 25.00,
            category_id: "cat123",
            available: true,
            position: 0,
            image: "/camera-off.svg"
          },
          error: null,
        }),
      }),
    });
  });

  describe("VALID Cases", () => {
    it("U-MI-C-1001 should create menu item successfully without image", async () => {
      const menuItem: MenuItemRequestDTO = {
        id: null,
        name: "Pizza",
        description: "Chessy pizza",
        price: 25,
        categoryId: "cat123",
        available: true
      };

      const { success } = await createMenuItem(menuItem);

      expect(success).toBe(true);
    });

    it("U-MI-C-1002 should create menu item successfully with image upload", async () => {
      const mockFile = new File(["fake-image"], "pizza.jpg", { type: "image/jpeg" });

      const menuItem: MenuItemRequestDTO = {
        id: null,
        name: "Pizza",
        description: "Chessy pizza",
        price: 25,
        categoryId: "cat123",
        available: true,
        imageFile: mockFile
      };

      const { success } = await createMenuItem(menuItem);

      expect(success).toBe(true);
    });

    it("U-MI-C-1003 should create menu item that is not available successfully", async () => {
      const menuItem: MenuItemRequestDTO = {
        id: null,
        name: "Pizza",
        description: "Chessy pizza",
        price: 25,
        categoryId: "cat123",
        available: false,
      };

      const { success } = await createMenuItem(menuItem);

      expect(success).toBe(true);
    });
  });

  describe("INVALID Cases", () => {
    it("U-MI-C-2001 should return validation error when name is empty", async () => {
      const menuItem: MenuItemRequestDTO = {
        id: null,
        name: "",
        description: "Chessy pizza",
        price: 25,
        categoryId: "cat123",
        available: true
      };

      const { success, error } = await createMenuItem(menuItem);

      expect(success).toBe(false);
      expect(error).toBe("O nome deve ter pelo menos 3 caracteres.");
    });

    it("U-MI-C-2002 should return validation error when price is negative", async () => {
      const menuItem: MenuItemRequestDTO = {
        id: null,
        name: "Pizza",
        description: "Chessy pizza",
        price: -25,
        categoryId: "cat123",
        available: true
      };

      const result = await createMenuItem(menuItem);

      expect(result.success).toBe(false);
      expect(result.error).toBe("O preço deve ser maior que zero.");
    });

    it("U-MI-C-2003 should return error for invalid category", async () => {
      mockSupabase.single.mockImplementationOnce(() =>
        Promise.resolve({
          data: null,
          error: { message: "Category not found" }
        })
      );

      const menuItem: MenuItemRequestDTO = {
        id: null,
        name: "Pizza",
        description: "Chessy pizza",
        price: 25,
        categoryId: "invalid",
        available: true
      };

      const result = await createMenuItem(menuItem);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Categoria inválida.");
    });

    it("U-MI-C-2004 should return error for category from different establishment", async () => {
      mockSupabase.single.mockImplementationOnce(() =>
        Promise.resolve({
          data: { id: "cat123", establishment_id: "different-est" },
          error: null,
        })
      );

      const menuItem: MenuItemRequestDTO = {
        id: null,
        name: "Pizza",
        description: "Chessy pizza",
        price: 25,
        categoryId: "cat123",
        available: true
      };

      const result = await createMenuItem(menuItem);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Categoria inválida.");
    });

    it("U-MI-C-2005 should handle image upload failure", async () => {
      (put as jest.Mock).mockRejectedValueOnce(new Error("Upload failed"));
      const mockFile = new File(["fake"], "test.jpg");

      const menuItem: MenuItemRequestDTO = {
        id: null,
        name: "Pizza",
        description: "Chessy pizza",
        price: 25,
        categoryId: "cat123",
        available: true,
        imageFile: mockFile,
      };

      const result = await createMenuItem(menuItem);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Falha no upload da imagem: Upload failed");
    });

    it("U-MI-C-2006 should handle database insertion error", async () => {
      mockSupabase.insert.mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: "Insert failed" },
          }),
        }),
      });

      const menuItem: MenuItemRequestDTO = {
        id: null,
        name: "Pizza",
        description: "Chessy pizza",
        price: 25,
        categoryId: "cat123",
        available: true
      };

      const result = await createMenuItem(menuItem);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Erro ao criar item de menu.");
    });
  });
});

describe("UNIT - calculateNextPosition", () => {
  describe("VALID cases", () => {
    it("U-MI-CNP-1001 Should return position + 1 when maxPositon exists", async () => {
      const supabaseMock: any = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { position: 5 },
        }),
      };

      const result = await calculateNextPosition(supabaseMock);

      expect(result).toBe(6);
    });
  })
  describe("INVALID cases", () => {
    it("U-MI-CNP-2001 Should return 0 when no other position exists", async () => {
      const supabaseMock: any = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
        }),
      };

      const result = await calculateNextPosition(supabaseMock);
      expect(result).toBe(0);
    });
  })
})