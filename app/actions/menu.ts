// menu.ts

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { put, del } from "@vercel/blob";

interface UploadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

interface ActionResponse {
  success: boolean;
  error?: string;
  data?: any;
}

const PLACEHOLDER_IMAGE_URL = "/camera-off.svg";

/**
 * Função Server Action para fazer upload de um arquivo de imagem.
 * @param file O arquivo de imagem a ser enviado.
 * @param options Opções para o upload, como permitir sobrescrita.
 * @returns Um objeto com a URL da imagem ou um erro.
 */
async function uploadImage(
  file: File,
  options?: { overwrite?: boolean }
): Promise<UploadResponse> {
  if (!file || file.size === 0) {
    return { success: false, error: "Nenhum arquivo encontrado." };
  }

  const uploadOptions = {
    access: "public" as const,
    addRandomSuffix: options?.overwrite !== true,
    overwrite: options?.overwrite || false,
  };

  try {
    const blob = await put(file.name, file, uploadOptions);
    return {
      success: true,
      url: blob.url,
    };
  } catch (err: any) {
    console.error("Erro ao fazer upload da imagem:", err);
    return {
      success: false,
      error: `Falha no upload da imagem: ${err.message}`,
    };
  }
}

/**
 * Cria um novo item de menu com a imagem.
 * @param formData FormData contendo os dados do item e a imagem.
 */
export async function createMenuItem(
  formData: FormData
): Promise<ActionResponse> {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const category = formData.get("category") as string;
  const available = formData.get("available") === "true";
  const imageFile = formData.get("imageFile") as File | null;

  // VERIFICAÇÃO DE CATEGORIA OBRIGATÓRIA
  if (!category || category.trim() === "") {
    return { success: false, error: "A categoria é obrigatória." };
  }

  let imageUrl: string | null = null;
  const supabase = createClient();
  // Obtém o próximo valor de "position"
  const { data: maxPositionData, error: positionError } = await (await supabase)
    .from("menu_items")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .single();

  const nextPosition =
    maxPositionData && maxPositionData.position !== null
      ? maxPositionData.position + 1
      : 0;

  if (imageFile && imageFile.size > 0) {
    const uploadResult = await uploadImage(imageFile);
    if (uploadResult.success && uploadResult.url) {
      imageUrl = uploadResult.url;
    } else {
      return { success: false, error: uploadResult.error };
    }
  } else {
    // Se não houver arquivo, define a imagem como o placeholder
    imageUrl = PLACEHOLDER_IMAGE_URL;
  }

  const newItemData = {
    name,
    description,
    price,
    category,
    available,
    image: imageUrl,
    position: nextPosition, // Adiciona a nova posição
  };

  const { data, error } = await (await supabase)
    .from("menu_items")
    .insert([newItemData])
    .select();

  if (error) {
    console.error("Erro ao adicionar item:", error);
    return { success: false, error: error.message };
  }
  revalidatePath("/menu");
  return { success: true, data: data[0] };
}

/**
 * Atualiza um item de menu existente, incluindo a imagem.
 * @param id O ID do item a ser atualizado.
 * @param formData FormData contendo os dados a serem atualizados.
 */
export async function updateMenuItem(
  id: string,
  formData: FormData
): Promise<ActionResponse> {
  const updates: any = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    price: parseFloat(formData.get("price") as string),
    category: formData.get("category") as string,
    available: formData.get("available") === "true",
  };
  const imageFile = formData.get("imageFile") as File | null;
  const existingImage = formData.get("image") as string;

  // VERIFICAÇÃO DE CATEGORIA OBRIGATÓRIA TAMBÉM NA ATUALIZAÇÃO
  if (!updates.category || updates.category.trim() === "") {
    return { success: false, error: "A categoria é obrigatória." };
  }

  const supabase = createClient();

  if (imageFile && imageFile.size > 0) {
    const { data: oldItem, error: fetchError } = await (await supabase)
      .from("menu_items")
      .select("image")
      .eq("id", id)
      .single();

    if (fetchError) {
      return { success: false, error: "Item não encontrado." };
    }

    const uploadResult = await uploadImage(imageFile);
    if (uploadResult.success && uploadResult.url) {
      updates.image = uploadResult.url;

      // Exclui a imagem antiga se ela existir e não for a de placeholder
      if (oldItem?.image && oldItem.image !== PLACEHOLDER_IMAGE_URL) {
        try {
          await del(oldItem.image);
        } catch (err) {
          console.error(
            "Erro ao excluir a imagem antiga, mas a nova foi salva.",
            err
          );
        }
      }
    } else {
      return { success: false, error: uploadResult.error };
    }
  } else {
    updates.image = existingImage === "" ? null : existingImage;
  }

  const { data, error } = await (await supabase)
    .from("menu_items")
    .update(updates)
    .eq("id", id)
    .select();

  if (error) {
    console.error("Erro ao atualizar item:", error);
    return { success: false, error: error.message };
  }
  revalidatePath("/menu");
  return { success: true, data: data[0] };
}

/**
 * Deleta um item de menu e sua imagem associada.
 * @param id O ID do item a ser excluído.
 */
export async function deleteMenuItem(id: string): Promise<ActionResponse> {
  const supabase = createClient();

  // 1. Busca o item para obter a URL da imagem
  const { data: item, error: fetchError } = await (await supabase)
    .from("menu_items")
    .select("image")
    .eq("id", id)
    .single();

  if (fetchError) {
    console.error("Erro ao buscar item para exclusão:", fetchError);
    return { success: false, error: fetchError.message };
  }

  // 2. Tenta excluir a imagem se ela existir e não for a imagem de placeholder
  if (item?.image && item.image !== PLACEHOLDER_IMAGE_URL) {
    try {
      await del(item.image);
      console.log(`Imagem do item ${id} excluída com sucesso.`);
    } catch (err: any) {
      console.error(
        `Aviso: Falha ao excluir a imagem do item ${id}:`,
        err.message
      );
    }
  }

  // 3. Deleta o item no Supabase
  const { error: deleteError } = await (await supabase)
    .from("menu_items")
    .delete()
    .eq("id", id);

  if (deleteError) {
    console.error("Erro ao excluir item:", deleteError);
    return { success: false, error: deleteError.message };
  }

  revalidatePath("/menu");
  return { success: true };
}

/**
 * Atualiza a ordem dos itens do menu no banco de dados.
 * @param ids Array de IDs dos itens na nova ordem.
 */
export async function updateMenuOrder(ids: string[]): Promise<ActionResponse> {
  const supabase = createClient();
  let success = true;
  let errorMsg = "";

  for (const [index, id] of ids.entries()) {
    const { error } = await (await supabase)
      .from("menu_items")
      .update({ position: index })
      .eq("id", id);

    if (error) {
      success = false;
      errorMsg = `Falha ao atualizar a ordem do item ${id}: ${error.message}`;
      console.error(errorMsg);
      break; // Sai do loop em caso de erro
    }
  }

  if (success) {
    revalidatePath("/menu");
    return { success: true };
  } else {
    return { success: false, error: errorMsg };
  }
}

export async function updateMenuItemAvailability(
  id: string,
  available: boolean
): Promise<ActionResponse> {
  const supabase = createClient();
  const { data, error } = await (await supabase)
    .from("menu_items")
    .update({ available: available })
    .eq("id", id);

  if (error) {
    console.error("Erro ao atualizar disponibilidade do item:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/menu");
  return { success: true };
}
