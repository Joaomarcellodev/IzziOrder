"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/atoms/button"
import { Input } from "@/components/atoms/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/molecules/card"
import { Label } from "@/components/atoms/label"
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implementar lógica de reset de senha
    console.log("Password reset requested for:", email)
    setIsSubmitted(true)
  }

  return (
    <div className="relative min-h-screen bg-background flex flex-col items-center justify-center p-4 overflow-hidden">
     <div className="absolute inset-0 z-0 bg-[#f8fafc]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-orange-400 opacity-10 blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Logo Section */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex items-center justify-center mb-4 drop-shadow-sm">
            <img 
              className="w-20 h-20 object-contain" 
              src="/android-chrome-512x512.png" 
              alt="Logo izziOrder" 
            />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            <span className="text-blue-600">izzi</span>
            <span className="text-orange-500">Order</span>
          </h1>
          <p className="text-muted-foreground">Recupere o acesso à sua conta.</p>
        </div>

        {/* Forgot Password Card */}
        <Card className="border-border shadow-2xl bg-card/50 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Esqueceu sua senha?</CardTitle>
            <CardDescription className="text-center">
              {isSubmitted
                ? "Instruções enviadas com sucesso."
                : "Insira seu e-mail e enviaremos um link para redefinir sua senha."}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="grid gap-4">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail de cadastro</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="exemplo@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-background/50"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 transition-all shadow-md">
                  Enviar link de recuperação
                </Button>
              </form>
            ) : (
              <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center">
                  <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400 mx-auto mb-3" />
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Um e-mail foi enviado para <span className="font-bold">{email}</span>. 
                    Verifique sua caixa de entrada.
                  </p>
                </div>

                <Button 
                  onClick={() => setIsSubmitted(false)} 
                  variant="outline" 
                  className="w-full"
                >
                  Tentar outro e-mail
                </Button>
              </div>
            )}

            <div className="mt-2 text-center">
              <Link
                href="/login"
                className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors inline-flex items-center gap-2 group"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Voltar para o login
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground px-8">
          izziOrder &copy; {new Date().getFullYear()} - Todos os direitos reservados.
        </p>
      </div>
    </div>
  )
}