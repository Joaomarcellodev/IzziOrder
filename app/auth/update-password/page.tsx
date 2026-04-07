"use client"

import { useState, useTransition, useMemo } from "react"
import { Button } from "@/components/atoms/button"
import { Input } from "@/components/atoms/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/molecules/card"
import { Label } from "@/components/atoms/label"
import { Lock, Eye, EyeOff, Loader2, Check, Circle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AuthLayout } from "@/components/templates/auth-layout"
import { AuthHeader } from "@/components/molecules/auth-header"
import { updatePassword } from "@/app/actions/auth-actions"

export default function UpdatePasswordPage() {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [passwordValue, setPasswordValue] = useState("")

  const passwordRequirements = useMemo(() => ({
    hasMinLength: passwordValue.length >= 8,
    hasUppercase: /[A-Z]/.test(passwordValue),
  }), [passwordValue])

  const isPasswordValid = passwordRequirements.hasMinLength && passwordRequirements.hasUppercase

  async function onFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    
    const formData = new FormData(event.currentTarget)
    const password = formData.get("password") as string
    const confirmation = formData.get("password_confirmation") as string

    if (!isPasswordValid) {
      toast({
        title: "Senha fraca",
        description: "Siga os requisitos de segurança antes de prosseguir.",
      })
      return
    }

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
        const result = await updatePassword(formData)
        
        if (result?.error) {
          toast({
            variant: "destructive",
            title: "Erro ao atualizar",
            description: result.error,
          })
        }
      } catch (error: any) {
        if (error.message === 'NEXT_REDIRECT' || error.digest?.includes('NEXT_REDIRECT')) return

        toast({
          variant: "destructive",
          title: "Erro inesperado",
          description: "Ocorreu um erro ao tentar salvar sua nova senha.",
        })
      }
    })
  }

  return (
    <AuthLayout>
      <AuthHeader subtitle="Defina sua nova credencial de acesso" />

      <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="pt-8 flex flex-col items-center">
          <CardTitle className="text-2xl font-bold text-gray-800">Nova Senha</CardTitle>
          <CardDescription className="text-center">
            Escolha uma senha forte que você não utilize em outros sites.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-8 pb-8">
          <form onSubmit={onFormSubmit} className="space-y-4">
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Nova Senha</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  value={passwordValue}
                  onChange={(e) => setPasswordValue(e.target.value)}
                  className="pl-10 pr-10 h-11 border-gray-200 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  required
                  disabled={isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <RequirementItem 
                  label="8+ caracteres" 
                  met={passwordRequirements.hasMinLength} 
                />
                <RequirementItem 
                  label="Uma letra maiúscula" 
                  met={passwordRequirements.hasUppercase} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_confirmation" className="text-sm font-semibold text-gray-700">Confirmar Nova Senha</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  id="password_confirmation"
                  name="password_confirmation"
                  type={showPassword ? "text" : "password"}
                  placeholder="Repita a nova senha"
                  className="pl-10 h-11 border-gray-200 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  required
                  disabled={isPending}
                />
              </div>
            </div>

            <Button 
              disabled={isPending || !isPasswordValid}
              type="submit" 
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] mt-2"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Atualizando...
                </span>
              ) : "Redefinir Senha"}
            </Button>

          </form>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground px-8 mt-8">
        izziOrder &copy; {new Date().getFullYear()} - Todos os direitos reservados.
      </p>
    </AuthLayout>
  )
}

function RequirementItem({ label, met }: { label: string; met: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors ${met ? 'text-green-600' : 'text-gray-400'}`}>
      {met ? <Check className="h-3 w-3" /> : <Circle className="h-3 w-3 fill-gray-100" />}
      {label}
    </div>
  )
}