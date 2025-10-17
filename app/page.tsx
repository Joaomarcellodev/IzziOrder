import { AppShell } from "@/components/organisms/app-shell";
import { OrdersDashboard } from "@/components/organisms/orders-dashboard";
import { getOrders } from "./actions/orders";
import { ESTABLISHMENT_ID } from "@/utils/config";
import { getMenuItems } from "./actions/menuItem";
import { getCategories } from "./actions/category";

export default async function HomePage() {
  const { data: orders, error: errorTables } = await getOrders(ESTABLISHMENT_ID);
  const { data: categories, error: errorCategories } = await getCategories(ESTABLISHMENT_ID);
  const { data: menuItems, error: errorMenuItems } = await getMenuItems(ESTABLISHMENT_ID);

  if (errorTables) {
    return <div>Erro: {errorTables}</div>;
  }

  if (errorMenuItems) {
    return <div>Erro: {errorMenuItems}</div>;
  }

  if (errorCategories) {
    return <div>Erro: {errorCategories}</div>;
  }

  return (
    <AppShell
      currentPage="Painel de Pedidos"
      breadcrumb=" Painel > Painel de Pedidos"
    >
      <OrdersDashboard orders={orders!} categories={categories!} menuItems={menuItems!} />
    </AppShell>
  );
}
