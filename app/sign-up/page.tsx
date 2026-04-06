"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/atoms/button"
import { Input } from "@/components/atoms/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/molecules/card"
import { Label } from "@/components/atoms/label"
import { Mail, Lock, Eye, EyeOff, User, Loader2 } from "lucide-react"
import Link from "next/link"
import { signup } from "../actions/auth-actions"
import { useToast } from "@/hooks/use-toast"

export default function SignUpPage() {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(formData: FormData) {
    const password = formData.get("password") as string
    const confirmation = formData.get("password_confirmation") as string

    if (password !== confirmation) {
      toast({
        variant: "destructive",
        title: "Erro na validação",
        description: "As senhas não coincidem.",
      })
      return
    }

    startTransition(async () => {
      try {
        await signup(formData)
      } catch (error: any) {
        if (error?.digest?.includes("NEXT_REDIRECT")) {
          throw error
        }
        toast({
          variant: "destructive",
          title: "Erro ao criar conta",
          description: error.message || "Ocorreu um erro inesperado.",
        })
      }
    })
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 z-0 bg-[#f8fafc]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-orange-400 opacity-10 blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8 space-y-2">
          <div className="mx-auto flex items-center justify-center mb-4 transition-transform hover:scale-105 duration-300">
            <img className="w-20 h-20 drop-shadow-sm" src="./android-chrome-512x512.png" alt="Logo" />
          </div>
          <h1 className="text-4xl font-black tracking-tight">
            <span className="text-[#007BFF]">izzi</span>
            <span className="text-[#FD7E14]">Order</span>
          </h1>
          <p className="text-muted-foreground font-medium">Crie sua conta administrativa</p>
        </div>

        <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="pt-8 flex flex-col items-center">
            <CardTitle className="text-2xl font-bold text-gray-800">Bem-vindo!</CardTitle>
            <CardDescription className="text-center">
              Preencha os dados abaixo para começar.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form action={handleSubmit} className="space-y-4">
              
              <div className="space-y-2">
                <Label htmlFor="user_name" className="text-sm font-semibold text-gray-700">Nome de Usuário</Label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    id="user_name"
                    name="user_name"
                    placeholder="Como quer ser chamado?"
                    className="pl-10 h-11 border-gray-200 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">E-mail</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-10 h-11 border-gray-200 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password"  className="text-sm font-semibold text-gray-700">Senha</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    className="pl-10 pr-10 h-11 border-gray-200 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

             <div className="space-y-2">
                <Label htmlFor="password_confirmation" className="text-sm font-semibold text-gray-700">Repita sua senha</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    id="password_confirmation"
                    name="password_confirmation"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirme sua senha"
                    className="pl-10 h-11 border-gray-200 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    required
                  />
                </div>
              </div>

              <Button 
                disabled={isPending}
                type="submit" 
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] mt-2"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Criando conta...
                  </span>
                ) : "Finalizar Cadastro"}
              </Button>

              <p className="text-center text-sm text-gray-600 pt-4">
                Já possui uma conta?{" "}
                <Link href="/login" className="text-blue-600 hover:text-blue-700 font-bold underline-offset-4 hover:underline transition-colors">
                  Fazer login
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}