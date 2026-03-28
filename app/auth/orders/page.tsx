import { AppShell } from "@/components/organisms/app-shell";
import { getOrders } from "@/app/actions/order-actions";
import { ESTABLISHMENT_ID } from "@/utils/config";
import { getMenuItems } from "@/app/actions/menu-item-actions";
import { getCategories } from "@/app/actions/category-actions";
import OrdersDashboard from "@/components/organisms/orders-dashboard";
import { getUser } from "@/app/actions/user-actions";


export default async function OrdersPage() {

  const { data: orders, error: errorTables } = await getOrders(ESTABLISHMENT_ID);
  const { data: categories, error: errorCategories } = await getCategories(ESTABLISHMENT_ID);
  const { data: menuItems, error: errorMenuItems } = await getMenuItems(ESTABLISHMENT_ID);
  const user = await getUser()

  if (errorTables) return <div>Erro: {errorTables}</div>;
  if (errorMenuItems) return <div>Erro: {errorMenuItems}</div>;
  if (errorCategories) return <div>Erro: {errorCategories}</div>;

  return (
    <AppShell
      currentPage="Painel de Pedidos"
      breadcrumb="Painel > Painel de Pedidos"
      user={user.toJSON()}
    >
      <OrdersDashboard orders={orders!} categories={categories!} menuItems={menuItems!} />
    </AppShell>
  );
}
