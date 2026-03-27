import { AppShell } from "@/components/organisms/app-shell";
import { SettingsManagement } from "@/components/organisms/settings-management";
import { getUser } from "@/app/actions/user-actions";

export default async function SettingsPage() {
  const user = await getUser();

  return (
    <AppShell
      currentPage="Configurações de Usuários"
      breadcrumb="Painel > Configurações"
      user={user.toJSON()}
    >
      <SettingsManagement />
    </AppShell>
  );
}
