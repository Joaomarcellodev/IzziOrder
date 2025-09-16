"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { put } from "@vercel/blob";

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

/**
 * Função Server Action para fazer upload de um arquivo de imagem.
 * @param file O arquivo de imagem a ser enviado.
 * @returns Um objeto com a URL da imagem ou um erro.
 */
async function uploadImage(file: File): Promise<UploadResponse> {
  if (!file || file.size === 0) {
    return { success: false, error: "Nenhum arquivo encontrado." };
  }
  try {
    const blob = await put(file.name, file, { access: "public" });
    return {
      success: true,
      url: blob.url,
    };
  } catch (err) {
    console.error("Erro ao fazer upload da imagem:", err);
    return {
      success: false,
      error: "Falha no upload da imagem.",
    };
  }
}

/**
 * Cria um novo item de menu com a imagem.
 * @param formData FormData contendo os dados do item e a imagem.
 */
export async function createMenuItem(formData: FormData): Promise<ActionResponse> {
  // Extrai os dados do FormData de forma segura
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const category = formData.get("category") as string;
  const available = formData.get("available") === "true";
  const imageFile = formData.get("imageFile") as File | null;
  const existingImage = formData.get("image") as string;

  let imageUrl = existingImage;

  // Lógica de upload da imagem (se houver um novo arquivo)
  if (imageFile && imageFile.size > 0) {
    const uploadResult = await uploadImage(imageFile);
    if (uploadResult.success && uploadResult.url) {
      imageUrl = uploadResult.url;
    } else {
      return { success: false, error: uploadResult.error };
    }
  }

  // Monta o objeto para o Supabase
  const newItemData = {
    name,
    description,
    price,
    category,
    available,
    image: imageUrl,
  };

  const supabase = createClient();
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
export async function updateMenuItem(id: string, formData: FormData): Promise<ActionResponse> {
  const updates: any = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    price: parseFloat(formData.get("price") as string),
    category: formData.get("category") as string,
    available: formData.get("available") === "true",
  };
  const imageFile = formData.get("imageFile") as File | null;
  const existingImage = formData.get("image") as string;

  if (imageFile && imageFile.size > 0) {
    const uploadResult = await uploadImage(imageFile);
    if (uploadResult.success && uploadResult.url) {
      updates.image = uploadResult.url;
    } else {
      return { success: false, error: uploadResult.error };
    }
  } else {
    updates.image = existingImage;
  }

  const supabase = createClient();
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

export async function updateMenuItemAvailability(id: string, available: boolean): Promise<ActionResponse> {
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

export async function deleteMenuItem(id: string): Promise<ActionResponse> {
  const supabase = createClient();
  const { data, error } = await (await supabase)
    .from("menu_items")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao excluir item:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/menu");
  return { success: true };
}