'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
import { User } from '@/lib/user'
import { Session, SupabaseClient } from '@supabase/supabase-js'

export async function login(formData: FormData) {
    const supabase = await createClient()

    // type-casting here for convenience
    // in practice, you should validate your inputs

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

    const user = User.fromFormData(formData)

    await signupService(user)

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signupService(user: User) {
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