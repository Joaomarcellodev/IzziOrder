import { AppShell } from "@/components/organisms/app-shell";
import { TableMap } from "@/components/organisms/table-map";
import { getTables } from "@/app/actions/table-actions";
import { getMenuItems } from "../../actions/menu-item-actions";
import { getCategories } from "../../actions/category-actions";
import { ESTABLISHMENT_ID } from "@/utils/config";
import { getUser } from "@/app/actions/user-actions";

export default async function TablesPage() {
  const { data: initialTables, error: errorTables } = await getTables(ESTABLISHMENT_ID);
  const { data: categories, error: errorCategories } = await getCategories(ESTABLISHMENT_ID);
  const { data: menuItems, error: errorMenuItems } = await getMenuItems(ESTABLISHMENT_ID);
  const user = await getUser()

  if (errorTables) {
    return <div>Erro: {errorTables}</div>;
  }

  if (errorMenuItems) {
    return <div>Erro: {errorMenuItems}</div>;
  }

  if (errorCategories) {
    return <div>Erro: {errorCategories}</div>;
  }

  return (
    <AppShell currentPage="Gerenciamento de mesas" breadcrumb="Painel > Gerenciamento de mesas" user={user}
    >
      <TableMap tables={initialTables!} menuItems={menuItems!} categories={categories!} />
    </AppShell>
  );
}
