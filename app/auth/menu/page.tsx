import { AppShell } from "@/components/organisms/app-shell";
import { MenuManagement } from "@/components/organisms/menu-management";
import { createClient } from "@/utils/supabase/server";
import { getCategories } from "../../actions/category";
import { getMenuItems } from "../../actions/menuItem";
import { ESTABLISHMENT_ID } from "@/utils/config";

export default async function MenuPage() {
  const supabaseClient = createClient()

  const { data: menuItems, error: errorItems } = await getMenuItems(ESTABLISHMENT_ID);
  const { data: categories, error: errorCategory } = await getCategories(ESTABLISHMENT_ID);

  if (errorItems) {
    console.error('Error fetching menuItems:', errorItems);
    return <div>Ocorreu um erro ao carregar os itens do menu.</div>;
  }

  if (errorCategory) {
    console.error('Error fetching categories:', errorCategory);
    return <div>Ocorreu um erro ao carregar as categorias.</div>;
  }

  return (
    <AppShell
      currentPage="Gerenciamento de cardápio"
      breadcrumb="Painel > Gerenciamento de Cardápio"
    >
      <MenuManagement menuItems={menuItems!} categories={categories!} />
    </AppShell>
  );
}
