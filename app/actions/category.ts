"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Tipo para a resposta das Server Actions
interface ActionResponse<T = any> {
  success: boolean;
  error?: string;
  data?: T;
}

// Tipo para a tabela 'category'
export interface Category {
  id: string;
  name: string;
}

/**
 * Cria uma nova categoria no banco de dados.
 * @param name O nome da nova categoria.
 * @returns Um objeto ActionResponse com sucesso ou erro.
 */
export async function createCategory(
  name: string
): Promise<ActionResponse<Category>> {
  const supabase = createClient();
  const trimmedName = name?.trim();

  // Validação do nome
  if (!trimmedName) {
    return { success: false, error: "O nome da categoria não pode ser vazio." };
  }

  // Tenta inserir a categoria
  const { data, error } = await (await supabase)
    .from("categories")
    .insert({ name: trimmedName })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      // Violação de unicidade
      return {
        success: false,
        error: `A categoria "${trimmedName}" já existe.`,
      };
    }
    console.error("Erro inesperado ao criar categoria:", error);
    return {
      success: false,
      error: "Erro ao adicionar categoria. Tente novamente.",
    };
  }

  revalidatePath("/menu");
  return { success: true, data: data as Category };
}

/**
 * Atualiza uma categoria existente.
 * @param id O ID da categoria a ser atualizada.
 * @param newName O novo nome da categoria.
 * @returns Um objeto ActionResponse com sucesso ou erro.
 */
export async function updateCategory(
  id: string,
  newName: string
): Promise<ActionResponse<Category>> {
  const supabase = createClient();
  const trimmedName = newName?.trim();

  // Validação do nome
  if (!id) {
    return { success: false, error: "ID da categoria inválido." };
  }
  if (!trimmedName) {
    return { success: false, error: "O nome da categoria não pode ser vazio." };
  }

  // Tenta atualizar a categoria
  const { data, error } = await (await supabase)
    .from("categories")
    .update({ name: trimmedName })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      // Violação de unicidade
      return {
        success: false,
        error: `A categoria "${trimmedName}" já existe.`,
      };
    }
    console.error("Erro ao atualizar categoria:", error);
    return { success: false, error: "Erro ao atualizar categoria." };
  }

  revalidatePath("/menu");
  return { success: true, data: data as Category };
}

/**
 * Deleta uma categoria.
 * @param id O ID da categoria a ser deletada.
 * @returns Um objeto ActionResponse com sucesso ou erro.
 */
export async function deleteCategory(id: string): Promise<ActionResponse> {
  const supabase = createClient();

  // Validação do ID
  if (!id) {
    return { success: false, error: "ID da categoria inválido." };
  }

  const { error } = await (await supabase)
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) {
    if (error.code === "23503") {
      // Violação de chave estrangeira
      return {
        success: false,
        error:
          "Não foi possível excluir a categoria, pois ela está sendo usada por um ou mais itens no menu. Remova os itens da categoria antes de tentar excluí-la.",
      };
    }
    console.error("Erro inesperado ao excluir categoria:", error);
    return { success: false, error: "Erro ao excluir categoria." };
  }

  revalidatePath("/menu");
  return { success: true };
}
