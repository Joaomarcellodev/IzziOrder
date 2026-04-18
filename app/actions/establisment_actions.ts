"use server"

import { createClient } from "@/utils/supabase/server"
import { getUserAuthenticated } from "./user-actions"

let establishment_id: string = ""

export async function getEstablishmentId(supabaseClient?: any) {
    if (establishment_id !== "") return establishment_id;

    const supabase = supabaseClient ?? await createClient()
    const user = await getUserAuthenticated(supabase)
    const { data, error } = await supabase.from("establishments").select("id").eq("owner_id", user.id).single();
    if (error) {
        throw new Error(error.message)
    }

    establishment_id = data.id
    return data.id;
}