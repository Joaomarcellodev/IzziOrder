import { AppShell } from "@/components/organisms/app-shell";
import { OrdersDashboard } from "@/components/organisms/orders-dashboard";

export default function HomePage() {
  return (
    <AppShell
      currentPage="Painel de Pedidos"
      breadcrumb=" Painel > Painel de Pedidos"
    >
      <OrdersDashboard />
    </AppShell>
  );
}
