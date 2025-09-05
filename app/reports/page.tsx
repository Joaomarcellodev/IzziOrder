import { AppShell } from "@/components/app-shell"
import { ReportsAnalytics } from "@/components/reports-analytics"

export default function ReportsPage() {
  return (
    <AppShell currentPage="Reports" breadcrumb="Dashboard > Reports & Analytics">
      <ReportsAnalytics />
    </AppShell>
  )
}
