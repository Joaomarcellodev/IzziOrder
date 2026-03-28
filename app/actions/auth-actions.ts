'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
import { SignUpUser } from '@/lib/entities/sign-up-user'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { data: dataU, error } = await supabase.auth.signInWithPassword(data)

    console.log(dataU)

    if (error) {
        return { success: false, error: "Credenciais inválidas." }
    }

    revalidatePath('/', 'layout')
    redirect('/auth/orders')
}

export async function signup(formData: FormData) {

    const user = SignUpUser.fromFormData(formData)

    await signupService(user)

    revalidatePath('/', 'layout')
    redirect('/auth/menu')
}

export async function signupService(user: SignUpUser) {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
            data: {
                user_name: user.name
            }
        }
    })

    if (error) {
        throw new Error(error.message)
    }

    return data
}

export async function logout() {
    const supabase = await createClient()

    await supabase.auth.signOut()

    redirect("/login")
}