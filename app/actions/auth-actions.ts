"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import { SignUpUser } from "@/lib/entities/sign-up-user";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { success: false, error: "Credenciais inválidas." };
  }

  revalidatePath("/", "layout");
  redirect("/auth/orders");
}

export async function signup(formData: FormData) {
  try {
    const user = SignUpUser.fromFormData(formData);
    await signupService(user);
    revalidatePath("/", "layout");
  } catch (error: any) {
    if (
      error.message === "NEXT_REDIRECT" ||
      error.digest?.includes("NEXT_REDIRECT")
    ) {
      throw error;
    }
    console.error("Erro no Signup Action:", error.message);
    return { success: false, error: error.message || "Erro ao criar conta." };
  }
  redirect("/auth/menu");
}

export async function signupService(user: SignUpUser) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: user.email,
    password: user.password,
    options: {
      data: {
        user_name: user.name,
      },
    },
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/auth/update-password`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function updatePassword(formData: FormData) {
  try {
    const supabase = await createClient();
    const password = formData.get("password") as string;

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Erro ao identificar usuário:", userError?.message);
      return {
        success: false,
        error: "Sessão inválida. Tente solicitar um novo e-mail.",
      };
    }

    console.log("Tentando atualizar senha para o usuário:", user.id);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      console.error("Erro do Supabase no Update:", error.message);
      return { success: false, error: error.message };
    }

    revalidatePath("/", "layout");
  } catch (error: any) {
    if (
      error.message === "NEXT_REDIRECT" ||
      error.digest?.includes("NEXT_REDIRECT")
    ) {
      throw error;
    }
    return { success: false, error: "Falha na comunicação com o servidor." };
  }

  redirect("/login?message=Sua senha foi atualizada com sucesso!");
}
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
