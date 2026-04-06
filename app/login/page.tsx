"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/molecules/card";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { login } from "../actions/auth-actions";
import { useToast } from "@/hooks/use-toast";
import { AuthLayout } from "@/components/templates/auth-layout";
import { AuthHeader } from "@/components/molecules/auth-header";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const { success, error } = await login(formData);

      if (!success) {
        toast({
          variant: "destructive",
          title: "Erro na autenticação",
          description: error || "Verifique suas credenciais.",
        });
      } else {
        window.location.href = "/auth/orders";
      }
    });
  }

  return (
    <AuthLayout>
      <AuthHeader subtitle="Gestão inteligente para seu restaurante" />

      <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="pt-8 flex flex-col items-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Bem-vindo de volta
          </CardTitle>
          <CardDescription className="text-center">
            Acesse seu painel de controle administrativo
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <form action={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                E-mail
              </Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="exemplo@restaurante.com"
                  className="pl-10 h-11 border-gray-200 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                  Senha
                </Label>
                <Link href="/reset-password" className="text-xs text-blue-600 hover:underline font-medium">
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-11 border-gray-200 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              disabled={isPending}
              type="submit"
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Entrando...
                </span>
              ) : (
                "Acessar Painel"
              )}
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-100"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Ou</span>
              </div>
            </div>

            <p className="text-center text-sm text-gray-600">
              Ainda não tem uma conta?{" "}
              <Link href="/sign-up" className="text-orange-500 hover:text-orange-600 font-bold hover:underline transition-colors">
                Cadastre seu usuário
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}