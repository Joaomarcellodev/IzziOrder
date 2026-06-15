"use server"

import { getEstablishmentSlug } from "./establisment_actions"
import { redirect } from "next/navigation"

export async function redirectToMyMenu() {
    const slug = await getEstablishmentSlug()
    redirect(`/cardapio/${slug}`)
}
