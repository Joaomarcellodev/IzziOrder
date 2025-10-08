"use server";

import { createClient } from "@/lib/supabase/server";
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
  status: "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "READY"; tableNumber?: number;
  customer_id?: string;
  type: "DELIVERY" | "LOCAL";
  delivery_fee?: number;
  estimated_time?: number;
  order_lines: Array<{ name: string; quantity: number; notes?: string }>;
}

/**
 * Cria um novo pedido.
 * @param orderData Dados do pedido.
 */
export async function createOrder(
  orderData: Omit<Order, "id" | "date">
): Promise<ActionResponse<Order>> {
  const supabase = createClient();

  // Validação simples
  if (!orderData.status) {
    return { success: false, error: "O status do pedido é obrigatório." };
  }

  const { data, error } = await (await supabase)
    .from("orders")
    .insert(orderData)
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar pedido:", error);
    return { success: false, error: "Erro ao criar pedido." };
  }

  revalidatePath("/orders");
  return { success: true, data: data as Order };
}

/*Busca todos os pedidos.*/
export async function getOrders(establishment_id: string) {
  const supabase = createClient();

  const { data, error } = await (await supabase)
    .from("orders")
    .select("*, order_lines (*)")
    .eq("establishment_id", establishment_id)
    .order("date", { ascending: false });

  if (error) {
    console.error("Erro ao buscar pedidos:", error);
    return { success: false, error: "Erro ao buscar pedidos." };
  }

  for (const order of data as Order[]) {
    order.code = "#" + order.type + "-" + order.id.slice(0, 6).toUpperCase();
  }

  return { success: true, data: data as Order[] };
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
