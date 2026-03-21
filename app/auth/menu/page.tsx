import { AppShell } from "@/components/organisms/app-shell";
import { MenuManagement } from "@/components/organisms/menu-management";
import { getCategories } from "../../actions/category-actions";
import { getMenuItems } from "../../actions/menu-item-actions";
import { ESTABLISHMENT_ID } from "@/utils/config";
import { getUser } from "@/app/actions/user-actions";

export default async function MenuPage() {
  const { data: menuItems, error: errorItems } = await getMenuItems(ESTABLISHMENT_ID);
  const { data: categories, error: errorCategory } = await getCategories(ESTABLISHMENT_ID);
  const user = await getUser()

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
      user={user}
    >
      <MenuManagement menuItems={menuItems!} categories={categories!} />
    </AppShell>
  );
}
