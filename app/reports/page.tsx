import { AppShell } from "@/components/organisms/app-shell";
import { ReportsAnalytics } from "@/components/organisms/reports-analytics";

export default function ReportsPage() {
  return (
    <AppShell
      currentPage="Reports"
      breadcrumb="Dashboard > Reports & Analytics"
    >
      <ReportsAnalytics />
    </AppShell>
  );
}
