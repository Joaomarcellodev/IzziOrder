"use client";

import { ProfileForm } from "./profile-form";
import { SecurityForm } from "./security-form";

interface SettingsManagementProps {
  user: {
    name: string;
    email: string;
  };
}

export function SettingsManagement({ user }: SettingsManagementProps) {
  return (
    <div className="mx-auto max-w-5xl space-y-8 py-8 px-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Configurações</h1>
        <p className="text-gray-500">Gerencie suas informações de conta e preferências de segurança.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ProfileForm initialData={user} />
        </div>

        <div className="lg:col-span-1">
          <SecurityForm />
        </div>
      </div>
    </div>
  );
}