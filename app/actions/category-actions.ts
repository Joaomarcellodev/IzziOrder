"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { getEstablishmentId } from "./establisment_actions";
import { del } from "@vercel/blob";
import { PLACEHOLDER_IMAGE_URL } from "./menu-item-actions";

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

export async function getCategories(establishment_id: string) {
  const supabase = createClient();

  const { error, data } = await (await supabase)
    .from("categories")
    .select()
    .eq("establishment_id", establishment_id);

  if (error) {
    console.error("Erro inesperado ao recuperar as categorias:", error);
    return { success: false, error: "Erro ao recuperar as categorias." };
  }

  return { success: true, data: data as Category[] };
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
    .insert({ name: trimmedName, establishment_id: await getEstablishmentId() })
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
    .eq("establishment_id", await getEstablishmentId())
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
  const supabase = await createClient();
  const establishmentId = await getEstablishmentId();

  // Validação do ID
  if (!id) {
    return { success: false, error: "ID da categoria inválido." };
  }

  // 1. Busca todos os itens desta categoria (ativos e inativos)
  const { data: items, error: fetchError } = await supabase
    .from("menu_items")
    .select("id, is_active, image")
    .eq("category_id", id);

  if (fetchError) {
    console.error("Erro ao verificar itens da categoria:", fetchError);
    return { success: false, error: "Erro ao verificar itens da categoria." };
  }

  // 2. Verifica se há itens ativos
  const activeItems = items?.filter((item) => item.is_active === true) || [];
  if (activeItems.length > 0) {
    return {
      success: false,
      error:
        "Não foi possível excluir a categoria, pois ela está sendo usada por um ou mais itens ativos no menu. Remova os itens da categoria antes de tentar excluí-la.",
    };
  }

  // 3. Se houver apenas itens inativos, limpa eles
  const inactiveItems = items?.filter((item) => item.is_active === false) || [];
  if (inactiveItems.length > 0) {
    // Tenta deletar as imagens dos itens inativos do Blob
    for (const item of inactiveItems) {
      if (item.image && item.image !== PLACEHOLDER_IMAGE_URL) {
        try {
          await del(item.image);
        } catch (err: any) {
          console.warn(
            `Aviso: Falha ao excluir imagem do item inativo ${item.id}:`,
            err.message
          );
        }
      }
    }

    // Deleta os itens inativos do banco de dados (limpeza física)
    const { error: deleteItemsError } = await supabase
      .from("menu_items")
      .delete()
      .eq("category_id", id)
      .eq("is_active", false);

    if (deleteItemsError) {
      if (deleteItemsError.code === "23503") {
        return {
          success: false,
          error:
            "Não foi possível excluir os itens antigos desta categoria pois eles estão vinculados a pedidos existentes. Contate o suporte para limpeza manual.",
        };
      }
      console.error(
        "Erro ao excluir itens inativos da categoria:",
        deleteItemsError
      );
      return { success: false, error: "Erro ao limpar itens da categoria." };
    }
  }

  // 4. Agora tenta deletar a categoria
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .eq("establishment_id", establishmentId);

  if (error) {
    if (error.code === "23503") {
      return {
        success: false,
        error:
          "Não foi possível excluir a categoria pois existem referências a ela no sistema.",
      };
    }
    console.error("Erro inesperado ao excluir categoria:", error);
    return { success: false, error: "Erro ao excluir categoria." };
  }

  revalidatePath("/menu");
  return { success: true };
}
