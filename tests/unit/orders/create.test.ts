import { createClient } from "@/utils/supabase/server";
import { createOrder, OrderRequestDTO } from "@/app/actions/orders";
import { ESTABLISHMENT_ID } from "@/utils/config";

jest.mock("@/utils/supabase/server");
jest.mock("@/utils/config");
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn()
}));

const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis()
};

describe("CREATE Order - createOrder", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
    (ESTABLISHMENT_ID as string) = "test-establishment-id";
  });

  const mockValidOrder: OrderRequestDTO = {
    total: 100.50,
    type: "LOCAL",
    deliveryFee: 0,
    estimatedTime: 30,
    customerId: "customer-123",
    orderLines: [
      {
        menuItemId: "item-1",
        name: "Pizza",
        quantity: 2,
        price: 50.25,
        observation: "No onions"
      }
    ]
  };

  describe("VALID Cases", () => {
    it("OR-1001 should create order with order lines successfully", async () => {
      mockSupabase.insert.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          single: jest.fn().mockResolvedValueOnce({
            data: mockValidOrder,
            error: null
          })
        })
      });

      mockSupabase.insert.mockReturnValueOnce({
        data: null,
        error: null
      });

      const { success, data } = await createOrder(mockValidOrder);

      expect(success).toBe(true);
      expect(data).toEqual(mockValidOrder);
    });

    it("OR-1002 should create order without order lines successfully", async () => {
      const orderWithoutLines = { ...mockValidOrder, orderLines: [] };

      mockSupabase.insert.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          single: jest.fn().mockResolvedValueOnce({
            data: orderWithoutLines,
            error: null
          })
        })
      });

      const { success, data } = await createOrder(orderWithoutLines);

      expect(success).toBe(true);
      expect(data).toEqual(orderWithoutLines);
    });
  });

  describe("INVALID Cases", () => {
    it("OR-2001 should return error when order creation fails", async () => {
      mockSupabase.insert.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          single: jest.fn().mockResolvedValueOnce({
            data: null,
            error: { message: "Database error" }
          })
        })
      });

      const { success, error } = await createOrder(mockValidOrder);

      expect(success).toBe(false);
      expect(error).toBe("Erro ao criar pedido.");
    });

    it("OR-2002 should return error when order lines creation fails", async () => {
      const mockOrderCreated = { id: "order-123" };

      mockSupabase.insert.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          single: jest.fn().mockResolvedValueOnce({
            data: mockOrderCreated,
            error: null
          })
        })
      });

      mockSupabase.insert.mockReturnValueOnce({
        data: null,
        error: { message: "Order lines creation failed" }
      });

      const { success, error } = await createOrder(mockValidOrder);

      expect(success).toBe(false);
      expect(error).toBe("Erro ao criar as linhas do pedido.");
    });
  });
});