// create-order.test.ts
import { createClient } from "@/lib/supabase/server";
import { createOrder, OrderRequestDTO } from "@/app/actions/orders";
import { ESTABLISHMENT_ID } from "@/utils/config";

jest.mock("@/lib/supabase/server");
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
    tableNumber: 5,
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
    it("should create order with order lines successfully", async () => {
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
        error: null
      });

      const result = await createOrder(mockValidOrder);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockOrderCreated);
      
      // Verifica os parametros passados para o supabase
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        total: "100.50",
        type: "LOCAL",
        status: "OPEN",
        establishment_id: ESTABLISHMENT_ID,
        table_number: 5,
        delivery_fee: 0,
        estimated_time: 30,
        customer_id: "customer-123"
      });
    });

    it("should create order without order lines successfully", async () => {
      const mockOrderCreated = { id: "order-124" };
      const orderWithoutLines = { ...mockValidOrder, orderLines: [] };
      
      mockSupabase.insert.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          single: jest.fn().mockResolvedValueOnce({
            data: mockOrderCreated,
            error: null
          })
        })
      });

      const result = await createOrder(orderWithoutLines);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockOrderCreated);
    });
  });

  describe("INVALID Cases", () => {
    it("should return error when order creation fails", async () => {
      mockSupabase.insert.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          single: jest.fn().mockResolvedValueOnce({
            data: null,
            error: { message: "Database error" }
          })
        })
      });

      const result = await createOrder(mockValidOrder);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Erro ao criar pedido.");
    });

    it("should return error when order lines creation fails", async () => {
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

      const result = await createOrder(mockValidOrder);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Order lines creation failed");
    });
  });
});