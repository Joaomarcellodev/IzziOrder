"use server";

import { createClient } from "@supabase/supabase-js";
import { CheckoutData, validateCheckout } from "@/lib/validators/checkout";
import { OrderLine } from "@/lib/entities/order";

function getPublicSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Use Service Role Key to bypass RLS on server actions
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Supabase URL ou Service Key não estão definidas.");
  }

  return createClient(url, serviceKey);
}

export interface PublicOrderRequestDTO extends CheckoutData {
  orderLines: OrderLine[];
}

export async function createPublicOrder(
  establishmentId: string,
  orderData: PublicOrderRequestDTO
) {
  const errors = validateCheckout(orderData);
  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }

  if (!orderData.orderLines || orderData.orderLines.length === 0) {
    throw new Error("O pedido deve conter pelo menos um item.");
  }

  const supabase = getPublicSupabase();

  const currentDate = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Sao_Paulo",
  });

  const detail =
    orderData.orderType === "PICKUP"
      ? orderData.customerName + (orderData.phone ? ` - ${orderData.phone}` : "")
      : orderData.address;

  // Usa 0 para delivery fee por enquanto, no futuro pode ser calculado
  const deliveryFee = 0;

  const { data: orderResponse, error: orderError } = await supabase
    .from("orders")
    .insert({
      establishment_id: establishmentId,
      total: orderData.cartTotal.toFixed(2),
      status: "OPEN",
      type: orderData.orderType,
      detail: detail,
      delivery_fee: orderData.orderType === "DELIVERY" ? deliveryFee : 0,
      payment_method: orderData.paymentMethod,
      change_value: orderData.changeValue ?? 0,
      date: currentDate,
    })
    .select("id, daily_seq")
    .single();

  if (orderError) {
    console.error("Erro Supabase (createPublicOrder):", orderError);
    throw new Error("Erro ao criar o pedido. Tente novamente.");
  }

  const orderLinesToInsert = orderData.orderLines.map((line) => ({
    name: line.name,
    price: line.price,
    quantity: line.quantity,
    order_id: orderResponse.id,
    menu_item_id: line.menuItemId,
    observation: line.observation,
  }));

  const { error: orderLinesError } = await supabase
    .from("order_lines")
    .insert(orderLinesToInsert);

  if (orderLinesError) {
    console.error("Erro Supabase (public orderLines):", orderLinesError);
    throw new Error("Erro ao adicionar itens ao pedido.");
  }

  return {
    orderId: orderResponse.id,
    dailySeq: orderResponse.daily_seq,
  };
}
