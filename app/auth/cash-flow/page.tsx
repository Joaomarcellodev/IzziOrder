import { AppShell } from "@/components/organisms/app-shell";
import { CashFlowManagement } from "@/components/organisms/cash-flow-management";
import { getUser } from "@/app/actions/user-actions";
import { getCashFlowEntries, getCurrentCashTotal } from "@/app/actions/cash-flow-actions";
import { getCashEntryCategories } from "@/app/actions/cash-entry-category-actions";

export default async function CashFlowPage() {
  const user = await getUser();
  
  // Fetch cash flow data using server actions
  const categories = await getCashEntryCategories();
  const entries = await getCashFlowEntries();
  const total = await getCurrentCashTotal();

  return (
    <AppShell
      currentPage="Fluxo de Caixa"
      breadcrumb="Painel > Fluxo de Caixa"
      user={user.toJSON()}
    >
      <CashFlowManagement
        initialEntries={entries}
        initialCategories={categories}
        initialTotal={total}
      />
    </AppShell>
  );
}
