import { AppShell } from "@/components/organisms/app-shell";
import { MenuManagement } from "@/components/organisms/menu-management";
import { createClient } from "@/lib/supabase/server";

export default async function MenuPage() {
  const supabaseClient = createClient()

  const { data: menuItems } = await (await supabaseClient).from("menu_items").select()

  return (
    <AppShell
      currentPage="Gerenciamento de cardápio"
      breadcrumb="Painel > Gerenciamento de Cardápio"
    >
      <MenuManagement />
    </AppShell>
  );
}
