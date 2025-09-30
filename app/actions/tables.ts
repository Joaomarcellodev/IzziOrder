"use server";

import { createClient } from "@/lib/supabase/server";

export async function getTables(id: string) {
    const client = createClient();

    const { data, error } = await (await client).from("tables").select().eq("establishment_id", id);

    if (error) {
        return { success: false, error: "Erro ao carregar tabelas." }
    }

    return { success: true, data: data ?? [] };
}