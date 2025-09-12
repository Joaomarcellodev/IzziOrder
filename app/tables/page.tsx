import { AppShell } from "@/components/organisms/app-shell";
import { TableMap } from "@/components/organisms/table-map";

export default function TablesPage() {
  return (
    <AppShell currentPage="Gerenciamento de mesas" breadcrumb="Painel > Gerenciamento de mesas">
      <TableMap />
    </AppShell>
  );
}
