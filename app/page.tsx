import { AppShell } from "@/components/organisms/app-shell";
import { OrdersDashboard } from "@/components/organisms/orders-dashboard";
import { getOrders } from "./actions/orders";
import { ESTABLISHMENT_ID } from "@/utils/config";

export default async function HomePage() {
  const { error, data: orders } = await getOrders(ESTABLISHMENT_ID);

  return (
    <AppShell
      currentPage="Painel de Pedidos"
      breadcrumb=" Painel > Painel de Pedidos"
    >
      <OrdersDashboard orders={orders || []}  />
    </AppShell>
  );
}
