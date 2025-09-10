import { AppShell } from "@/components/organisms/app-shell";
import { OrdersDashboard } from "@/components/organisms/orders-dashboard";

export default function HomePage() {
  return (
    <AppShell
      currentPage="Orders Dashboard"
      breadcrumb="Dashboard > Orders Panel"
    >
      <OrdersDashboard />
    </AppShell>
  );
}
