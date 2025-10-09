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
  status: "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "READY";
  tableNumber?: number;
  type: "DELIVERY" | "LOCAL";
  delivery_fee?: number;
  estimated_time?: number;
  order_lines: Array<{ name: string; quantity: number }>;
  customerName?: string | null;
  observation: string;
}

interface OrderResponseDTO {
  id?: string;
  date: string; // timestamp
  total: number;
  status: "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "READY"; tableNumber?: number;
  type: "DELIVERY" | "LOCAL";
  delivery_fee?: number;
  estimated_time?: number;
  order_lines: Array<{ name: string; quantity: number }>;
  customer: { name: string; };
  observation: string;
  table_number: number;
}

export interface OrderRequestDTO {
  total: number;
  table_id?: string;
  type: "DELIVERY" | "LOCAL";
  delivery_fee?: number;
  estimated_time?: number;
  order_lines: Array<OrderLineRequestDTO>;
  customer_id?: string | null;
  observation?: string;
}

interface OrderLineRequestDTO {
  id: string,
  name: string,
  quantity: number,
  price: number,
  order_id?: string
}

/**
 * Cria um novo pedido.
 * @param orderData Dados do pedido.
 */
export async function createOrder(
  order: OrderRequestDTO
): Promise<ActionResponse<Order>> {
  const supabase = createClient();

  const { data: table, error: errorTable } = await (await supabase)
    .from("tables")
    .select("table_number")
    .eq("id", order.table_id)
    .single();

  if (errorTable) {
    console.error("Erro ao encontrar a mesa:", errorTable);
    return { success: false, error: "Erro ao encontrar a mesa." };
  }

  const { data: orderCreated, error } = await (await supabase)
    .from("orders")
    .insert({
      total: order.total.toFixed(2),
      type: order.type,
      status: "PENDING",
      establishment_id: ESTABLISHMENT_ID,
      observation: order.observation ?? "",
      table_number: table.table_number
    })
    .select("id")
    .single();

  if (error) {
    console.error("Erro ao criar pedido:", error);
    return { success: false, error: "Erro ao criar pedido." };
  }

  if (order.order_lines.length > 0) {
    const orderLinesToInsert = order.order_lines.map((line) => ({
      name: line.name,
      price: line.price,
      quantity: line.quantity,
      order_id: orderCreated.id,
      menu_item_id: line.id
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
  for (const orderDTO of data as OrderResponseDTO[]) {
    const order = orderDTO as Order;
    if (order.type == "LOCAL") {
      order.code = "#LOC" + "-" + order.id.slice(0, 6).toUpperCase();
    } else if (order.type == "DELIVERY") {
      order.code = "#DLV" + "-" + order.id.slice(0, 6).toUpperCase();
    }

    order.customerName = orderDTO.customer ? orderDTO.customer.name : null;
    order.tableNumber = orderDTO.table_number ?? null;

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
  updates: Partial<Omit<Order, "id" | "date">>
): Promise<ActionResponse<Order>> {
  const supabase = createClient();

  if (!id) {
    return { success: false, error: "ID do pedido inválido." };
  }

  const { data, error } = await (await supabase)
    .from("orders")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar pedido:", error);
    return { success: false, error: "Erro ao atualizar pedido." };
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
