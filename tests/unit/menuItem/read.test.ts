import { getMenuItems } from "@/app/actions/menuItem";
import { createClient } from "@/utils/supabase/server";

// Mocks
jest.mock("@/utils/supabase/server");

describe("UNIT — getMenuItems", () => {
  let mockSupabase: any;
  let mockChain: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Cria uma cadeia de métodos mockada
    mockChain = {
      data: null,
      error: null,
    };

    mockSupabase = {
      from: jest.fn(() => mockChain),
    };

    // Configurar a cadeia de métodos
    mockChain.select = jest.fn(() => mockChain);
    mockChain.eq = jest.fn(() => mockChain);

    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  describe("VALID Cases", () => {
    it("U-MI-R-1001 should return menu items successfully", async () => {
      const mockMenuItems = [
        { id: "1", name: "Pizza", price: 25.00, available: true },
        { id: "2", name: "Burger", price: 15.00, available: true },
      ];

      mockChain.data = mockMenuItems;
      mockChain.error = null;

      const result = await getMenuItems("est123");

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockMenuItems);

      // Verificar a cadeia de chamadas
      expect(mockSupabase.from).toHaveBeenCalledWith("menu_items");
      expect(mockChain.select).toHaveBeenCalledWith();
      expect(mockChain.eq).toHaveBeenCalledWith("establishment_id", "est123");
      expect(mockChain.eq).toHaveBeenCalledWith("is_active", true);
    });

    it("U-MI-R-1002 should return empty array when no menu items exist", async () => {
      mockChain.data = [];
      mockChain.error = null;

      const result = await getMenuItems("est123");

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  describe("INVALID Cases", () => {
    it("U-MI-R-2001 should return error when database query fails", async () => {
      mockChain.data = null;
      mockChain.error = { message: "Database error" };

      const result = await getMenuItems("est123");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Erro ao recuperar as itens do menu.");
    });
  });
});