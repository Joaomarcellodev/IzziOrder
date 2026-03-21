import { getUser } from "@/app/actions/user-actions";
import { AppShell } from "@/components/organisms/app-shell";
import { ReportsAnalytics } from "@/components/organisms/reports-analytics";

export default async function ReportsPage() {
  const user = await getUser()

  return (
    <AppShell
      currentPage="Relatório"
      breadcrumb="Painel > Relatório e Analíses"
      user={user.toJSON()}
    >
      <ReportsAnalytics />
    </AppShell>
  );
}
