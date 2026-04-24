"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { Order, OrderLine, OrderType, OrderStatus, PaymentMethod } from "@/lib/entities/order";
import { getEstablishmentId } from "./establisment_actions";


export interface OrderRequestDTO {
  id?: string;
  total: number;
  status?: OrderStatus;
  type: OrderType;
  detail?: string;
  deliveryFee?: number;
  estimatedTime?: number;
  orderLines: Array<OrderLine>;
  dailySeq?: number;
  paymentMethod?: PaymentMethod;
  changeValue?: number;    
}
export async function createOrder(orderDTO: OrderRequestDTO, testEstablishmentId?: string) {
  const orderEntity = Order.fromDTO(orderDTO);

  const supabase = await createClient();
  const establishment_id = testEstablishmentId ? testEstablishmentId : await getEstablishmentId();

  const { data, error } = await supabase
    .from("orders")
    .insert({
      total: orderEntity.total.toFixed(2),
      type: orderEntity.type,
      status: orderEntity.status,
      establishment_id,
      detail: orderDTO.detail,
      delivery_fee: orderEntity.type === "DELIVERY" ? (orderEntity as any).deliveryFee : 0,
      estimated_time: orderEntity.estimatedTime ?? 0,
      payment_method: orderDTO.paymentMethod,
      change_value: orderDTO.changeValue ?? 0,
    })
    .select("id, daily_seq")
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

  orderEntity.id = data.id;
  orderEntity.dailySeq = data.daily_seq;

  if (process.env.TEST_CONTEXT !== "integration") {
    revalidatePath("/orders");
  }

  return orderEntity.toJSON();
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

  return data.map((o: any) => adjustOrderLines(o));
}

export async function getTodayOrders(establishment_id: string): Promise<any> {
  const supabase = await createClient();

  const today = new Date()
  const start = new Date(today.setHours(0, 0, 0, 0)).toISOString()
  const end = new Date(today.setHours(23, 59, 59, 999)).toISOString()

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_lines(*)")
    .eq("establishment_id", establishment_id)
    .gte("date", start)
    .lte("date", end)

  if (error) {
    console.error("Erro Supabase (getOrders):", error);
    throw new Error("Erro ao buscar pedidos.");
  }

  return data.map((o: any) => adjustOrderLines(o));
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
      payment_method: orderDTO.paymentMethod,
      change_value: orderDTO.changeValue ?? 0,
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

    const existingIds = (existingLines || []).map((l: any) => l.id);
    const incomingIds = orderDTO.orderLines.filter((l) => l.id).map((l) => l.id);
    const toDelete = existingIds.filter((id: any) => !incomingIds.includes(id));

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

export async function updateToClosedOrder(id: string): Promise<any> {
  if (!id) throw new Error("ID do pedido inválido.");

  const order = Order.fromDTO(await getOrderById(id));
  order.close();

  await updateOrderStatus(order, id);

  if (process.env.TEST_CONTEXT !== "integration") {
    revalidatePath("/orders");
  }

  return order.toJSON();
}

export async function updateToOpenOrder(id: string): Promise<any> {
  if (!id) throw new Error("ID do pedido inválido.");

  const order = Order.fromDTO(await getOrderById(id));
  order.reopen();

  await updateOrderStatus(order, id);

  if (process.env.TEST_CONTEXT !== "integration") {
    revalidatePath("/orders");
  }

  return order.toJSON();
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
  const mappedLines = (orderData.order_lines || []).map((line: any) => ({
    ...line,
    menuItemId: line.menu_item_id,
  }));

  return Order.fromDTO({
    ...orderData,
    orderLines: mappedLines,
    dailySeq: orderData.daily_seq,
    deliveryFee: orderData.delivery_fee,
    estimatedTime: orderData.estimated_time,
  }).toJSON();
}
