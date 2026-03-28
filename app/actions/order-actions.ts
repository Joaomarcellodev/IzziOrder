"use server";

import { createClient } from "@/utils/supabase/server";
import { ESTABLISHMENT_ID } from "@/utils/config";
import { revalidatePath } from "next/cache";
import { validateOrder } from "@/lib/validators/order";

// Tipo padrão de resposta
interface ActionResponse<T = any> {
  success: boolean;
  error?: string;
  data?: T;
}

export interface Order {
  id: string;
  code?: string;
  date: string; // timestamp
  total: number;
  status: "OPEN" | "CLOSED";
  tableNumber?: number;
  customerName?: string;
  type: "DELIVERY" | "LOCAL" | "PICKUP";
  deliveryFee?: number;
  estimatedTime?: number;
  orderLines: Array<OrderLine>;
}

export interface OrderRequestDTO {
  id?: string;
  total: number;
  status?: "OPEN" | "CLOSED";
  type: "DELIVERY" | "LOCAL" | "PICKUP";
  detail?: string;
  deliveryFee?: number;
  estimatedTime?: number;
  orderLines: Array<OrderLine>;
}

export interface OrderLine {
  id?: string,
  menuItemId: string,
  name: string,
  quantity: number,
  price: number,
  observation?: string;
}

export async function createOrder(
  order: OrderRequestDTO
) {
  const errors = validateOrder(order);
  if (errors.length > 0) {
    return { success: false, error: errors.join("\n") };
  }

  const supabase = createClient();

  const { data, error } = await (await supabase)
    .from("orders")
    .insert({
      total: order.total.toFixed(2),
      type: order.type,
      status: "OPEN",
      establishment_id: ESTABLISHMENT_ID,
      detail: order.detail,
      delivery_fee: order.deliveryFee ?? 0,
      estimated_time: order.estimatedTime ?? 0,
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
      order_id: data.id,
      menu_item_id: line.menuItemId,
      observation: line.observation
    }));

    const { error: orderLinesError } = await (await supabase)
      .from("order_lines")
      .insert(orderLinesToInsert);

    if (orderLinesError) {
      console.error("Erro ao criar itens do pedido:", orderLinesError);
      return { success: false, error: "Erro ao criar as linhas do pedido." };
    }
  }

  const { data: createdOrder } = await getOrderById(data.id);

  revalidatePath("/orders");
  return { success: true, data: createdOrder };
}

export async function getOrders(establishment_id: string) {
  const supabase = createClient();

  const { data, error } = await (await supabase)
    .from("orders")
    .select("*, order_lines(*)")
    .eq("establishment_id", establishment_id);

  if (error) {
    console.error("Erro ao buscar pedidos:", error);
    return { success: false, error: "Erro ao buscar pedidos." };
  }

  const orders: Order[] = [];
  for (const orderData of data) {
    const order = mapDataToOrder(orderData);

    orders.push(order);
  }

  return { success: true, data: orders };

}

function mapDataToOrder(orderData: any): Order {
  const order = orderData as Order;
  if (order.type == "LOCAL") {
    order.code = "#LOC" + "-" + order.id.slice(0, 6).toUpperCase();
    order.tableNumber = orderData.detail;
  } else if (order.type == "DELIVERY") {
    order.code = "#DLV" + "-" + order.id.slice(0, 6).toUpperCase();
  } else if (order.type == "PICKUP") {
    order.code = "#PIC" + "-" + order.id.slice(0, 6).toUpperCase();
    order.customerName = orderData.detail;
  }

  order.deliveryFee = orderData.delivery_fee;
  order.estimatedTime = orderData.estimated_time;

  const orderLines = [];
  for (const orderLineData of orderData.order_lines) {
    const orderLine: OrderLine = {
      id: orderLineData.id,
      menuItemId: orderLineData.menu_item_id,
      name: orderLineData.name,
      quantity: orderLineData.quantity,
      price: orderLineData.price,
      observation: orderLineData.observation
    }
    orderLines.push(orderLine)
  }
  order.orderLines = orderLines;
  return order;
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
    .select("*, order_lines(*)")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Erro ao buscar pedido:", error);
    return { success: false, error: "Pedido não encontrado." };
  }

  return { success: true, data: mapDataToOrder(data) };
}

/**
 * Atualiza um pedido existente.
 * @param id ID do pedido.
 * @param order Campos a serem atualizados.
 */
export async function updateOrder(
  order: OrderRequestDTO
) {
  const supabase = createClient();

  if (!order.id) {
    return { success: false, error: "ID do pedido inválido." };
  }

  const { data, error } = await (await supabase)
    .from("orders")
    .update({
      total: order.total!.toFixed(2),
      type: order.type,
      status: "OPEN",
      detail: order.detail,
      delivery_fee: order.deliveryFee,
      estimated_time: order.estimatedTime,
    })
    .eq("id", order.id)
    .select("*, order_lines(*)")
    .single();

  if (error) {
    console.error("Erro ao atualizar pedido:", error);
    return { success: false, error: "Erro ao atualizar pedido." };
  }

  if (order.orderLines.length > 0) {
    const { data: existingLines, error: fetchError } = await (await supabase)
      .from("order_lines")
      .select("id")
      .eq("order_id", order.id);

    if (fetchError) {
      console.error("Erro ao buscar linhas do pedido:", fetchError);
      return { success: false, error: "Erro ao buscar linhas do pedido." };
    }

    // Pega os ids das linhas existentes
    const existingIds = (existingLines ?? []).map(line => line.id);

    // Pega apenas as linhas que ainda existem ou foram editadas
    const updatedIds = order.orderLines
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

    for (const line of order.orderLines) {
      const lineData = {
        name: line.name,
        price: line.price,
        quantity: line.quantity,
        order_id: order.id,
        menu_item_id: line.menuItemId,
        observation: line.observation
      };

      if (line.id) {
        // Atualiza linha existente
        await (await supabase).from("order_lines").update(lineData).eq("id", line.id);
      } else {
        // Insere nova
        await (await supabase).from("order_lines").insert({ ...lineData, order_id: order.id });
      }
    }
  }

  const updatedOrder = mapDataToOrder(data);
  updatedOrder.orderLines = order.orderLines;

  revalidatePath("/orders");
  return { success: true, data: updatedOrder };
}

/**
 * Deleta um pedido.
 * @param id ID do pedido.
 */
export async function deleteOrder(id: string) {
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