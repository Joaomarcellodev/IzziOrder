"use server"

import { User } from "@/lib/entities/user";
import { createClient } from "@/utils/supabase/server"
import { validatePasswordChange, validateProfileUpdate } from "@/lib/validators/user-settings"
import { revalidatePath } from "next/cache"

export async function getUser(supabaseClient?: any) {
    const supabase = supabaseClient ?? await createClient()
    const userAuth = await getUserAuthenticated(supabase)
    const profile = await getUserProfile(supabase, userAuth)
    return new User(profile.user_name, userAuth.email!)
}

export async function getUserAuthenticated(supabase: any) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        throw new Error("User not authenticated");
    }
    return user;
}

export async function getUserProfile(supabase: any, user: any) {
    const { data, error } = await supabase.from("profiles").select("user_name").eq("id", user.id).single();
    if (error) {
        throw new Error(error.message)
    }
    return data;
}

export async function updatePassword(formData: FormData, supabaseClient?: any) {
    const supabase = supabaseClient ?? await createClient()
    const currentPassword = formData.get("currentPassword") as string
    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string

    const errors = validatePasswordChange(currentPassword, newPassword, confirmPassword)
    if (errors.length > 0) {
        return { success: false, error: errors[0] }
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !user.email) return { success: false, error: "Usuário não autenticado" }

    const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
    })

    if (signInError) {
        return { success: false, error: "Senha atual incorreta" }
    }

    const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
    })

    if (updateError) {
        let errorMessage = updateError.message
        if (errorMessage.includes("new password should be different from the old one")) {
            errorMessage = "A nova senha deve ser diferente da senha atual"
        }
        return { success: false, error: errorMessage }
    }

    return { success: true }
}

export async function updateProfile(formData: FormData, supabaseClient?: any) {
    const supabase = supabaseClient ?? await createClient()
    const name = formData.get("name") as string
    const email = formData.get("email") as string

    const errors = validateProfileUpdate(name, email)
    if (errors.length > 0) {
        return { success: false, error: errors[0] }
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Usuário não autenticado" }

    // Update email if changed
    if (email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email })
        if (emailError) return { success: false, error: emailError.message }
    }

    // Update profiles table
    const { error: profileError } = await supabase.from("profiles").update({
        user_name: name,
    }).eq("id", user.id)

    if (profileError) {
        return { success: false, error: profileError.message }
    }

    revalidatePath("/auth/settings")
    return { success: true }

}
