import { AppShell } from "@/components/organisms/app-shell";
import { MenuManagement } from "@/components/organisms/menu-management";
import { createClient } from "@/lib/supabase/server";

export default async function MenuPage() {
  const supabaseClient = createClient()

  const { data: menuItems, error } = await (await supabaseClient).from("menu_items").select()

  if (error) {
    console.error('Error fetching menuItems:', error);
    return <div>Ocorreu um erro ao carregar o menu.</div>;
  }

  return (
    <AppShell
      currentPage="Gerenciamento de cardápio"
      breadcrumb="Painel > Gerenciamento de Cardápio"
    >
      <MenuManagement menuItems={menuItems} />
    </AppShell>
  );
}
