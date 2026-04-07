"use client";

import { useState } from "react";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/molecules/card";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { useToast } from "@/hooks/use-toast";
import { updatePassword, updateProfile } from "@/app/actions/user-actions";
import { KeyRound, User, Mail, ShieldCheck, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsManagementProps {
  user: {
    name: string;
    email: string;
  };
}

export function SettingsManagement({ user }: SettingsManagementProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const hasProfileChanges = profileData.name !== user.name || profileData.email !== user.email;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasProfileChanges) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", profileData.name);
      formData.append("email", profileData.email);

      const result = await updateProfile(formData);
      if (result.success) {
        toast({
          title: result.emailChanged ? "Confirmação enviada!" : "Sucesso!",
          description: result.emailChanged 
            ? "Valide o novo endereço no seu e-mail." 
            : "Perfil atualizado com sucesso!",
          className: "bg-green-600 text-white border-green-700",
        });
      }
    } catch (error: any) {
      toast({ title: "Erro", description: "Falha ao atualizar perfil." });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword) return;

    setPasswordLoading(true);
    try {
      const formData = new FormData();
      Object.entries(passwordData).forEach(([key, value]) => formData.append(key, value));

      const result = await updatePassword(formData);
      if (result.success) {
        toast({ title: "Senha alterada!", className: "bg-green-600 text-white" });
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast({ title: "Erro", description: result.error });
      }
    } catch (error) {
      toast({ title: "Erro de conexão" });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-8 px-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Configurações</h1>
        <p className="text-gray-500">Gerencie suas informações de conta e preferências de segurança.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-gray-200">
            <CardHeader className="border-b bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Informações Pessoais</CardTitle>
                  <CardDescription>Atualize seu nome e endereço de e-mail principal.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold">Nome Completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        className="pl-10 h-11 focus-visible:ring-blue-600"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        className="pl-10 h-11 focus-visible:ring-blue-600"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={loading || !hasProfileChanges}
                    className="gap-2 bg-blue-600 hover:bg-blue-700 h-11 px-6 transition-all"
                  >
                    <Save className="h-4 w-4" />
                    {loading ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="border-none shadow-sm ring-1 ring-gray-200 h-full">
            <CardHeader className="border-b bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Segurança</CardTitle>
                  <CardDescription>Alterar senha</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current" className="text-xs font-bold uppercase text-gray-500">Senha Atual</Label>
                  <Input 
                    id="current" 
                    type="password" 
                    className="h-10"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new" className="text-xs font-bold uppercase text-gray-500">Nova Senha</Label>
                  <Input 
                    id="new" 
                    type="password" 
                    className="h-10"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm" className="text-xs font-bold uppercase text-gray-500">Confirmar Senha</Label>
                  <Input 
                    id="confirm" 
                    type="password" 
                    className="h-10"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={passwordLoading || !passwordData.newPassword}
                  className="w-full mt-2 bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {passwordLoading ? "Atualizando..." : "Atualizar Senha"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}