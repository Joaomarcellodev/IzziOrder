import { AppShell } from "@/components/organisms/app-shell";
import { MenuManagement } from "@/components/organisms/menu-management";

export default function MenuPage() {
  return (
    <AppShell
      currentPage="Gerenciamento de cardápio"
      breadcrumb="Painel > Gerenciamento de Cardápio"
    >
      <MenuManagement />
    </AppShell>
  );
}
