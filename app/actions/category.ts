"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createCategory(name: String) {
    const supabase = createClient();

    const { data, error } = await (await supabase).from("category").insert({ name }).select();

    if (error) {
        console.error("Erro ao adicionar categoria:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/menu");
    return { success: true, data: data[0] };
}

export async function updateCategory(id: string, newName: string) {
    const supabase = createClient();

    const { data, error } = await (await supabase)
        .from("category")
        .update({ name: newName })
        .eq("id", id)
        .select();

    if (error) {
        console.error("Erro ao atualizar categoria:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/menu"); // invalida cache da rota /menu
    return { success: true, data: data[0] };
}