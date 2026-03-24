"use client"

import { useState } from "react"
import { Button } from "@/components/atoms/button"
import { Input } from "@/components/atoms/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/molecules/card"
import { Label } from "@/components/atoms/label"
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const inputClasses = "pl-10 bg-slate-50/50 border-slate-200 focus:bg-white transition-all"
  const iconClasses = "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    console.log("Password reset requested for:", email)
    setIsSubmitted(true)
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-[400px] space-y-8">
        
        <div className="text-center space-y-2">
          <div className="mx-auto flex items-center justify-center mb-6">
            <div className="p-3 rounded-2xl bg-slate-50 shadow-sm border border-slate-100">
              <img className="w-16 h-16 object-contain" src="/android-chrome-512x512.png" alt="Logo" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            <span className="text-blue-600">izzi</span>
            <span className="text-orange-500">Order</span>
          </h1>
          <p className="text-slate-500 text-sm">Recupere o acesso à sua conta</p>
        </div>

        <Card className="border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-slate-800">
              {isSubmitted ? "E-mail enviado!" : "Esqueceu sua senha?"}
            </CardTitle>
            <CardDescription>
              {isSubmitted
                ? "Instruções de recuperação enviadas com sucesso."
                : "Insira seu e-mail cadastrado para receber o link de redefinição."}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium">E-mail</Label>
                  <div className="relative group">
                    <Mail className={iconClasses} />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu-email@restaurante.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClasses}
                      disabled={isLoading}
                      required
                    />
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
                      Enviando...
                    </>
                  ) : (
                    "Enviar link de recuperação"
                  )}
                </Button>

                <div className="text-center pt-2">
                  <Link
                    href="/login"
                    className="text-sm text-slate-500 hover:text-blue-600 transition-colors inline-flex items-center gap-2 font-medium"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar para o login
                  </Link>
                </div>
              </form>
            ) : (
              <div className="space-y-6 text-center">
                <div className="flex flex-col items-center justify-center space-y-3 py-4">
                  <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Enviamos um link para <span className="font-semibold text-slate-800">{email}</span>. 
                    Por favor, verifique sua caixa de entrada e a pasta de spam.
                  </p>
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={() => setIsSubmitted(false)} 
                    variant="outline" 
                    className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl"
                  >
                    Tentar outro e-mail
                  </Button>

                  <Link
                    href="/login"
                    className="w-full flex items-center justify-center text-sm font-medium text-blue-600 hover:underline"
                  >
                    Ir para o login
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400">
          © {new Date().getFullYear()} izziOrder - Suporte ao Restaurante
        </p>
      </div>
    </div>
  )
}