import { updateMenuItem, updateMenuItemAvailability, updateMenuOrdernation } from "@/app/actions/menuItem";
import { createClient } from "@/utils/supabase/server";
import { put, del } from "@vercel/blob";
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

describe("UNIT — updateMenuItem", () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    (put as jest.Mock).mockResolvedValue({ url: "https://mock.com/new-image.jpg" });
    (del as jest.Mock).mockResolvedValue({});
    (validateMenuItem as jest.Mock).mockReturnValue([]);
  });

  describe("VALID Cases", () => {
    it("U-MI-U-1001 should update menu item successfully without image change", async () => {
      mockSupabase.single
        .mockResolvedValueOnce({ // Check category
          data: { id: "cat123", establishment_id: "est123" },
          error: null,
        })
        .mockResolvedValueOnce({ // Update item
          data: { id: "1", name: "Updated Pizza", price: 30.00 },
          error: null,
        });

      const formData = new FormData();
      formData.append("name", "Updated Pizza");
      formData.append("price", "30.00");
      formData.append("category_id", "cat123");
      formData.append("available", "true");
      formData.append("image", "/camera-off.svg");

      const result = await updateMenuItem("1", formData);

      expect(result.success).toBe(true);
      expect(result.data.name).toBe("Updated Pizza");
      expect(put).not.toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("/menu");
    });

    it("U-MI-U-1002 should update menu item with new image and delete old one", async () => {
      mockSupabase.single
        .mockResolvedValueOnce({ // Check category
          data: { id: "cat123", establishment_id: "est123" },
          error: null,
        })
        .mockResolvedValueOnce({ // Update item
          data: { id: "1", name: "Pizza", image: "https://mock.com/new-image.jpg" },
          error: null,
        });

      const formData = new FormData();
      formData.append("name", "Pizza");
      formData.append("image", "https://old-image.com/old.jpg");
      formData.append("imageFile", new File(["new-image"], "new.jpg"));

      const result = await updateMenuItem("1", formData);

      expect(result.success).toBe(true);
      expect(put).toHaveBeenCalledWith("new.jpg", expect.any(File), { access: "public" });
      expect(del).toHaveBeenCalledWith("https://old-image.com/old.jpg");
    });

    it("U-MI-U-1003 should not delete placeholder image when updating", async () => {
      mockSupabase.single
        .mockResolvedValueOnce({ // Check category
          data: { id: "cat123", establishment_id: "est123" },
          error: null,
        })
        .mockResolvedValueOnce({ // Update item
          data: { id: "1", name: "Pizza" },
          error: null,
        });

      const formData = new FormData();
      formData.append("name", "Pizza");
      formData.append("image", "/camera-off.svg");
      formData.append("imageFile", new File(["new-image"], "new.jpg"));

      const result = await updateMenuItem("1", formData);

      expect(result.success).toBe(true);
      expect(del).not.toHaveBeenCalledWith("/camera-off.svg");
    });
  });

  describe("INVALID Cases", () => {
    it("U-MI-U-2001 should return error for invalid ID", async () => {
      const result = await updateMenuItem("", new FormData());

      expect(result.success).toBe(false);
      expect(result.error).toBe("ID do item de menu inválido.");
    });

    it("U-MI-U-2002 should return validation errors", async () => {
      (validateMenuItem as jest.Mock).mockReturnValue(["Invalid price"]);

      const formData = new FormData();
      formData.append("price", "-10");

      const result = await updateMenuItem("1", formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid price");
    });

    it("U-MI-U-2003 should return error for invalid category", async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: "Category not found" },
      });

      const formData = new FormData();
      formData.append("category_id", "invalid");

      const result = await updateMenuItem("1", formData);

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/categoria inválida/i);
    });

    it("U-MI-U-2004 should handle image upload failure", async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: "cat123", establishment_id: "est123" },
        error: null,
      });
      (put as jest.Mock).mockRejectedValueOnce(new Error("Upload failed"));

      const formData = new FormData();
      formData.append("imageFile", new File(["fake"], "test.jpg"));

      const result = await updateMenuItem("1", formData);

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/falha no upload/i);
    });
  });
});

describe("UNIT — updateMenuItemAvailability", () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it("U-MI-UA-1001 should update availability successfully", async () => {
    mockSupabase.eq.mockResolvedValueOnce({
      error: null,
    });

    const result = await updateMenuItemAvailability("1", true);

    expect(result.success).toBe(true);
    expect(mockSupabase.update).toHaveBeenCalledWith({ available: true });
    expect(revalidatePath).toHaveBeenCalledWith("/menu");
  });

  it("U-MI-UA-1002 should return error for invalid ID", async () => {
    const result = await updateMenuItemAvailability("", true);

    expect(result.success).toBe(false);
    expect(result.error).toBe("ID do item de menu inválido.");
  });

  it("U-MI-UA-1003 should handle database error", async () => {
    mockSupabase.eq.mockResolvedValueOnce({
      error: { message: "Update failed" },
    });

    const result = await updateMenuItemAvailability("1", true);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Erro ao atualizar a disponibilidade.");
  });
});

describe("UNIT — updateMenuOrdernation", () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  it("U-MI-UO-1001 should update menu order successfully", async () => {
    mockSupabase.eq.mockResolvedValue({ error: null });

    const result = await updateMenuOrdernation(["1", "2", "3"]);

    expect(result.success).toBe(true);
    expect(mockSupabase.from).toHaveBeenCalledWith("menu_items");
    expect(revalidatePath).toHaveBeenCalledWith("/menu");
  });

  it("U-MI-UO-1002 should handle empty array as valid input", async () => {
    // Array vazio é considerado válido pela função
    mockSupabase.eq.mockResolvedValue({ error: null });

    const result = await updateMenuOrdernation([]);

    expect(result.success).toBe(true);
    // Quando o array é vazio, não deve fazer atualizações no banco
    // mas ainda retorna success: true
  });

  it("U-MI-UO-1003 should return error for null IDs", async () => {
    const result = await updateMenuOrdernation(null as any);

    expect(result.success).toBe(false);
    expect(result.error).toBe("IDs de ordenação inválidos.");
  });

  it("U-MI-UO-1004 should return error for non-array IDs", async () => {
    const result = await updateMenuOrdernation("not-an-array" as any);

    expect(result.success).toBe(false);
    expect(result.error).toBe("IDs de ordenação inválidos.");
  });

  it("U-MI-UO-1005 should handle database error", async () => {
    mockSupabase.eq.mockResolvedValue({ error: { message: "Update failed" } });

    const result = await updateMenuOrdernation(["1", "2"]);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Erro ao atualizar a ordem dos itens.");
  });
});