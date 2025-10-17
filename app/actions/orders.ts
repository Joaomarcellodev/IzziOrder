"use server";

import { createClient } from "@/lib/supabase/server";
import { ESTABLISHMENT_ID } from "@/utils/config";
import { revalidatePath } from "next/cache";

// Tipo padrão de resposta
interface ActionResponse<T = any> {
  success: boolean;
  error?: string;
  data?: T;
}

// Tipo para a tabela "orders"
export interface Order {
  id: string;
  code?: string;
  date: string; // timestamp
  total: number;
  status: "OPEN" | "CLOSED";
  tableNumber?: number;
  type: "DELIVERY" | "LOCAL";
  deliveryFee?: number;
  estimatedTime?: number;
  orderLines: Array<{ id?: string; name: string; quantity: number }>;
  customerName?: string | null;
}

export interface OrderRequestDTO {
  total: number;
  tableNumber?: number;
  type: "DELIVERY" | "LOCAL";
  deliveryFee?: number;
  estimatedTime?: number;
  orderLines: Array<OrderLineRequestDTO>;
  customerId?: string | null;
}

export interface OrderLineRequestDTO {
  id?: string,
  menuItemId: string,
  name: string,
  quantity: number,
  price: number,
  observation: string;
}

/**
 * Cria um novo pedido.
 * @param orderData Dados do pedido.
 */
export async function createOrder(
  order: OrderRequestDTO
): Promise<ActionResponse<Order>> {
  const supabase = createClient();

  const { data: orderCreated, error } = await (await supabase)
    .from("orders")
    .insert({
      total: order.total.toFixed(2),
      type: order.type,
      status: "OPEN",
      establishment_id: ESTABLISHMENT_ID,
      table_number: order.tableNumber,
      delivery_fee: order.deliveryFee,
      estimated_time: order.estimatedTime,
      customer_id: order.customerId
    })
    .select("id")
    .single();

  if (error) {
    console.error("Erro ao criar pedido:", error);
    return { success: false, error: "Erro ao criar pedido." };
  }

  if (order.orderLines.length > 0) {
    const orderLinesToInsert = order.orderLines.map((line) => ({
      name: line.name,
      price: line.price,
      quantity: line.quantity,
      order_id: orderCreated.id,
      menu_item_id: line.menuItemId,
      observation: line.observation
    }));

    const { error: orderLinesError } = await (await supabase)
      .from("order_lines")
      .insert(orderLinesToInsert);

    if (orderLinesError) {
      console.error("Erro ao criar itens do pedido:", orderLinesError);
      return { success: false, error: orderLinesError.message };
    }
  }

  revalidatePath("/orders");
  return { success: true, data: orderCreated as Order };
}

/*Busca todos os pedidos.*/
export async function getOrders(establishment_id: string) {
  const supabase = createClient();

  const { data, error } = await (await supabase)
    .from("orders")
    .select("*, order_lines(*), customer:customer_id(*)")
    .eq("establishment_id", establishment_id)
    .order("date", { ascending: false });

  if (error) {
    console.error("Erro ao buscar pedidos:", error);
    return { success: false, error: "Erro ao buscar pedidos." };
  }

  const orders: Order[] = [];
  for (const orderData of data) {
    const order = orderData as Order;
    if (order.type == "LOCAL") {
      order.code = "#LOC" + "-" + order.id.slice(0, 6).toUpperCase();
    } else if (order.type == "DELIVERY") {
      order.code = "#DLV" + "-" + order.id.slice(0, 6).toUpperCase();
    }

    order.customerName = orderData.customer ? orderData.customer.name : null;
    order.tableNumber = orderData.table_number;
    order.deliveryFee = orderData.delivery_fee;
    order.estimatedTime = orderData.estimated_time;
    order.orderLines = orderData.order_lines;

    orders.push(order);
  }

  return { success: true, data: orders };
}

/**
 * Busca um pedido pelo ID.
 * @param id ID do pedido.
 */
export async function getOrderById(
  id: string
): Promise<ActionResponse<Order>> {
  const supabase = createClient();

  if (!id) {
    return { success: false, error: "ID do pedido inválido." };
  }

  const { data, error } = await (await supabase)
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Erro ao buscar pedido:", error);
    return { success: false, error: "Pedido não encontrado." };
  }

  return { success: true, data: data as Order };
}

/**
 * Atualiza um pedido existente.
 * @param id ID do pedido.
 * @param updates Campos a serem atualizados.
 */
export async function updateOrder(
  id: string,
  updates: Omit<OrderRequestDTO, "id" | "date">
): Promise<ActionResponse<Order>> {
  const supabase = createClient();

  if (!id) {
    return { success: false, error: "ID do pedido inválido." };
  }

  const { data, error } = await (await supabase)
    .from("orders")
    .update({
      total: updates.total!.toFixed(2),
      type: updates.type,
      status: "OPEN",
      table_number: updates.tableNumber,
      delivery_fee: updates.deliveryFee,
      estimated_time: updates.estimatedTime,
      customer_id: updates.customerId
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar pedido:", error);
    return { success: false, error: "Erro ao atualizar pedido." };
  }

  if (updates.orderLines.length > 0) {
    const { data: existingLines, error: fetchError } = await (await supabase)
      .from("order_lines")
      .select("id")
      .eq("order_id", id);

    if (fetchError) {
      console.error("Erro ao buscar linhas do pedido:", fetchError);
      return { success: false, error: "Erro ao buscar linhas do pedido." };
    }

    // Pega os ids das linhas existentes
    const existingIds = (existingLines ?? []).map(line => line.id);

    // Pega apenas as linhas que ainda existem ou foram editadas
    const updatedIds = updates.orderLines
      .filter(line => line.id)
      .map(line => line.id);

    // Pega os ids que existem no banco mas não no update
    const removedLineIds = existingIds.filter(existingId => !updatedIds.includes(existingId));

    if (removedLineIds.length > 0) {
      const { error: deleteError } = await (await supabase)
        .from("order_lines")
        .delete()
        .in("id", removedLineIds);

      if (deleteError) {
        console.error("Erro ao excluir linhas do pedido:", deleteError);
        return { success: false, error: "Erro ao excluir linhas do pedido." };
      }
    }

    for (const line of updates.orderLines) {
      if (line.id) {
        // Atualiza linha existente
        await (await supabase).from("order_lines").update(line).eq("id", line.id);
      } else {
        // Insere nova
        await (await supabase).from("order_lines").insert({ ...line, order_id: id });
      }
    }
  }

  revalidatePath("/orders");
  return { success: true, data: data as Order };
}

/**
 * Deleta um pedido.
 * @param id ID do pedido.
 */
export async function deleteOrder(id: string): Promise<ActionResponse> {
  const supabase = createClient();

  if (!id) {
    return { success: false, error: "ID do pedido inválido." };
  }

  const { error } = await (await supabase)
    .from("orders")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao excluir pedido:", error);
    return { success: false, error: "Erro ao excluir pedido." };
  }

  revalidatePath("/orders");
  return { success: true };
}

export async function updateToClosedOrder(id: string): Promise<ActionResponse> {
  const supabase = createClient();

  if (!id) {
    return { success: false, error: "ID do pedido inválido." };
  }

  const { error } = await (await supabase)
    .from("orders")
    .update({ status: "CLOSED" })
    .eq("id", id);

  if (error) {
    console.error("Erro ao fechar pedido:", error);
    return { success: false, error: "Erro ao fechar pedido." };
  }

  revalidatePath("/orders");
  return { success: true };
}
