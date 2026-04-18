import { AppShell } from "@/components/organisms/app-shell";
import { MenuManagement } from "@/components/organisms/menu-management";
import { getCategories } from "../../actions/category-actions";
import { getMenuItems } from "../../actions/menu-item-actions";
import { getUser } from "@/app/actions/user-actions";
import { getEstablishmentId } from "@/app/actions/establisment_actions";

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as any).message);
  }
  return String(error);
}

export default async function MenuPage() {
  let establishment_id: any = null;

  try {
    establishment_id = await getEstablishmentId()
  } catch (error: unknown) {
    console.error("Erro ao carregar pedidos/usuário:", error);

    return <div>Erro: {getErrorMessage(error)}</div>;
  }

  const { data: menuItems, error: errorItems } = await getMenuItems(establishment_id);
  const { data: categories, error: errorCategory } = await getCategories(establishment_id);
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
      user={user.toJSON()}
    >
      <MenuManagement menuItems={menuItems!} categories={categories!} />
    </AppShell>
  );
}
