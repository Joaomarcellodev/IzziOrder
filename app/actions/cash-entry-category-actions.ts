"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { CashEntryCategory } from "@/lib/entities/cash-entry-category";
import { getEstablishmentId } from "./establisment_actions";

export async function createCashEntryCategory(
  dto: { name: string },
  testEstablishmentId?: string
) {
  const supabase = await createClient();
  const establishment_id = testEstablishmentId ? testEstablishmentId : await getEstablishmentId();

  const entity = CashEntryCategory.fromDTO({
    name: dto.name,
    establishment_id
  });

  const { data, error } = await supabase
    .from("cash_entry_categories")
    .insert({
      name: entity.name,
      establishment_id: entity.establishmentId
    })
    .select("*")
    .single();

  if (error) {
    console.error("Erro Supabase (createCashEntryCategory):", error);
    throw new Error("Erro ao criar categoria no banco de dados.");
  }

  if (process.env.TEST_CONTEXT !== "integration") {
    revalidatePath("/cash-flow");
  }

  return CashEntryCategory.fromDTO(data).toJSON();
}

export async function getCashEntryCategories(testEstablishmentId?: string) {
  const supabase = await createClient();
  const establishment_id = testEstablishmentId ? testEstablishmentId : await getEstablishmentId();

  const { data, error } = await supabase
    .from("cash_entry_categories")
    .select("*")
    .eq("establishment_id", establishment_id);

  if (error) {
    console.error("Erro Supabase (getCashEntryCategories):", error);
    throw new Error("Erro ao buscar categorias.");
  }

  return (data || []).map((c: any) => CashEntryCategory.fromDTO(c).toJSON());
}

export async function getCashEntryCategoryById(id: any) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cash_entry_categories")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Erro Supabase (getCashEntryCategoryById):", error);
    throw new Error("Categoria não encontrada.");
  }

  return CashEntryCategory.fromDTO(data).toJSON();
}

export async function updateCashEntryCategory(id: any, dto: { name: string }) {
  const supabase = await createClient();
  const existing = await getCashEntryCategoryById(id);

  const entity = CashEntryCategory.fromDTO({
    id,
    name: dto.name,
    establishment_id: existing.establishmentId
  });

  const { data, error } = await supabase
    .from("cash_entry_categories")
    .update({
      name: entity.name
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("Erro Supabase (updateCashEntryCategory):", error);
    throw new Error("Erro ao atualizar categoria.");
  }

  if (process.env.TEST_CONTEXT !== "integration") {
    revalidatePath("/cash-flow");
  }

  return CashEntryCategory.fromDTO(data).toJSON();
}

export async function deleteCashEntryCategory(id: any): Promise<void> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cash_entry_categories")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Erro Supabase (deleteCashEntryCategory):", error);
    throw new Error("Erro ao excluir categoria.");
  }

  if (!data) {
    throw new Error("Categoria não encontrada.");
  }

  if (process.env.TEST_CONTEXT !== "integration") {
    revalidatePath("/cash-flow");
  }
}
