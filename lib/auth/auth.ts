"use server";

import { cookies } from "next/headers";

export async function getSession() {
  // Exemplo simples: busca um cookie chamado "session"
  const cookieStore = await cookies();
  const session = cookieStore.get("session");

  if (!session) {
    return null;
  }

  // Aqui você pode decodificar o token JWT ou buscar o usuário no banco, se quiser
  return {
    user: {
      name: "Usuário de Teste",
    },
    token: session.value,
  };
}
