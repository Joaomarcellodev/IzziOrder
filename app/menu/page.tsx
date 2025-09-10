import { AppShell } from "@/components/organisms/app-shell";
import { MenuManagement } from "@/components/organisms/menu-management";

export default function MenuPage() {
  return (
    <AppShell
      currentPage="Menu Management"
      breadcrumb="Dashboard > Menu Management"
    >
      <MenuManagement />
    </AppShell>
  );
}
