import { AppShell } from "@/components/organisms/app-shell";
import { getOrders } from "@/app/actions/order-actions";
import { getMenuItems } from "@/app/actions/menu-item-actions";
import { getCategories } from "@/app/actions/category-actions";
import OrdersDashboard from "@/components/organisms/orders-dashboard";
import { getUser } from "@/app/actions/user-actions";
import { getEstablishmentId } from "@/app/actions/establisment_actions";

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as any).message);
  }
  return String(error);
}

export default async function OrdersPage() {
  let orders: any = null;
  let user: any = null;
  let establishment_id: any = null;

  try {
    establishment_id = await getEstablishmentId()
    orders = await getOrders(establishment_id);
    user = await getUser();
  } catch (error: unknown) {
    console.error("Erro ao carregar pedidos/usuário:", error);

    return <div>Erro: {getErrorMessage(error)}</div>;
  }

  const { data: categories, error: errorCategories } =
    await getCategories(establishment_id);

  const { data: menuItems, error: errorMenuItems } =
    await getMenuItems(establishment_id);

  if (errorMenuItems) {
    console.error("Erro menuItems:", errorMenuItems);

    return <div>Erro: {getErrorMessage(errorMenuItems)}</div>;
  }

  if (errorCategories) {
    console.error("Erro categories:", errorCategories);

    return <div>Erro: {getErrorMessage(errorCategories)}</div>;
  }

  const safeUser =
    user && typeof user.toJSON === "function" ? user.toJSON() : user ?? {};

  return (
    <AppShell
      currentPage="Painel de Pedidos"
      breadcrumb="Painel > Painel de Pedidos"
      user={safeUser}
    >
      <OrdersDashboard
        orders={orders ?? []}
        categories={categories ?? []
        }
        menuItems={menuItems ?? []}
      />
    </AppShell>
  );
}