"use server"

import { User } from "@/lib/entities/user";
import { createClient } from "@/utils/supabase/server"

export async function getUser(supabaseClient?: any) {
    const supabase = supabaseClient ?? await createClient()
    const user = await getUserAuthenticated(supabase)
    const name = await getUserName(supabase, user)
    return new User(name, user.email)
}

export async function getUserAuthenticated(supabase: any) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        throw new Error("User not authenticated");
    }
    return user;
}

export async function getUserName(supabase: any, user: any) {
    const { data, error } = await supabase.from("profiles").select("user_name").eq("id", user.id).single();
    if (error) {
        throw new Error(error.message)
    }
    return data.user_name;
}
