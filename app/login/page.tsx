"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/molecules/card";
import { Label } from "@/components/atoms/label";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { login } from "../actions/auth-actions";
import { useToast } from "@/hooks/use-toast";

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
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 z-0 bg-[#f8fafc]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-400 opacity-20 blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8 space-y-2">
          <div className="mx-auto flex items-center justify-center mb-4 transition-transform hover:scale-105 duration-300">
            <img
              className="w-24 h-24 drop-shadow-sm"
              src="./android-chrome-512x512.png"
              alt="IzziOrder Logo"
            />
          </div>
          <h1 className="text-5xl font-black tracking-tight">
            <span className="text-[#007BFF]">izzi</span>
            <span className="text-[#FD7E14]">Order</span>
          </h1>
          <p className="text-muted-foreground font-medium">
            Gestão inteligente para seu restaurante
          </p>
        </div>

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
                <Label
                  htmlFor="email"
                  className="text-sm font-semibold text-gray-700"
                >
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
                  <Label
                    htmlFor="password"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Senha
                  </Label>
                  <Link
                    href="/reset-password"
                    className="text-xs text-blue-600 hover:underline font-medium"
                  >
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                disabled={isPending}
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98]"
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
                  <span className="bg-white px-2 text-muted-foreground">
                    Ou
                  </span>
                </div>
              </div>

              <p className="text-center text-sm text-gray-600">
                Ainda não tem uma conta?{" "}
                <Link
                  href="/sign-up"
                  className="text-orange-500 hover:text-orange-600 font-bold underline-offset-4 hover:underline transition-colors"
                >
                  Cadastre seu usuário
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
