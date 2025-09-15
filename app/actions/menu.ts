"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

interface MenuItemData {
    name: string,
    description: string;
    price: number;
    category: string;
    image: string;
    available: boolean;
}

export async function createMenuItem(item: MenuItemData) {
    const supabase = createClient();
    const { data, error } = await (await supabase).from("menu_items").insert([item]);

    if (error) {
        console.error("Erro ao adicionar item:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/menu");

    return { success: true };
}

export async function updateMenuItem(id: string, updates: Partial<MenuItemData>) {
    const supabase = createClient();
    const { data, error } = await (await supabase).from("menu_items").update(updates).eq("id", id).select();

    if (error) {
        console.error("Erro ao atualizar item:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/menu");

    return { success: true };
}

export async function updateMenuItemAvailability(id: string, available: boolean) {
    const supabase = createClient();
    const { data, error } = await (await supabase).from("menu_items").update({ available: available }).eq("id", id);

    if (error) {
        console.error("Erro ao atualizar disponibilidade do item:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/menu");

    return { success: true };
}