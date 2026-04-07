"use client"

import { useState } from "react"
import { Button } from "@/components/atoms/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/molecules/card"
import { Input } from "@/components/atoms/input"
import { Label } from "@/components/atoms/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/molecules/dialog"
import { useToast } from "@/hooks/use-toast"
import { updatePassword, updateProfile } from "@/app/actions/user-actions"
import { KeyRound, User, Mail } from "lucide-react"

interface SettingsManagementProps {
  user: {
    name: string
    email: string
  }
}

export function SettingsManagement({ user }: SettingsManagementProps) {
  const { toast } = useToast()
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const hasChanges = 
    profileData.name !== user.name || 
    profileData.email !== user.email;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!hasChanges) return

    setLoading(true)
    
    try {
      const formData = new FormData()
      formData.append("name", profileData.name)
      formData.append("email", profileData.email)

      const result = await updateProfile(formData)
      setLoading(false)

      if (result.success) {
        if (result.emailChanged) {
          setProfileData(prev => ({ ...prev, email: user.email }));

          toast({
            title: "Confirmação enviada!",
            description: "Um e-mail de confirmação foi enviado para validar o novo endereço.",
            className: "bg-blue-600 text-white border-blue-700",
          })
        } else {
          toast({
            title: "Sucesso!",
            description: "Perfil atualizado com sucesso!",
            className: "bg-green-600 text-white border-green-700",
          })
        }
      } else {
        toast({
          title: "Erro ao atualizar perfil",
          description: result.error || "Ocorreu um erro inesperado.",
          className: "text-white",
        })
      }
    } catch (error: any) {
      setLoading(false)
      const message = error.message || "";
      const cleanMessage = message.includes("insecure") 
        ? "Erro de autenticação. Tente fazer login novamente." 
        : message;

      toast({
        variant: "destructive",
        title: "Erro ao atualizar perfil",
        description: cleanMessage || "Ocorreu um erro inesperado.",
        className: "text-white",
      })
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("currentPassword", passwordData.currentPassword)
      formData.append("newPassword", passwordData.newPassword)
      formData.append("confirmPassword", passwordData.confirmPassword)

      const result = await updatePassword(formData)
      setLoading(false)

      if (result.success) {
        toast({
          title: "Sucesso!",
          description: "Senha atualizada com sucesso!",
          className: "bg-green-600 text-white border-green-700",
        })
        setIsPasswordDialogOpen(false)
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      } else {
        toast({
          title: "Erro ao atualizar senha",
          description: result.error || "Ocorreu um erro inesperado.",
          className: "text-white",
        })
      }
    } catch (error: any) {
      setLoading(false)
      const message = error.message || "";
      const cleanMessage = message.includes("insecure") 
        ? "Erro de autenticação. Tente novamente." 
        : message;

      toast({
        title: "Erro ao atualizar senha",
        description: cleanMessage || "Ocorreu um erro inesperado.",
        className: "text-white", 
      })
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-6 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações do Perfil
          </CardTitle>
          <CardDescription>
            Mantenha seus dados de contato e identificação atualizados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="flex flex-col gap-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    className="pl-9"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    className="pl-9"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPasswordDialogOpen(true)}
                className="gap-2 border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 hover:text-orange-800 hover:border-orange-300 font-medium transition-all shadow-sm"
              >
                <KeyRound className="h-4 w-4" />
                Alterar Senha
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !hasChanges} 
                className={`shadow-md ${!hasChanges ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {loading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
            <DialogDescription>
              Para sua segurança, informe sua senha atual antes de cadastrar uma nova.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdatePassword} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Senha Atual</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsPasswordDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                {loading ? "Atualizando..." : "Atualizar Senha"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
