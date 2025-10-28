// read-orders.test.ts
import { createClient } from "@/lib/supabase/server";
import { getOrders, getOrderById } from "@/app/actions/orders";
import { ESTABLISHMENT_ID } from "@/utils/config";

jest.mock("@/lib/supabase/server");
jest.mock("@/utils/config");

const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis()
};

describe("READ Orders", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
    (ESTABLISHMENT_ID as string) = "test-establishment-id";
  });

  describe("getOrders - Get all orders", () => {
    describe("VALID Cases", () => {
      it("should return orders list with formatted codes and customer names", async () => {
        const mockOrdersData = [
          {
            id: "order-1",
            type: "LOCAL",
            table_number: 1,
            delivery_fee: 0,
            estimated_time: 20,
            customer: { name: "Customer 1" },
            order_lines: [{ id: "line-1", name: "Item 1", quantity: 1 }]
          },
          {
            id: "order-2", 
            type: "DELIVERY",
            table_number: null,
            delivery_fee: 5.00,
            estimated_time: 40,
            customer: null,
            order_lines: [{ id: "line-2", name: "Item 2", quantity: 2 }]
          }
        ];

        mockSupabase.from.mockReturnValueOnce({
          select: jest.fn().mockReturnValueOnce({
            eq: jest.fn().mockReturnValueOnce({
              order: jest.fn().mockResolvedValueOnce({
                data: mockOrdersData,
                error: null
              })
            })
          })
        });

        const result = await getOrders(ESTABLISHMENT_ID);

        expect(result.success).toBe(true);

        if (!result.success || !result.data) {
          fail('Expected result to be successful with data');
        }
        
        expect(result.data).toHaveLength(2);
        

        expect(result.data[0].code).toContain("#LOC");
        expect(result.data[0].customerName).toBe("Customer 1");

        expect(result.data[1].code).toContain("#DLV");
        expect(result.data[1].customerName).toBeNull();
      });

      it("should return empty array when no orders exist", async () => {
        mockSupabase.from.mockReturnValueOnce({
          select: jest.fn().mockReturnValueOnce({
            eq: jest.fn().mockReturnValueOnce({
              order: jest.fn().mockResolvedValueOnce({
                data: [],
                error: null
              })
            })
          })
        });

        const result = await getOrders(ESTABLISHMENT_ID);

        expect(result.success).toBe(true);

        if (!result.success || !result.data) {
          fail('Expected result to be successful with data');
        }
        
        expect(result.data).toEqual([]);
      });
    });

    describe("INVALID Cases", () => {
      it("should return error when database query fails", async () => {
        mockSupabase.from.mockReturnValueOnce({
          select: jest.fn().mockReturnValueOnce({
            eq: jest.fn().mockReturnValueOnce({
              order: jest.fn().mockResolvedValueOnce({
                data: null,
                error: { message: "Database connection failed" }
              })
            })
          })
        });

        const result = await getOrders(ESTABLISHMENT_ID);

        expect(result.success).toBe(false);
        expect(result.error).toBe("Erro ao buscar pedidos.");
      });
    });
  });

  describe("getOrderById - Get order by ID", () => {
    describe("VALID Cases", () => {
      it("should return order when ID exists", async () => {
        const mockOrder = { 
          id: "order-123", 
          total: 100.50, 
          status: "OPEN",
          type: "LOCAL"
        };

        mockSupabase.from.mockReturnValueOnce({
          select: jest.fn().mockReturnValueOnce({
            eq: jest.fn().mockReturnValueOnce({
              single: jest.fn().mockResolvedValueOnce({
                data: mockOrder,
                error: null
              })
            })
          })
        });

        const result = await getOrderById("order-123");

        expect(result.success).toBe(true);

        if (!result.success || !result.data) {
          fail('Expected result to be successful with data');
        }
        
        expect(result.data).toEqual(mockOrder);
      });
    });

    describe("INVALID Cases", () => {
      it("should return error when ID is empty", async () => {
        const result = await getOrderById("");

        expect(result.success).toBe(false);
        expect(result.error).toBe("ID do pedido inválido.");
      });

      it("should return error when order is not found", async () => {
        mockSupabase.from.mockReturnValueOnce({
          select: jest.fn().mockReturnValueOnce({
            eq: jest.fn().mockReturnValueOnce({
              single: jest.fn().mockResolvedValueOnce({
                data: null,
                error: { message: "Order not found" }
              })
            })
          })
        });

        const result = await getOrderById("non-existent-id");

        expect(result.success).toBe(false);
        expect(result.error).toBe("Pedido não encontrado.");
      });
    });
  });
});