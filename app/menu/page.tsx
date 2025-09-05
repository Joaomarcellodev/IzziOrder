import { AppShell } from "@/components/app-shell"
import { MenuManagement } from "@/components/menu-management"

export default function MenuPage() {
  return (
    <AppShell currentPage="Menu Management" breadcrumb="Dashboard > Menu Management">
      <MenuManagement />
    </AppShell>
  )
}
