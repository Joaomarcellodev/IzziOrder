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
interface Category {
  id: string;
  name: string;
}

export async function createCategory(
  name: string
): Promise<ActionResponse<Category>> {
  const supabase = createClient();

  const trimmedName = name.trim();
  if (!trimmedName) {
    return { success: false, error: "O nome da categoria não pode ser vazio." };
  }

  // Tenta inserir diretamente, confiando na restrição de unicidade do banco de dados
  const { data, error } = await (await supabase)
    .from("category")
    .insert({ name: trimmedName })
    .select();

  if (error) {
    // Verifica o código de erro para violação de unicidade (código '23505')
    if (error.code === "23505") {
      console.error("Erro de unicidade ao adicionar categoria:", error);
      return {
        success: false,
        error: `A categoria "${trimmedName}" já existe.`,
      };
    }

    console.error("Erro inesperado ao adicionar categoria:", error);
    return {
      success: false,
      error: "Erro ao adicionar categoria. Tente novamente.",
    };
  }

  revalidatePath("/menu");
  return { success: true, data: data[0] as Category };
}

export async function updateCategory(
  id: string,
  newName: string
): Promise<ActionResponse<Category>> {
  const supabase = createClient();

  const trimmedName = newName.trim();
  if (!trimmedName) {
    return { success: false, error: "O nome da categoria não pode ser vazio." };
  }

  const { data, error } = await (await supabase)
    .from("category")
    .update({ name: trimmedName })
    .eq("id", id)
    .select();

  if (error) {
    // Melhorando a mensagem de erro para casos de duplicação
    if (error.code === "23505") {
      return {
        success: false,
        error: `A categoria "${trimmedName}" já existe.`,
      };
    }
    console.error("Erro ao atualizar categoria:", error);
    return { success: false, error: "Erro ao atualizar categoria." };
  }

  revalidatePath("/menu");
  return { success: true, data: data[0] as Category };
}

export async function deleteCategory(id: string): Promise<ActionResponse> {
  const supabase = createClient();

  const { error } = await (await supabase)
    .from("category")
    .delete()
    .eq("id", id);

  if (error) {
    // Verifica se o erro é uma violação de chave estrangeira (código '23503')
    if (error.code === "23503") {
      console.error(
        "Erro ao excluir categoria. Violação de chave estrangeira.",
        error
      );
      return {
        success: false,
        error:
          "Não foi possível excluir a categoria, pois ela está sendo usada por um ou mais itens no menu. Remova os itens da categoria antes de tentar excluí-la.",
      };
    }

    // Para qualquer outro tipo de erro, retorna uma mensagem mais genérica e segura
    console.error("Erro inesperado ao excluir categoria:", error);
    return { success: false, error: "Erro ao excluir categoria." };
  }

  revalidatePath("/menu");
  return { success: true };
}
