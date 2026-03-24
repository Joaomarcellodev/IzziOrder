"use client"

import { useState } from "react"
import { Button } from "@/components/atoms/button"
import { Input } from "@/components/atoms/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/molecules/card"
import { Label } from "@/components/atoms/label"
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react"
import Link from "next/link"
import { login } from "../actions/login"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const inputClasses = "pl-10 bg-slate-50/50 border-slate-200 focus:bg-white transition-all"
  const iconClasses = "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors"

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    try {
      const { success, error } = await login(formData)
      if (!success) {
        toast({ 
          variant: "destructive",
          title: "Erro ao fazer login", 
          description: error || "Verifique suas credenciais." 
        })
      } else {
        window.location.href = "/auth/orders"
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-[400px] space-y-8">
        
        {/* Header da Marca */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex items-center justify-center mb-6">
            <div className="p-3 rounded-2xl bg-slate-50 shadow-sm border border-slate-100">
              <img className="w-16 h-16 object-contain" src="./android-chrome-512x512.png" alt="Logo" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            <span className="text-blue-600">izzi</span>
            <span className="text-orange-500">Order</span>
          </h1>
          <p className="text-slate-500 text-sm">Painel Administrativo do Restaurante</p>
        </div>

        <Card className="border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-slate-800">Bem-vindo</CardTitle>
            <CardDescription>Acesse sua conta para gerenciar pedidos</CardDescription>
          </CardHeader>
          
          <CardContent>
            <form action={handleSubmit} className="space-y-5">
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium">E-mail</Label>
                <div className="relative group">
                  <Mail className={iconClasses} />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="exemplo@restaurante.com"
                    className={inputClasses}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-700 font-medium">Senha</Label>                
                  <Link href="/reset-password" title="Recuperar senha" className="text-xs text-blue-600 hover:underline font-medium">
                    Esqueceu a senha?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className={iconClasses} />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`${inputClasses} pr-10`}
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 rounded-xl transition-all active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Autenticando...
                  </>
                ) : (
                  "Entrar no Sistema"
                )}
              </Button>

            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400">
          © {new Date().getFullYear()} izziOrder - Gestão Inteligente
        </p>
      </div>
    </div>
  )
}