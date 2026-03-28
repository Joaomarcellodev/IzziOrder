import { createClient } from "@/utils/supabase/server";
import { deleteOrder } from "@/app/actions/order-actions";

jest.mock("@/utils/supabase/server");
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn()
}));

const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis()
};

describe("DELETE Order - deleteOrder", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  describe("VALID Cases", () => {
    it("U-OR-D-1001 should delete order successfully", async () => {
      mockSupabase.from.mockReturnValueOnce({
        delete: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockResolvedValueOnce({
            error: null
          })
        })
      });

      const result = await deleteOrder("order-123");

      expect(result.success).toBe(true);
    });
  });

  describe("INVALID Cases", () => {
    it("U-OR-D-2001 should return error when ID is empty", async () => {
      const result = await deleteOrder("");

      expect(result.success).toBe(false);
      expect(result.error).toBe("ID do pedido inválido.");
    });

    it("U-OR-D-2002 should return error when deletion fails", async () => {
      mockSupabase.from.mockReturnValueOnce({
        delete: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockResolvedValueOnce({
            error: { message: "Delete operation failed" }
          })
        })
      });

      const result = await deleteOrder("order-123");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Erro ao excluir pedido.");
    });
  });
});