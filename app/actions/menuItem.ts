"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { put, del } from "@vercel/blob";
import { validateMenuItem } from "@/lib/validators/menuItem";

interface ActionResponse {
  success: boolean;
  error?: string;
  data?: any;
}

const PLACEHOLDER_IMAGE_URL = "/camera-off.svg";

export async function getMenuItems(establishment_id: string) {
  const supabase = createClient();

  const { error, data } = await (await supabase)
    .from("menu_items")
    .select("*, category:categories(establishment_id)")
    .eq("category.establishment_id", establishment_id);

  if (error) {
    return { success: false, error: "Erro ao recuperar as itens do menu." };
  }

  return { success: true, data: data };
}

/**
 * Função utilitária para fazer upload de um arquivo de imagem.
 * @param file O arquivo de imagem a ser enviado.
 * @returns Um objeto com a URL da imagem ou um erro.
 */
async function uploadImage(file: File): Promise<ActionResponse> {
  if (!file || file.size === 0) {
    return { success: false, error: "Nenhum arquivo de imagem encontrado." };
  }

  try {
    const { url } = await put(file.name, file, { access: "public" });
    return { success: true, data: { url } };
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
  const category_id = formData.get("category_id") as string;
  const available = formData.get("available") === "true";
  const imageFile = formData.get("imageFile") as File | null;

  // Validação dos dados de entrada
  const item = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    price: parseFloat(formData.get("price") as string),
    category_id: formData.get("category_id") as string,
  };
  const errors = validateMenuItem(item);
  if (errors.length > 0) {
    return { success: false, error: errors.join("\n") };
  }

  const supabase = createClient();
  let imageUrl = PLACEHOLDER_IMAGE_URL;

  // Lógica para upload de imagem, se houver
  if (imageFile && imageFile.size > 0) {
    const uploadResult = await uploadImage(imageFile);
    if (!uploadResult.success) {
      return { success: false, error: uploadResult.error };
    }
    imageUrl = uploadResult.data.url;
  }

  // Busca a próxima posição
  const { data: maxPositionData } = await (await supabase)
    .from("menu_items")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .single();

  const nextPosition =
    maxPositionData && maxPositionData.position !== null
      ? maxPositionData.position + 1
      : 0;

  const { data, error } = await (
    await supabase
  )
    .from("menu_items")
    .insert({
      name,
      description,
      price,
      category_id,
      available,
      image: imageUrl,
      position: nextPosition,
    })
    .select()
    .single();

  if (error) {
    console.error("Erro ao adicionar item de menu:", error);
    return { success: false, error: "Erro ao criar item de menu." };
  }

  revalidatePath("/menu");
  return { success: true, data };
}

/**
 * Atualiza um item de menu existente.
 * @param id O ID do item a ser atualizado.
 * @param formData FormData contendo os dados a serem atualizados.
 */
export async function updateMenuItem(
  id: string,
  formData: FormData
): Promise<ActionResponse> {
  const supabase = createClient();

  if (!id) {
    return { success: false, error: "ID do item de menu inválido." };
  }

  const updates: any = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    price: parseFloat(formData.get("price") as string),
    category_id: formData.get("category_id") as string,
    available: formData.get("available") === "true",
  };

  // valida antes de atualizar
  const errors = validateMenuItem(updates);
  if (errors.length > 0) {
    return { success: false, error: errors.join("\n") };
  }


  const imageFile = formData.get("imageFile") as File | null;
  const existingImage = formData.get("image") as string;

  if (imageFile && imageFile.size > 0) {
    const uploadResult = await uploadImage(imageFile);
    if (!uploadResult.success) {
      return { success: false, error: uploadResult.error };
    }
    updates.image = uploadResult.data.url;

    // Busca e deleta a imagem antiga se não for o placeholder
    if (existingImage && existingImage !== PLACEHOLDER_IMAGE_URL) {
      try {
        await del(existingImage);
      } catch (err) {
        console.warn("Aviso: Falha ao excluir a imagem antiga.", err);
      }
    }
  } else {
    updates.image = existingImage;
  }

  const { data, error } = await (await supabase)
    .from("menu_items")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar item de menu:", error);
    return { success: false, error: "Erro ao atualizar item de menu." };
  }

  revalidatePath("/menu");
  return { success: true, data };
}

/**
 * Deleta um item de menu e sua imagem associada.
 * @param id O ID do item a ser excluído.
 */
export async function deleteMenuItem(id: string): Promise<ActionResponse> {
  const supabase = createClient();

  if (!id) {
    return { success: false, error: "ID do item de menu inválido." };
  }

  // 1. Busca o item para obter a URL da imagem
  const { data: item, error: fetchError } = await (await supabase)
    .from("menu_items")
    .select("image")
    .eq("id", id)
    .single();

  if (fetchError) {
    console.error("Erro ao buscar item para exclusão:", fetchError);
    return { success: false, error: "Item de menu não encontrado." };
  }

  // 2. Tenta excluir a imagem se ela existir e não for a de placeholder
  if (item?.image && item.image !== PLACEHOLDER_IMAGE_URL) {
    try {
      await del(item.image);
    } catch (err: any) {
      console.warn("Aviso: Falha ao excluir a imagem do item:", err.message);
    }
  }

  // 3. Deleta o item no Supabase
  const { error: deleteError } = await (await supabase)
    .from("menu_items")
    .delete()
    .eq("id", id);

  if (deleteError) {
    console.error("Erro ao excluir item de menu:", deleteError);
    return { success: false, error: "Erro ao excluir item de menu." };
  }

  revalidatePath("/menu");
  return { success: true };
}

/**
 * Atualiza a ordenação dos itens do menu no banco de dados.
 * @param ids Array de IDs dos itens na nova ordem.
 */
export async function updateMenuOrdernation(
  ids: string[]
): Promise<ActionResponse> {
  const supabase = await createClient(); // Corrigido: await na linha da criação do cliente

  if (!ids || !Array.isArray(ids)) {
    return { success: false, error: "IDs de ordenação inválidos." };
  }

  // Crie um array de promessas de atualização
  const updatePromises = ids.map((id, index) => {
    return supabase // Use o cliente Supabase diretamente
      .from("menu_items")
      .update({ position: index })
      .eq("id", id);
  });

  // Execute todas as atualizações em paralelo
  const results = await Promise.all(updatePromises);

  // Verifique se houve algum erro em qualquer uma das atualizações
  const hasError = results.some((result) => result.error);

  if (hasError) {
    console.error(
      "Erro ao atualizar a ordenação do menu:",
      results.map((r) => r.error).filter((e) => e)
    );
    return { success: false, error: "Erro ao atualizar a ordem dos itens." };
  }

  revalidatePath("/menu");
  return { success: true };
}

/**
 * Atualiza a disponibilidade de um item de menu.
 * @param id O ID do item.
 * @param available A nova disponibilidade (true/false).
 */
export async function updateMenuItemAvailability(
  id: string,
  available: boolean
): Promise<ActionResponse> {
  const supabase = createClient();

  if (!id) {
    return { success: false, error: "ID do item de menu inválido." };
  }

  const { error } = await (await supabase)
    .from("menu_items")
    .update({ available })
    .eq("id", id);

  if (error) {
    console.error("Erro ao atualizar disponibilidade do item:", error);
    return { success: false, error: "Erro ao atualizar a disponibilidade." };
  }

  revalidatePath("/menu");
  return { success: true };
}
