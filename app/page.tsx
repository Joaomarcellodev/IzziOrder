import { AppShell } from "@/components/app-shell"
import { OrdersDashboard } from "@/components/orders-dashboard"

export default function HomePage() {
  return (
    <AppShell currentPage="Orders Dashboard" breadcrumb="Dashboard > Orders Panel">
      <OrdersDashboard />
    </AppShell>
  )
}
