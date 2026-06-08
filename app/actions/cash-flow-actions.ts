"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { CashFlowEntry } from "@/lib/entities/cash-flow-entry";
import { getEstablishmentId } from "./establisment_actions";

export async function createCashFlowEntry(
  dto: { description?: string; entry_category_id: any; amount: number },
  testEstablishmentId?: string
) {
  const supabase = await createClient();
  const establishment_id = testEstablishmentId ? testEstablishmentId : await getEstablishmentId();

  const entity = CashFlowEntry.fromDTO({
    description: dto.description,
    entry_category_id: dto.entry_category_id,
    amount: dto.amount,
    establishment_id
  });

  const { data, error } = await supabase
    .from("cash_flow_entries")
    .insert({
      description: entity.description,
      entry_category_id: entity.entryCategoryId,
      amount: entity.amount,
      establishment_id: entity.establishmentId
    })
    .select("*")
    .single();

  if (error) {
    console.error("Erro Supabase (createCashFlowEntry):", error);
    throw new Error("Erro ao criar lançamento de caixa no banco de dados.");
  }

  if (process.env.TEST_CONTEXT !== "integration") {
    revalidatePath("/cash-flow");
  }

  return CashFlowEntry.fromDTO(data).toJSON();
}

export async function getCashFlowEntries(testEstablishmentId?: string) {
  const supabase = await createClient();
  const establishment_id = testEstablishmentId ? testEstablishmentId : await getEstablishmentId();

  const { data, error } = await supabase
    .from("cash_flow_entries")
    .select("*")
    .eq("establishment_id", establishment_id);

  if (error) {
    console.error("Erro Supabase (getCashFlowEntries):", error);
    throw new Error("Erro ao buscar lançamentos de caixa.");
  }

  return (data || []).map((e: any) => CashFlowEntry.fromDTO(e).toJSON());
}

export async function getCashFlowEntryById(id: any) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cash_flow_entries")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Erro Supabase (getCashFlowEntryById):", error);
    throw new Error("Lançamento de caixa não encontrado.");
  }

  return CashFlowEntry.fromDTO(data).toJSON();
}

export async function updateCashFlowEntry(
  id: any,
  dto: { description?: string; entry_category_id: any; amount: number }
) {
  const supabase = await createClient();
  const existing = await getCashFlowEntryById(id);

  const entity = CashFlowEntry.fromDTO({
    id,
    description: dto.description,
    entry_category_id: dto.entry_category_id,
    amount: dto.amount,
    establishment_id: existing.establishmentId
  });

  const { data, error } = await supabase
    .from("cash_flow_entries")
    .update({
      description: entity.description,
      entry_category_id: entity.entryCategoryId,
      amount: entity.amount
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("Erro Supabase (updateCashFlowEntry):", error);
    throw new Error("Erro ao atualizar lançamento de caixa.");
  }

  if (process.env.TEST_CONTEXT !== "integration") {
    revalidatePath("/cash-flow");
  }

  return CashFlowEntry.fromDTO(data).toJSON();
}

export async function deleteCashFlowEntry(id: any): Promise<void> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cash_flow_entries")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Erro Supabase (deleteCashFlowEntry):", error);
    throw new Error("Erro ao excluir lançamento de caixa.");
  }

  if (!data) {
    throw new Error("Lançamento de caixa não encontrado.");
  }

  if (process.env.TEST_CONTEXT !== "integration") {
    revalidatePath("/cash-flow");
  }
}

export async function getCurrentCashTotal(testEstablishmentId?: string): Promise<number> {
  const supabase = await createClient();
  const establishment_id = testEstablishmentId ? testEstablishmentId : await getEstablishmentId();

  const { data, error } = await supabase
    .from("cash_flow_entries")
    .select("amount")
    .eq("establishment_id", establishment_id);

  if (error) {
    console.error("Erro Supabase (getCurrentCashTotal):", error);
    throw new Error("Erro ao calcular total atual no caixa.");
  }

  const total = (data || []).reduce((sum, item) => sum + Number(item.amount), 0);
  return parseFloat(total.toFixed(2));
}
