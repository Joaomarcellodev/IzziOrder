import { AppShell } from "@/components/organisms/app-shell";
import { TableMap } from "@/components/organisms/table-map";

export default function TablesPage() {
  return (
    <AppShell currentPage="Table Map" breadcrumb="Dashboard > Table Map">
      <TableMap />
    </AppShell>
  );
}
