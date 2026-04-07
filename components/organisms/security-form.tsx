"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/molecules/card";
import { useToast } from "@/hooks/use-toast";
import { updatePassword } from "@/app/actions/user-actions";

export function SecurityForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword) return;

    setLoading(true);
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
      setLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-sm ring-1 ring-gray-200 h-full">
      <CardHeader className="border-b bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg">Segurança</CardTitle>
            <CardDescription>Alterar sua senha</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current" className="text-xs font-bold uppercase text-gray-500">Senha Atual</Label>
            <Input 
              id="current" type="password" 
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new" className="text-xs font-bold uppercase text-gray-500">Nova Senha</Label>
            <Input 
              id="new" type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm" className="text-xs font-bold uppercase text-gray-500">Confirmar Senha</Label>
            <Input 
              id="confirm" type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
            />
          </div>
          <Button type="submit" disabled={loading || !passwordData.newPassword} className="w-full mt-2 bg-orange-600 hover:bg-orange-700">
            {loading ? "Atualizando..." : "Atualizar Senha"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}