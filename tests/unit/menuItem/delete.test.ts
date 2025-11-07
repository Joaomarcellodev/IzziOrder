import { deleteMenuItem } from "@/app/actions/menuItem";
import { createClient } from "@/utils/supabase/server";
import { del } from "@vercel/blob";
import { revalidatePath } from "next/cache";

// Mocks
jest.mock("@/utils/supabase/server");
jest.mock("@vercel/blob");
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

describe("UNIT — deleteMenuItem", () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    (del as jest.Mock).mockResolvedValue({});
    
    // Silencia console.warn
    consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restaura console.warn
    consoleSpy.mockRestore();
  });

  describe("VALID Cases", () => {
    it("should delete menu item successfully with image deletion", async () => {
      // Mock Supabase
      const mockSingle = jest.fn().mockResolvedValue({
        data: { 
          id: "1", 
          image: "https://example.com/image.jpg",
          category: { establishment_id: "est123" }
        },
        error: null,
      });

      const mockUpdate = jest.fn().mockResolvedValue({
        error: null,
      });

      const mockSupabase = {
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: mockSingle,
            })),
          })),
          update: jest.fn(() => ({
            eq: mockUpdate,
          })),
        })),
      };

      (createClient as jest.Mock).mockReturnValue(mockSupabase);

      const result = await deleteMenuItem("1");

      expect(result.success).toBe(true);
      expect(del).toHaveBeenCalledWith("https://example.com/image.jpg");
      expect(revalidatePath).toHaveBeenCalledWith("/menu");
    });

    it("should delete menu item without deleting placeholder image", async () => {
      const mockSingle = jest.fn().mockResolvedValue({
        data: { 
          id: "1", 
          image: "/camera-off.svg",
          category: { establishment_id: "est123" }
        },
        error: null,
      });

      const mockUpdate = jest.fn().mockResolvedValue({
        error: null,
      });

      const mockSupabase = {
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: mockSingle,
            })),
          })),
          update: jest.fn(() => ({
            eq: mockUpdate,
          })),
        })),
      };

      (createClient as jest.Mock).mockReturnValue(mockSupabase);

      const result = await deleteMenuItem("1");

      expect(result.success).toBe(true);
      expect(del).not.toHaveBeenCalledWith("/camera-off.svg");
    });

    it("should handle image deletion failure gracefully", async () => {
      const mockSingle = jest.fn().mockResolvedValue({
        data: { 
          id: "1", 
          image: "https://example.com/image.jpg",
          category: { establishment_id: "est123" }
        },
        error: null,
      });

      const mockUpdate = jest.fn().mockResolvedValue({
        error: null,
      });

      const mockSupabase = {
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: mockSingle,
            })),
          })),
          update: jest.fn(() => ({
            eq: mockUpdate,
          })),
        })),
      };

      (createClient as jest.Mock).mockReturnValue(mockSupabase);
      (del as jest.Mock).mockRejectedValueOnce(new Error("Delete failed"));

      const result = await deleteMenuItem("1");

      expect(result.success).toBe(true);
      // Verifica que console.warn foi chamado (mas silenciado pelo spy)
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe("INVALID Cases", () => {
    it("should return error for invalid ID", async () => {
      // Mock básico para evitar erros
      const mockSupabase = {
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(),
            })),
          })),
        })),
      };
      (createClient as jest.Mock).mockReturnValue(mockSupabase);

      const result = await deleteMenuItem("");

      expect(result.success).toBe(false);
      expect(result.error).toBe("ID do item de menu inválido.");
    });

    it("should return error when item not found", async () => {
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { message: "Item not found" },
      });

      const mockSupabase = {
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: mockSingle,
            })),
          })),
        })),
      };

      (createClient as jest.Mock).mockReturnValue(mockSupabase);

      const result = await deleteMenuItem("1");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Item de menu não encontrado.");
    });

    it("should handle database deletion error", async () => {
      const mockSingle = jest.fn().mockResolvedValue({
        data: { 
          id: "1", 
          image: "/camera-off.svg",
          category: { establishment_id: "est123" }
        },
        error: null,
      });

      const mockUpdate = jest.fn().mockResolvedValue({
        error: { message: "Delete failed" },
      });

      const mockSupabase = {
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: mockSingle,
            })),
          })),
          update: jest.fn(() => ({
            eq: mockUpdate,
          })),
        })),
      };

      (createClient as jest.Mock).mockReturnValue(mockSupabase);

      const result = await deleteMenuItem("1");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Erro ao excluir item de menu.");
    });
  });
});