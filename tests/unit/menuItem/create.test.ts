import { createMenuItem } from "@/app/actions/menuItem";
import { createClient } from "@/utils/supabase/server";
import { put } from "@vercel/blob";
import { validateMenuItem } from "@/lib/validators/menuItem";
import { revalidatePath } from "next/cache";

// Mocks
jest.mock("@/utils/supabase/server");
jest.mock("@vercel/blob");
jest.mock("@/lib/validators/menuItem", () => ({
  validateMenuItem: jest.fn(),
}));
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
    (validateMenuItem as jest.Mock).mockReturnValue([]);

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
    it("should create menu item successfully without image", async () => {
      const formData = new FormData();
      formData.append("name", "Pizza");
      formData.append("description", "Cheesy pizza");
      formData.append("price", "25.00");
      formData.append("category_id", "cat123");
      formData.append("available", "true");

      const result = await createMenuItem(formData);
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty("name", "Pizza");
      expect(result.data.image).toBe("/camera-off.svg");
      expect(put).not.toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("/menu");
    });

    it("should create menu item successfully with image upload", async () => {
      const formData = new FormData();
      formData.append("name", "Pizza");
      formData.append("description", "Cheesy pizza");
      formData.append("price", "25.00");
      formData.append("category_id", "cat123");
      formData.append("available", "true");
      
      const mockFile = new File(["fake-image"], "pizza.jpg", { type: "image/jpeg" });
      formData.append("imageFile", mockFile);

      const result = await createMenuItem(formData);
      
      expect(result.success).toBe(true);
      expect(put).toHaveBeenCalledWith("pizza.jpg", mockFile, { access: "public" });
    });

    it("should calculate correct position when items exist", async () => {
      // Mock existing items with position
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
              data: { position: 5 },
              error: null,
            });
          default:
            return Promise.resolve({ data: null, error: null });
        }
      });

      const formData = new FormData();
      formData.append("name", "Pizza");
      formData.append("description", "Cheesy pizza");
      formData.append("price", "25.00");
      formData.append("category_id", "cat123");
      formData.append("available", "true");

      const result = await createMenuItem(formData);
      
      expect(result.success).toBe(true);
    });
  });

  describe("INVALID Cases", () => {
    it("should return validation errors", async () => {
      (validateMenuItem as jest.Mock).mockReturnValue(["Name is required", "Price must be positive"]);

      const formData = new FormData();
      formData.append("name", "");
      formData.append("price", "-10");

      const result = await createMenuItem(formData);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Name is required");
    });

    it("should return error for invalid category", async () => {
      mockSupabase.single.mockImplementationOnce(() =>
        Promise.resolve({ 
          data: null, 
          error: { message: "Category not found" } 
        })
      );

      const formData = new FormData();
      formData.append("name", "Pizza");
      formData.append("category_id", "invalid");

      const result = await createMenuItem(formData);

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/categoria inválida/i);
    });

    it("should return error for category from different establishment", async () => {
      mockSupabase.single.mockImplementationOnce(() =>
        Promise.resolve({
          data: { id: "cat123", establishment_id: "different-est" },
          error: null,
        })
      );

      const formData = new FormData();
      formData.append("name", "Pizza");
      formData.append("category_id", "cat123");

      const result = await createMenuItem(formData);

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/categoria inválida para este estabelecimento/i);
    });

    it("should handle image upload failure", async () => {
      (put as jest.Mock).mockRejectedValueOnce(new Error("Upload failed"));

      const formData = new FormData();
      formData.append("name", "Pizza");
      formData.append("imageFile", new File(["fake"], "test.jpg"));

      const result = await createMenuItem(formData);

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/falha no upload/i);
    });

    it("should handle database insertion error", async () => {
      mockSupabase.insert.mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: "Insert failed" },
          }),
        }),
      });

      const formData = new FormData();
      formData.append("name", "Pizza");

      const result = await createMenuItem(formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Erro ao criar item de menu.");
    });
  });
});