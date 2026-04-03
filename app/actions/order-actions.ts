"use server";

import { createClient } from "@/utils/supabase/server";
import { ESTABLISHMENT_ID } from "@/utils/config";
import { revalidatePath } from "next/cache";
import { Order, OrderLine, OrderType, OrderStatus } from "@/lib/entities/order";

export interface OrderRequestDTO {
  id?: string;
  total: number;
  status?: OrderStatus;
  type: OrderType;
  detail?: string;
  deliveryFee?: number;
  estimatedTime?: number;
  orderLines: Array<OrderLine>;
}

export async function createOrder(orderDTO: OrderRequestDTO) {
  const orderEntity = Order.fromDTO(orderDTO);

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .insert({
      total: orderEntity.total.toFixed(2),
      type: orderEntity.type,
      status: orderEntity.status,
      establishment_id: ESTABLISHMENT_ID,
      detail: orderDTO.detail,
      delivery_fee: orderEntity.type === "DELIVERY" ? (orderEntity as any).deliveryFee : 0,
      estimated_time: orderEntity.estimatedTime ?? 0,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Erro Supabase (createOrder):", error);
    throw new Error("Erro ao criar pedido no banco de dados.");
  }

  if (orderEntity.orderLines.length > 0) {
    const orderLinesToInsert = orderEntity.orderLines.map((line) => ({
      name: line.name,
      price: line.price,
      quantity: line.quantity,
      order_id: data.id,
      menu_item_id: line.menuItemId,
      observation: line.observation,
    }));

    const { error: orderLinesError } = await supabase
      .from("order_lines")
      .insert(orderLinesToInsert);

    if (orderLinesError) {
      console.error("Erro Supabase (orderLines):", orderLinesError);
      throw new Error("Erro ao criar as linhas do pedido.");
    }
  }

  const createdOrder = await getOrderById(data.id);

  if (process.env.TEST_CONTEXT !== "integration") {
    revalidatePath("/orders");
  }

  return createdOrder;
}

export async function getOrders(establishment_id: string): Promise<any> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_lines(*)")
    .eq("establishment_id", establishment_id);

  if (error) {
    console.error("Erro Supabase (getOrders):", error);
    throw new Error("Erro ao buscar pedidos.");
  }

  return data.map(o => adjustOrderLines(o));
}

export async function getOrderById(id: string) {
  const supabase = await createClient();

  if (!id) throw new Error("ID do pedido inválido.");

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_lines(*)")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Erro Supabase (getOrderById):", error);
    throw new Error("Pedido não encontrado.");
  }

  return adjustOrderLines(data);
}

export async function updateOrder(orderDTO: OrderRequestDTO) {
  if (!orderDTO.id) throw new Error("ID do pedido inválido.");

  const currentOrder = await getOrderById(orderDTO.id);
  if (currentOrder.status === "CLOSED") {
    throw new Error("Não é possível atualizar um pedido fechado.");
  }

  const orderEntity = Order.fromDTO(orderDTO);
  const supabase = await createClient();

  const { error } = await supabase
    .from("orders")
    .update({
      total: orderEntity.total.toFixed(2),
      type: orderEntity.type,
      status: orderEntity.status,
      detail: orderDTO.detail,
      delivery_fee: orderEntity.type === "DELIVERY" ? (orderEntity as any).deliveryFee : 0,
      estimated_time: orderEntity.estimatedTime,
    })
    .eq("id", orderDTO.id);

  if (error) {
    console.error("Erro Supabase (updateOrder):", error);
    throw new Error("Erro ao atualizar pedido.");
  }

  if (orderDTO.orderLines) {
    const { data: existingLines } = await supabase
      .from("order_lines")
      .select("id")
      .eq("order_id", orderDTO.id);

    const existingIds = (existingLines || []).map((l) => l.id);
    const incomingIds = orderDTO.orderLines.filter((l) => l.id).map((l) => l.id);
    const toDelete = existingIds.filter((id) => !incomingIds.includes(id));

    if (toDelete.length > 0) {
      await supabase.from("order_lines").delete().in("id", toDelete);
    }

    for (const line of orderDTO.orderLines) {
      const lineData = {
        order_id: orderDTO.id,
        menu_item_id: line.menuItemId,
        name: line.name,
        quantity: line.quantity,
        price: line.price,
        observation: line.observation,
      };

      if (line.id) {
        await supabase.from("order_lines").update(lineData).eq("id", line.id);
      } else {
        await supabase.from("order_lines").insert(lineData);
      }
    }
  }

  const result = await getOrderById(orderDTO.id);
  if (process.env.TEST_CONTEXT !== "integration") {
    revalidatePath("/orders");
  }
  return result;
}

export async function deleteOrder(id: string): Promise<void> {
  const supabase = await createClient();

  if (!id) throw new Error("ID do pedido inválido.");

  const { data, error } = await supabase
    .from("orders")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Erro Supabase (deleteOrder):", error);
    throw new Error("Erro ao excluir pedido.");
  }

  if (!data) {
    throw new Error("Pedido não encontrado.");
  }

  if (process.env.TEST_CONTEXT !== "integration") {
    revalidatePath("/orders");
  }
}

export async function updateToClosedOrder(id: string): Promise<void> {
  if (!id) throw new Error("ID do pedido inválido.");

  const order = Order.fromDTO(await getOrderById(id));
  order.close();

  await updateOrderStatus(order, id);

  if (process.env.TEST_CONTEXT !== "integration") {
    revalidatePath("/orders");
  }

  return adjustOrderLines(order.toJSON());
}

export async function updateToOpenOrder(id: string): Promise<any> {
  if (!id) throw new Error("ID do pedido inválido.");

  const order = Order.fromDTO(await getOrderById(id));
  order.reopen();

  await updateOrderStatus(order, id);

  if (process.env.TEST_CONTEXT !== "integration") {
    revalidatePath("/orders");
  }

  return adjustOrderLines(order.toJSON());
}

async function updateOrderStatus(order: Order, id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ status: order.status })
    .eq("id", id);

  if (error) {
    console.error("Erro Supabase (updateToClosedOrder):", error);
    throw new Error("Erro ao fechar pedido.");
  }
}

function adjustOrderLines(orderData: any) {
  orderData.orderLines = orderData.order_lines
  return orderData
}
