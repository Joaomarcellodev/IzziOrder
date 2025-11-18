import { createClient } from "@/utils/supabase/server";
import { createOrder, OrderRequestDTO } from "@/app/actions/orders";
import { ESTABLISHMENT_ID } from "@/utils/config";
import { experimental_taintObjectReference } from "react";

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

  describe("VALID Cases", () => {
    it("OR-C-1001 should create order with order lines successfully", async () => {
      const order: OrderRequestDTO = {
        total: 100.50,
        type: "LOCAL",
        deliveryFee: 0,
        estimatedTime: 30,
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

      mockSupabase.insert.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          single: jest.fn().mockResolvedValueOnce({
            data: order,
            error: null
          })
        })
      });

      mockSupabase.insert.mockReturnValueOnce({
        data: null,
        error: null
      });

      const { success } = await createOrder(order);

      expect(success).toBe(true);
    });

    it("OR-C-1002 should create order without order lines successfully", async () => {
      const order: OrderRequestDTO = {
        total: 100.50,
        type: "LOCAL",
        deliveryFee: 0,
        estimatedTime: 30,
        orderLines: []
      };

      mockSupabase.insert.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          single: jest.fn().mockResolvedValueOnce({
            data: order,
            error: null
          })
        })
      });

      const { success } = await createOrder(order);

      expect(success).toBe(true);
    });

    it("OR-C-1003 should create order with type \"PICKUP\" and details successfully", async () => {
      const order: OrderRequestDTO = {
        total: 100.50,
        type: "PICKUP",
        deliveryFee: 0,
        detail: "Customer Name",
        orderLines: []
      };

      mockSupabase.insert.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          single: jest.fn().mockResolvedValueOnce({
            data: order,
            error: null
          })
        })
      });

      const { success } = await createOrder(order);

      expect(success).toBe(true);
    });
  });

  describe("INVALID Cases", () => {
    it("OR-C-2001 should return error when order creation fails", async () => {
      const order: OrderRequestDTO = {
        total: 100.50,
        type: "LOCAL",
        deliveryFee: 0,
        estimatedTime: 30,
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

      mockSupabase.insert.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          single: jest.fn().mockResolvedValueOnce({
            data: null,
            error: { message: "Database error" }
          })
        })
      });

      const { success, error } = await createOrder(order);

      expect(success).toBe(false);
      expect(error).toBe("Erro ao criar pedido.");
    });

    it("OR-C-2002 should return error when order lines creation fails", async () => {
      const order: OrderRequestDTO = {
        total: 100.50,
        type: "LOCAL",
        deliveryFee: 0,
        estimatedTime: 30,
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

      mockSupabase.insert.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          single: jest.fn().mockResolvedValueOnce({
            data: order,
            error: null
          })
        })
      });

      mockSupabase.insert.mockReturnValueOnce({
        data: null,
        error: { message: "Order lines creation failed" }
      });

      const { success, error } = await createOrder(order);

      expect(success).toBe(false);
      expect(error).toBe("Erro ao criar as linhas do pedido.");
    });

    it("OR-C-2003 should return error when order with type is \"PICKUP\" there is no details", async () => {
      const order: OrderRequestDTO = {
        total: 100.50,
        type: "PICKUP",
        deliveryFee: 0,
        orderLines: []
      };

      mockSupabase.insert.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          single: jest.fn().mockResolvedValueOnce({
            data: order,
            error: null
          })
        })
      });

      const { success, error } = await createOrder(order);

      expect(success).toBe(false);
      expect(error).toBe("Pedido do tipo retirada precisa de pelo menos 3 caracteres no nome do cliente.");
    });

    it("OR-C-2004 should return error when order with type is \"PICKUP\" and details.length < 3 no details", async () => {
      const order: OrderRequestDTO = {
        total: 100.50,
        type: "PICKUP",
        detail: "Jo",
        deliveryFee: 0,
        orderLines: []
      };

      mockSupabase.insert.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          single: jest.fn().mockResolvedValueOnce({
            data: order,
            error: null
          })
        })
      });

      const { success, error } = await createOrder(order);

      expect(success).toBe(false);
      expect(error).toBe("Pedido do tipo retirada precisa de pelo menos 3 caracteres no nome do cliente.");
    });
  });
});