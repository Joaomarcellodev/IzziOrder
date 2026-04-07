"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/atoms/button"
import { Input } from "@/components/atoms/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/molecules/card"
import { Label } from "@/components/atoms/label"
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react"
import Link from "next/link"
import { AuthLayout } from "@/components/templates/auth-layout"
import { AuthHeader } from "@/components/molecules/auth-header"
import { resetPassword } from "../actions/auth-actions" 
import { useToast } from "@/hooks/use-toast"

export default function ForgotPasswordPage() {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        const result = await resetPassword(formData)

        if (result?.success) {
          setIsSubmitted(true)
          toast({
            title: "E-mail enviado!",
            description: "Verifique sua caixa de entrada para redefinir a senha.",
          })
        } else {
          toast({
            title: "Erro ao solicitar recuperação",
            description: result?.error || "Verifique se o e-mail está correto.",
          })
        }
      } catch (error: any) {
        toast({
          title: "Erro no servidor",
          description: "Não foi possível conectar ao serviço de autenticação.",
        })
      }
    })
  }

  return (
    <AuthLayout>
      <AuthHeader subtitle="Recupere o acesso à sua conta." />

      <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center font-bold text-gray-800">
            Esqueceu sua senha?
          </CardTitle>
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
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                  E-mail de cadastro
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    id="email"
                    name="email" 
                    type="email"
                    placeholder="exemplo@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 border-gray-200 focus:ring-2 focus:ring-blue-500/20 transition-all bg-background/50"
                    required
                    disabled={isPending}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isPending}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98]"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Enviando...
                  </span>
                ) : (
                  "Enviar link de recuperação"
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-6 animate-in fade-in zoom-in duration-300">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center">
                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400 mx-auto mb-3" />
                <p className="text-sm text-green-800 dark:text-green-200">
                  Um e-mail foi enviado para <span className="font-bold">{email}</span>. 
                  Verifique sua caixa de entrada e siga as instruções.
                </p>
              </div>

              <Button 
                onClick={() => setIsSubmitted(false)} 
                variant="outline" 
                className="w-full h-11 transition-all"
              >
                Tentar outro e-mail
              </Button>
            </div>
          )}

          <div className="mt-2 text-center">
            <Link
              href="/login"
              className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-2 group"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Voltar para o login
            </Link>
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground px-8 mt-8">
        izziOrder &copy; {new Date().getFullYear()} - Todos os direitos reservados.
      </p>
    </AuthLayout>
  )
}