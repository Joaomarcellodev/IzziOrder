"use server";

import { createClient } from "@supabase/supabase-js";

function getPublicSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Use Service Role Key to bypass RLS on server actions
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Supabase URL ou Service Key não estão definidas.");
  }

  return createClient(url, serviceKey);
}

export interface PublicMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl: string;
  available: boolean;
}

export interface PublicCategory {
  id: string;
  name: string;
}

export interface PublicEstablishment {
  id: string;
  name: string;
  slug: string;
}

export interface PublicMenuData {
  establishment: PublicEstablishment;
  categories: PublicCategory[];
  menuItems: PublicMenuItem[];
}

/**
 * Busca o estabelecimento pelo slug amigável.
 */
export async function getEstablishmentBySlug(
  slug: string
): Promise<PublicEstablishment | null> {
  const supabase = getPublicSupabase();

  console.log("Fetching establishment with slug:", slug);

  const { data, error } = await supabase
    .from("establishments")
    .select("id, name, slug")
    .eq("slug", slug)
    .single();

  console.log("DB Result - data:", data, "error:", error);

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
  };
}

/**
 * Busca o cardápio público completo de um estabelecimento pelo slug.
 * Retorna apenas itens ativos e disponíveis.
 */
export async function getPublicMenu(
  slug: string
): Promise<PublicMenuData | null> {
  const establishment = await getEstablishmentBySlug(slug);

  if (!establishment) {
    return null;
  }

  const supabase = getPublicSupabase();

  // Busca categorias do estabelecimento
  const { data: categories, error: catError } = await supabase
    .from("categories")
    .select("id, name")
    .eq("establishment_id", establishment.id);

  if (catError) {
    console.error("Erro ao buscar categorias públicas:", catError);
    throw new Error("Erro ao carregar o cardápio.");
  }

  // Busca itens disponíveis e ativos
  const { data: items, error: itemError } = await supabase
    .from("menu_items")
    .select("id, name, description, price, category_id, image, available")
    .eq("establishment_id", establishment.id)
    .eq("is_active", true)
    .eq("available", true)
    .order("position", { ascending: true });

  if (itemError) {
    console.error("Erro ao buscar itens públicos:", itemError);
    throw new Error("Erro ao carregar os itens do cardápio.");
  }

  const menuItems: PublicMenuItem[] = (items || []).map((item: any) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    categoryId: item.category_id,
    imageUrl: item.image,
    available: item.available,
  }));

  // Filtra categorias que possuem pelo menos 1 item disponível
  const categoryIdsWithItems = new Set(menuItems.map((i) => i.categoryId));
  const filteredCategories = (categories || [])
    .filter((c: any) => categoryIdsWithItems.has(c.id))
    .map((c: any) => ({ id: c.id, name: c.name }));

  return {
    establishment,
    categories: filteredCategories,
    menuItems,
  };
}
