"use client"

import { useState } from "react"
import { Button } from "@/components/atoms/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/molecules/card"
import { Input } from "@/components/atoms/input"
import { Label } from "@/components/atoms/label"
import { Badge } from "@/components/atoms/badge"
import { Avatar, AvatarFallback } from "@/components/atoms/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/organisms/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/molecules/dialog"
import { Checkbox } from "@/components/atoms/checkbox"
import { Search, Plus, MoreVertical, Trash2, Edit } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/molecules/dropdown-menu"
import { Toaster, toast } from "sonner"

type Permission = {
  id: string
  label: string
  description: string
}

type User = {
  id: string
  name: string
  email: string
  role: string
  permissions: string[]
  createdAt: string
}

const ROLES = [
  { value: "admin", label: "Administrador" },
  { value: "manager", label: "Gerente" },
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Visualizador" },
]

const PERMISSIONS: Permission[] = [
  { id: "read", label: "Leitura", description: "Visualizar conteúdo e dados" },
  { id: "write", label: "Escrita", description: "Criar e editar conteúdo" },
  { id: "delete", label: "Exclusão", description: "Remover conteúdo e dados" },
  { id: "manage_users", label: "Gerenciar Usuários", description: "Adicionar e remover usuários" },
  { id: "manage_settings", label: "Gerenciar Configurações", description: "Alterar configurações do sistema" },
  { id: "view_analytics", label: "Ver Análises", description: "Acessar relatórios e análises" },
]

// 🔧 Permissões padrão por cargo
const ROLE_DEFAULT_PERMISSIONS: Record<string, string[]> = {
  admin: PERMISSIONS.map((p) => p.id),
  manager: ["read", "write", "view_analytics", "manage_users"],
  editor: ["read", "write"],
  viewer: ["read", "view_analytics"],
}

export function SettingsManagement() {
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "João Silva",
      email: "joao@exemplo.com",
      role: "admin",
      permissions: ["read", "write", "delete", "manage_users", "manage_settings", "view_analytics"],
      createdAt: "2025-01-15",
    },
    {
      id: "2",
      name: "Maria Santos",
      email: "maria@exemplo.com",
      role: "manager",
      permissions: ["read", "write", "view_analytics"],
      createdAt: "2025-02-20",
    },
  ])

  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "viewer",
    permissions: ROLE_DEFAULT_PERMISSIONS["viewer"],
  })

  const handleCreateUser = () => {
    if (!formData.name || !formData.email) {
      toast.error("Por favor, preencha todos os campos.")
      return
    }

    const newUser: User = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      permissions: formData.permissions,
      createdAt: new Date().toISOString().split("T")[0],
    }

    setUsers([...users, newUser])
    setIsDialogOpen(false)
    resetForm()
    toast.success("Usuário criado com sucesso!")
  }

  const handleUpdateUser = () => {
    if (!editingUser) return

    setUsers(
      users.map((u) =>
        u.id === editingUser.id
          ? { ...u, ...formData }
          : u,
      ),
    )

    setEditingUser(null)
    resetForm()
    setIsDialogOpen(false)
    toast.success("Usuário atualizado com sucesso!")
  }

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter((u) => u.id !== id))
    toast.success("Usuário excluído com sucesso!")
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "viewer",
      permissions: ROLE_DEFAULT_PERMISSIONS["viewer"],
    })
  }

  const openEditDialog = (user: User) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    })
    setIsDialogOpen(true)
  }

  const togglePermission = (permissionId: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((p) => p !== permissionId)
        : [...prev.permissions, permissionId],
    }))
  }

  const handleRoleChange = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      role,
      permissions: ROLE_DEFAULT_PERMISSIONS[role] || [],
    }))
    toast.info("Permissões ajustadas para o cargo selecionado.")
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "manager":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "editor":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getPermissionLabel = (id: string) => {
    const permission = PERMISSIONS.find((p) => p.id === id)
    return permission ? permission.label : id
  }

  return (
    <>
      <Toaster position="top-right" richColors />

      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuário..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              className="gap-2  bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                resetForm()
                setEditingUser(null)
                setIsDialogOpen(true)
              }}
            >
              <Plus className="h-4 w-4" />
              Novo Usuário
            </Button>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingUser ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
                <DialogDescription>
                  {editingUser
                    ? "Atualize as informações do usuário."
                    : "Preencha os dados para adicionar um novo usuário."}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cargo</Label>
                  <Select value={formData.role} onValueChange={handleRoleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Permissões</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {PERMISSIONS.map((p) => (
                      <div key={p.id} className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData.permissions.includes(p.id)}
                          onCheckedChange={() => togglePermission(p.id)}
                        />
                        <span>{p.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button className=" bg-blue-600 hover:bg-blue-700" onClick={editingUser ? handleUpdateUser : handleCreateUser}>
                  {editingUser ? "Salvar Alterações" : "Criar Usuário"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredUsers.map((user) => (
              <Card key={user.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{user.name}</CardTitle>
                      <CardDescription>{user.email}</CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => openEditDialog(user)}>
                        <Edit className="mr-2 h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteUser(user.id)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {ROLES.find((r) => r.value === user.role)?.label || user.role}
                  </Badge>
                  <div className="mt-2 text-sm text-muted-foreground">
                    <strong>Permissões:</strong> {user.permissions.map(getPermissionLabel).join(", ")}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
