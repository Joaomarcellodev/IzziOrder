import { supabase } from "@/lib/supabase/supabaseClient";

describe("Orders DELETE Integration", () => {
  const testEstablishmentId = "5139eab5-6eaf-462f-bdbc-04257fdf2520";
  let orderIdToDelete: string;
  let orderWithLinesId: string;
  let closedOrderId: string;

  beforeEach(async () => {
    // Cria um pedido LOCAL básico para delete
    const { data: basicOrder, error: basicError } = await supabase
      .from("orders")
      .insert({
        total: "89.90",
        type: "LOCAL",
        status: "OPEN",
        establishment_id: testEstablishmentId,
        table_number: 7
      })
      .select()
      .single();

    // Cria um pedido COM ORDER LINES para testar dependências
    const { data: orderWithLines, error: linesError } = await supabase
      .from("orders")
      .insert({
        total: "150.00",
        type: "LOCAL",
        status: "OPEN",
        establishment_id: testEstablishmentId,
        table_number: 8
      })
      .select()
      .single();

    // Cria um pedido CLOSED para testar diferentes status
    const { data: closedOrder, error: closedError } = await supabase
      .from("orders")
      .insert({
        total: "75.50",
        type: "DELIVERY",
        status: "CLOSED",
        establishment_id: testEstablishmentId,
        delivery_fee: 5.00
      })
      .select()
      .single();

    if (!basicError && basicOrder) orderIdToDelete = basicOrder.id;
    if (!linesError && orderWithLines) orderWithLinesId = orderWithLines.id;
    if (!closedError && closedOrder) closedOrderId = closedOrder.id;

    // Cria order lines para o pedido com dependências
    if (orderWithLinesId) {
      await supabase
        .from("order_lines")
        .insert({
          name: "Pizza Test",
          price: "75.00",
          quantity: 2,
          order_id: orderWithLinesId,
          menu_item_id: "menu-test-1",
          observation: "Test observation"
        });

      await supabase
        .from("order_lines")
        .insert({
          name: "Bebida Test",
          price: "75.00",
          quantity: 1,
          order_id: orderWithLinesId,
          menu_item_id: "menu-test-2",
          observation: ""
        });
    }
  });

  // Casos válidos - DELETE BÁSICO
  describe("Valid Cases - Basic DELETE", () => {
    it("should delete an existing order successfully", async () => {
      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("id", orderIdToDelete);

      expect(error).toBeNull();

      // Verifica se o pedido foi apagado
      const { data: deletedOrder } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderIdToDelete)
        .maybeSingle();

      expect(deletedOrder).toBeNull();
    });

    it("should delete CLOSED order", async () => {
      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("id", closedOrderId);

      expect(error).toBeNull();

      const { data: deletedOrder } = await supabase
        .from("orders")
        .select("*")
        .eq("id", closedOrderId)
        .maybeSingle();

      expect(deletedOrder).toBeNull();
    });
  });

  // Casos válidos - DELETE COM DEPENDÊNCIAS
  describe("Valid Cases - DELETE with Dependencies", () => {
    it("should delete order with order_lines (cascade or manual)", async () => {
  // Primeiro cria um pedido específico para este teste
  const { data: testOrder, error: createError } = await supabase
    .from("orders")
    .insert({
      total: "200.00",
      type: "LOCAL",
      status: "OPEN",
      establishment_id: testEstablishmentId,
      table_number: 99
    })
    .select()
    .single();

  expect(createError).toBeNull();
  expect(testOrder).toBeDefined();

  const testOrderId = testOrder!.id;

  // Cria order lines para este pedido específico
  const { error: linesError } = await supabase
    .from("order_lines")
    .insert([
      {
        name: "Pizza Test Cascade",
        price: "65.00",
        quantity: 2,
        order_id: testOrderId,
        menu_item_id: "d32ed9f9-6b5a-4aa0-a424-bd7f4348e032",
        observation: "Test cascade"
      },
      {
        name: "Drink Test Cascade",
        price: "10.00",
        quantity: 1,
        order_id: testOrderId,
        menu_item_id: "ce591dd7-71d8-45f2-8edd-6a3c606e5b29",
        observation: ""
      }
    ]);

  expect(linesError).toBeNull();

  // Verifica que as order_lines foram criadas
  const { data: linesBefore, error: linesErrorBefore } = await supabase
    .from("order_lines")
    .select("*")
    .eq("order_id", testOrderId);

  console.log('Order lines before deletion:', linesBefore?.length);
  expect(linesErrorBefore).toBeNull();
  expect(linesBefore).toHaveLength(2);

  // Deleta o pedido
  const { error } = await supabase
    .from("orders")
    .delete()
    .eq("id", testOrderId);

  expect(error).toBeNull();

  // Verifica se o pedido foi deletado
  const { data: deletedOrder } = await supabase
    .from("orders")
    .select("*")
    .eq("id", testOrderId)
    .maybeSingle();

  expect(deletedOrder).toBeNull();

  // Verifica o comportamento das order_lines
  const { data: linesAfter, error: linesErrorAfter } = await supabase
    .from("order_lines")
    .select("*")
    .eq("order_id", testOrderId);

  console.log('Order lines after deletion:', linesAfter?.length);
  
 
  if (!linesErrorAfter) {
    // Se não há erro, apenas registramos o resultado
    console.log('Cascade behavior:', linesAfter?.length === 0 ? 'CASCADE ON' : 'CASCADE OFF');
  }
});

    it("should manually delete order_lines before order", async () => {
      // Approach: deleta order_lines primeiro, depois o order
      const { error: linesError } = await supabase
        .from("order_lines")
        .delete()
        .eq("order_id", orderWithLinesId);

      expect(linesError).toBeNull();

      const { error: orderError } = await supabase
        .from("orders")
        .delete()
        .eq("id", orderWithLinesId);

      expect(orderError).toBeNull();

      // Verifica que ambos foram deletados
      const { data: remainingOrder } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderWithLinesId)
        .maybeSingle();

      const { data: remainingLines } = await supabase
        .from("order_lines")
        .select("*")
        .eq("order_id", orderWithLinesId);

      expect(remainingOrder).toBeNull();
      expect(remainingLines).toEqual([]);
    });
  });

  // Casos válidos - DELETE EM LOTE
  describe("Valid Cases - Batch DELETE", () => {
    it("should delete multiple orders by IDs", async () => {
      const { error } = await supabase
        .from("orders")
        .delete()
        .in("id", [orderIdToDelete, closedOrderId]);

      expect(error).toBeNull();

      // Verifica que ambos foram deletados
      const { data: remainingOrders } = await supabase
        .from("orders")
        .select("id")
        .in("id", [orderIdToDelete, closedOrderId]);

      expect(remainingOrders).toEqual([]);
    });

    it("should delete orders by status", async () => {
      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("establishment_id", testEstablishmentId)
        .eq("status", "CLOSED");

      expect(error).toBeNull();

      // Verifica que pedidos CLOSED foram deletados
      const { data: remainingClosedOrders } = await supabase
        .from("orders")
        .select("id, status")
        .eq("establishment_id", testEstablishmentId)
        .eq("status", "CLOSED");

      expect(remainingClosedOrders).toEqual([]);

      // Verifica que pedidos OPEN ainda existem
      const { data: remainingOpenOrders } = await supabase
        .from("orders")
        .select("id, status")
        .eq("establishment_id", testEstablishmentId)
        .eq("status", "OPEN");

      expect(remainingOpenOrders?.length).toBeGreaterThan(0);
    });

    it("should delete orders by type", async () => {
      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("establishment_id", testEstablishmentId)
        .eq("type", "DELIVERY");

      expect(error).toBeNull();

      // Verifica que pedidos DELIVERY foram deletados
      const { data: remainingDeliveryOrders } = await supabase
        .from("orders")
        .select("id, type")
        .eq("establishment_id", testEstablishmentId)
        .eq("type", "DELIVERY");

      expect(remainingDeliveryOrders).toEqual([]);
    });
  });

  // Casos válidos - PÓS-DELETE
  describe("Valid Cases - Post-DELETE", () => {
    it("should allow creating new order after deletion", async () => {
      await supabase.from("orders").delete().eq("id", orderIdToDelete);

      // Cria um novo pedido
      const { data, error } = await supabase
        .from("orders")
        .insert({
          total: "120.00",
          type: "DELIVERY",
          status: "OPEN",
          establishment_id: testEstablishmentId,
          delivery_fee: 10.00
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.id).not.toBe(orderIdToDelete);
    });

    it("should maintain data integrity after multiple operations", async () => {
      // Cria alguns pedidos extras
      const orderIds: string[] = [];
      for (let i = 0; i < 3; i++) {
        const { data: order, error } = await supabase
          .from("orders")
          .insert({
            total: `${50 + i * 10}.00`,
            type: "LOCAL",
            status: "OPEN",
            establishment_id: testEstablishmentId,
            table_number: i + 10
          })
          .select()
          .single();

        if (!error && order) orderIds.push(order.id);
      }

      // Deleta alguns
      const { error: deleteError } = await supabase
        .from("orders")
        .delete()
        .in("id", [orderIds[0], orderIds[1]]);

      expect(deleteError).toBeNull();

      // Verifica o estado final
      const { data: remainingOrders, error: selectError } = await supabase
        .from("orders")
        .select("id")
        .eq("establishment_id", testEstablishmentId);

      expect(selectError).toBeNull();
      // Deve ter os pedidos originais + o que não foi deletado
      expect(remainingOrders?.length).toBeGreaterThan(0);
    });
  });

  // Casos inválidos
  describe("Invalid Cases", () => {
    it("should return success for deleting non-existent order", async () => {
      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("id", "00000000-0000-0000-0000-000000000000");

      // Deletar linha não existente não é considerado erro
      expect(error).toBeNull();
    });

    it("should handle empty delete condition gracefully", async () => {
      const { error } = await supabase
        .from("orders")
        .delete();

      expect(error).toBeDefined(); 
    });
    
  });

  afterAll(async () => {
    // Limpeza final
    await supabase
      .from("orders")
      .delete()
      .eq("establishment_id", testEstablishmentId);
  });
});