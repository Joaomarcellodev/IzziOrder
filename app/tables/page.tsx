import { AppShell } from "@/components/organisms/app-shell";
import { TableMap } from "@/components/organisms/table-map";
import { getTables } from "@/app/actions/tables";
import { getMenuItems } from "../actions/menuItem";
import { getCategories } from "../actions/category";

export default async function TablesPage() {
  const { data: initialTables, error: errorTables } = await getTables("b8bd8c47-d938-4cd2-b6c3-4cc5ad365403");
  const { data: menuItems, error: errorMenuItems } = await getMenuItems();
  const { data: categories, error: errorCategories } = await getCategories();

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
    <AppShell currentPage="Gerenciamento de mesas" breadcrumb="Painel > Gerenciamento de mesas">
      <TableMap tables={initialTables!} menuItems={menuItems!} categories={categories!} />
    </AppShell>
  );
}
