"use client";

import { useState } from "react";
import { User, Mail, Save } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/molecules/card";
import { useToast } from "@/hooks/use-toast";
import { updateProfile } from "@/app/actions/user-actions";

interface ProfileFormProps {
  initialData: { name: string; email: string };
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(initialData);

  const hasChanges = data.name !== initialData.name || data.email !== initialData.email;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);

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
    } catch (error) {
      toast({  title: "Erro", description: "Falha ao atualizar perfil." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-sm ring-1 ring-gray-200">
      <CardHeader className="border-b bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
            <User className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg">Informações Pessoais</CardTitle>
            <CardDescription>Atualize seu nome e e-mail principal.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold">Nome Completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  className="pl-10 h-11"
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
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
                  className="pl-10 h-11"
                  value={data.email}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={loading || !hasChanges} className="gap-2 bg-blue-600 hover:bg-blue-700 h-11 px-6">
              <Save className="h-4 w-4" />
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}