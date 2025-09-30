import { AppShell } from "@/components/organisms/app-shell";
import { TableMap } from "@/components/organisms/table-map";
import { getTables } from "@/app/actions/tables";

export default async function TablesPage() {
  const { data: initialTables, error: error } = await getTables("b8bd8c47-d938-4cd2-b6c3-4cc5ad365403");

  if (error) {
    return <div>Erro: {error}</div>;
  }

  return (
    <AppShell currentPage="Gerenciamento de mesas" breadcrumb="Painel > Gerenciamento de mesas">
      <TableMap tables={initialTables!} />
    </AppShell>
  );
}
