import { AppShell } from "@/components/app-shell"
import { TableMap } from "@/components/table-map"

export default function TablesPage() {
  return (
    <AppShell currentPage="Table Map" breadcrumb="Dashboard > Table Map">
      <TableMap />
    </AppShell>
  )
}
