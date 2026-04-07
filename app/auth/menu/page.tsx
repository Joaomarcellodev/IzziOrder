import { AppShell } from "@/components/organisms/app-shell";
import { getCategories } from "../../actions/category-actions";
import { getMenuItems } from "../../actions/menu-item-actions";
import { ESTABLISHMENT_ID } from "@/utils/config";
import { getUser } from "@/app/actions/user-actions";
import MenuManagement from "@/components/organisms/menu-management";

export default async function MenuPage() {
  const { data: menuItems, error: errorItems } = await getMenuItems(ESTABLISHMENT_ID);
  const { data: categories, error: errorCategory } = await getCategories(ESTABLISHMENT_ID);
  const user = await getUser();

  if (errorItems || errorCategory) {
    console.error('Error fetching data:', errorItems || errorCategory);
    return (
      <AppShell
        currentPage="Erro"
        breadcrumb="Painel > Erro"
        user={user?.toJSON()}
      >
        <div className="p-6 text-red-500 bg-red-50 rounded-lg border border-red-200">
          Ocorreu um erro ao carregar os dados do cardápio. Por favor, tente novamente mais tarde.
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      currentPage="Gerenciamento de cardápio"
      breadcrumb="Painel > Gerenciamento de Cardápio"
      user={user.toJSON()}
    >
    
      <MenuManagement 
        menuItems={menuItems ?? []} 
        categories={categories ?? []} 
      />
    </AppShell>
  );
}