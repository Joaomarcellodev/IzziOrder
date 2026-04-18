"use server";

import { createClient } from "@/utils/supabase/server";
import { getEstablishmentId } from "./establisment_actions";

export async function getTables(id: string) {
    const supabase = createClient();

    const { data, error } = await (await supabase).from("tables").select().eq("establishment_id", id);

    if (error) {
        console.error("Erro ao carregar mesas:", error);
        return { success: false, error: "Erro ao carregar mesas." }
    }

    return { success: true, data: data ?? [] };
}

export async function createTable(number: number) {
    const supabase = createClient();

    const { data, error } = await (await supabase)
        .from("tables")
        .insert({ table_number: number, establishment_id: await getEstablishmentId() })
        .select()
        .single();

    if (error) {
        console.error("Erro ao criar mesa:", error);
        return { success: false, error: "Erro ao criar mesa." }
    }

    return { success: true, data: data };
}

export async function updateTable(id: string, new_number: number) {
    const supabase = await createClient();

    const { data, error } = await (await supabase)
        .from("tables")
        .update({ table_number: new_number })
        .eq("id", id)
        .eq("establishment_id", await getEstablishmentId())
        .select()
        .single();

    if (error) {
        console.error("Erro ao editar a mesa:", error);
        return { success: false, error: "Erro ao editar a mesa." }
    }

    return { success: true, data: data };
}

export async function deleteTable(id: string) {
    const supabase = await createClient();

    const { data, error } = await (await supabase)
        .from("tables")
        .delete()
        .eq("id", id)
        .eq("establishment_id", await getEstablishmentId())
        .select()
        .single();

    if (error) {
        console.error("Erro ao excluir a mesa:", error);
        return { success: false, error: "Erro ao excluir a mesa." }
    }

    return { success: true, data: data };
}