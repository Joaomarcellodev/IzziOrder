import { AppShell } from "@/components/organisms/app-shell";
import { OrdersDashboard } from "@/components/organisms/orders-dashboard";
import { getOrders } from "@/app/actions/orders";
import { ESTABLISHMENT_ID } from "@/utils/config";
import { getMenuItems } from "@/app/actions/menuItem";
import { getCategories } from "@/app/actions/category";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/auth"; ;

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const { data: orders, error: errorTables } = await getOrders(ESTABLISHMENT_ID);
  const { data: categories, error: errorCategories } = await getCategories(ESTABLISHMENT_ID);
  const { data: menuItems, error: errorMenuItems } = await getMenuItems(ESTABLISHMENT_ID);

  if (errorTables) return <div>Erro: {errorTables}</div>;
  if (errorMenuItems) return <div>Erro: {errorMenuItems}</div>;
  if (errorCategories) return <div>Erro: {errorCategories}</div>;

  return (
    <AppShell
      currentPage="Painel de Pedidos"
      breadcrumb="Painel > Painel de Pedidos"
    >
      <OrdersDashboard orders={orders!} categories={categories!} menuItems={menuItems!} />
    </AppShell>
  );
}
