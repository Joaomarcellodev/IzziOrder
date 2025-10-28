// update-orders.test.ts
import { createClient } from "@/lib/supabase/server";
import { updateOrder, updateToClosedOrder } from "@/app/actions/orders";

jest.mock("@/lib/supabase/server");
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn()
}));

const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis()
};

describe("UPDATE Orders", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  describe("updateOrder - Update complete order", () => {
    const mockValidUpdates = {
      total: 150.75,
      type: "DELIVERY" as const,
      deliveryFee: 10.00,
      estimatedTime: 45,
      customerId: "customer-456",
      orderLines: [
        {
          id: "line-1",
          menuItemId: "item-1",
          name: "Updated Pizza",
          quantity: 3,
          price: 50.25,
          observation: "Extra cheese"
        },
        {
          menuItemId: "item-2", 
          name: "New Item",
          quantity: 1,
          price: 25.00,
          observation: ""
        }
      ]
    };

    describe("VALID Cases", () => {
      it("should update order and manage order lines successfully", async () => {
        const mockUpdatedOrder = { id: "order-123", ...mockValidUpdates };

        mockSupabase.from.mockReturnValueOnce({
          update: jest.fn().mockReturnValueOnce({
            eq: jest.fn().mockReturnValueOnce({
              select: jest.fn().mockReturnValueOnce({
                single: jest.fn().mockResolvedValueOnce({
                  data: mockUpdatedOrder,
                  error: null
                })
              })
            })
          })
        });

        mockSupabase.from.mockReturnValueOnce({
          select: jest.fn().mockReturnValueOnce({
            eq: jest.fn().mockResolvedValueOnce({
              data: [{ id: "line-1" }, { id: "line-old" }],
              error: null
            })
          })
        });

        mockSupabase.from.mockReturnValueOnce({
          delete: jest.fn().mockReturnValueOnce({
            in: jest.fn().mockResolvedValueOnce({ error: null })
          })
        });

        mockSupabase.from.mockReturnValueOnce({
          update: jest.fn().mockReturnValueOnce({
            eq: jest.fn().mockResolvedValueOnce({ error: null })
          })
        });

        mockSupabase.from.mockReturnValueOnce({
          insert: jest.fn().mockResolvedValueOnce({ error: null })
        });

        const result = await updateOrder("order-123", mockValidUpdates);

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockUpdatedOrder);
      });

      it("should update order WITHOUT order lines successfully", async () => {
        const mockUpdatedOrder = { id: "order-123" };
        const updatesWithoutLines = { ...mockValidUpdates, orderLines: [] };

        mockSupabase.from.mockReturnValueOnce({
          update: jest.fn().mockReturnValueOnce({
            eq: jest.fn().mockReturnValueOnce({
              select: jest.fn().mockReturnValueOnce({
                single: jest.fn().mockResolvedValueOnce({
                  data: mockUpdatedOrder,
                  error: null
                })
              })
            })
          })
        });

        const result = await updateOrder("order-123", updatesWithoutLines);

        expect(result.success).toBe(true);
      });
    });

    describe("INVALID Cases", () => {
      it("should return error when ID is empty", async () => {
        const result = await updateOrder("", mockValidUpdates);

        expect(result.success).toBe(false);
        expect(result.error).toBe("ID do pedido inválido.");
      });

      it("should return error when order update fails", async () => {

        mockSupabase.from.mockReturnValueOnce({
          update: jest.fn().mockReturnValueOnce({
            eq: jest.fn().mockReturnValueOnce({
              select: jest.fn().mockReturnValueOnce({
                single: jest.fn().mockResolvedValueOnce({
                  data: null,
                  error: { message: "Update failed" }
                })
              })
            })
          })
        });

        const result = await updateOrder("order-123", mockValidUpdates);

        expect(result.success).toBe(false);
        expect(result.error).toBe("Erro ao atualizar pedido.");
      });

      it("should return error when fetching existing order lines fails", async () => {

        mockSupabase.from.mockReturnValueOnce({
          update: jest.fn().mockReturnValueOnce({
            eq: jest.fn().mockReturnValueOnce({
              select: jest.fn().mockReturnValueOnce({
                single: jest.fn().mockResolvedValueOnce({
                  data: { id: "order-123" },
                  error: null
                })
              })
            })
          })
        });

        mockSupabase.from.mockReturnValueOnce({
          select: jest.fn().mockReturnValueOnce({
            eq: jest.fn().mockResolvedValueOnce({
              data: null,
              error: { message: "Fetch lines failed" }
            })
          })
        });

        const result = await updateOrder("order-123", mockValidUpdates);

        expect(result.success).toBe(false);
        expect(result.error).toBe("Erro ao buscar linhas do pedido.");
      });
    });
  });

  describe("updateToClosedOrder - Close order", () => {
    describe("VALID Cases", () => {
      it("should close order successfully", async () => {
        mockSupabase.from.mockReturnValueOnce({
          update: jest.fn().mockReturnValueOnce({
            eq: jest.fn().mockResolvedValueOnce({
              error: null
            })
          })
        });

        const result = await updateToClosedOrder("order-123");

        expect(result.success).toBe(true);
      });
    });

    describe("INVALID Cases", () => {
      it("should return error when ID is empty", async () => {

        const result = await updateToClosedOrder("");

        expect(result.success).toBe(false);
        expect(result.error).toBe("ID do pedido inválido.");
      });

      it("should return error when closing order fails", async () => {
        mockSupabase.from.mockReturnValueOnce({
          update: jest.fn().mockReturnValueOnce({
            eq: jest.fn().mockResolvedValueOnce({
              error: { message: "Close operation failed" }
            })
          })
        });

        const result = await updateToClosedOrder("order-123");

        expect(result.success).toBe(false);
        expect(result.error).toBe("Erro ao fechar pedido.");
      });
    });
  });
});