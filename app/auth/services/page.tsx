"use client"


import { AppShell } from "@/components/organisms/app-shell";
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
  DialogTrigger,
} from "@/components/molecules/dialog"
import { Checkbox } from "@/components/atoms/checkbox"
import { Search, Plus, MoreVertical, Trash2, Edit } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/molecules/dropdown-menu"

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

export default function SettingsPage() {
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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "viewer",
    permissions: [] as string[],
  })

  const handleCreateUser = () => {
    const newUser: User = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      permissions: formData.permissions,
      createdAt: new Date().toISOString().split("T")[0],
    }
    setUsers([...users, newUser])
    setIsCreateDialogOpen(false)
    resetForm()
  }

  const handleUpdateUser = () => {
    if (!editingUser) return
    setUsers(
      users.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              name: formData.name,
              email: formData.email,
              role: formData.role,
              permissions: formData.permissions,
            }
          : u,
      ),
    )
    setEditingUser(null)
    resetForm()
  }

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter((u) => u.id !== id))
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "viewer",
      permissions: [],
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
  }

  const togglePermission = (permissionId: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((p) => p !== permissionId)
        : [...prev.permissions, permissionId],
    }))
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

  return (
    <AppShell
      currentPage="Configurações de Usuários"
      breadcrumb="Painel > Configurações"
    >
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground">Configurações de Usuários</h1>
          <p className="mt-2 text-muted-foreground">Gerencie usuários, cargos e permissões da sua plataforma</p>
        </div>

        <Card className="border-border">
          <CardHeader className="border-b border-border">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Usuários</CardTitle>
                <CardDescription>
                  {users.length} {users.length === 1 ? "usuário cadastrado" : "usuários cadastrados"}
                </CardDescription>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar usuários..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full sm:w-[250px]"
                  />
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetForm} className="bg-blue-500">
                      <Plus className="mr-2 h-4 w-4" />
                      Criar Usuário
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Criar Novo Usuário</DialogTitle>
                      <DialogDescription>Adicione um novo usuário e configure suas permissões</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input
                          id="name"
                          placeholder="Digite o nome do usuário"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="usuario@exemplo.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Cargo</Label>
                        <Select
                          value={formData.role}
                          onValueChange={(value) => setFormData({ ...formData, role: value })}
                        >
                          <SelectTrigger id="role">
                            <SelectValue placeholder="Selecione um cargo" />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLES.map((role) => (
                              <SelectItem key={role.value} value={role.value}>
                                {role.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-3">
                        <Label>Permissões</Label>
                        <div className="space-y-3 rounded-lg border border-border p-4">
                          {PERMISSIONS.map((permission) => (
                            <div key={permission.id} className="flex items-start space-x-3">
                              <Checkbox
                                id={permission.id}
                                checked={formData.permissions.includes(permission.id)}
                                onCheckedChange={() => togglePermission(permission.id)}
                              />
                              <div className="flex-1">
                                <label
                                  htmlFor={permission.id}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                  {permission.label}
                                </label>
                                <p className="text-sm text-muted-foreground mt-1">{permission.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button className="bg-blue-500 hover:bg-blue-600" onClick={handleCreateUser}>Criar Usuário</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {filteredUsers.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">Nenhum usuário encontrado</p>
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-foreground">{user.name}</p>
                          <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                            {ROLES.find((r) => r.value === user.role)?.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {user.permissions.slice(0, 3).map((permId) => {
                            const perm = PERMISSIONS.find((p) => p.id === permId)
                            return perm ? (
                              <Badge key={permId} variant="secondary" className="text-xs">
                                {perm.label}
                              </Badge>
                            ) : null
                          })}
                          {user.permissions.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{user.permissions.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Dialog open={editingUser?.id === user.id} onOpenChange={(open) => !open && setEditingUser(null)}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DialogTrigger asChild>
                            <DropdownMenuItem onClick={() => openEditDialog(user)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                          </DialogTrigger>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Editar Usuário</DialogTitle>
                          <DialogDescription>Atualize as informações e permissões do usuário</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-name">Nome Completo</Label>
                            <Input
                              id="edit-name"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-email">Email</Label>
                            <Input
                              id="edit-email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-role">Cargo</Label>
                            <Select
                              value={formData.role}
                              onValueChange={(value) => setFormData({ ...formData, role: value })}
                            >
                              <SelectTrigger id="edit-role">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {ROLES.map((role) => (
                                  <SelectItem key={role.value} value={role.value}>
                                    {role.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-3">
                            <Label>Permissões</Label>
                            <div className="space-y-3 rounded-lg border border-border p-4">
                              {PERMISSIONS.map((permission) => (
                                <div key={permission.id} className="flex items-start space-x-3">
                                  <Checkbox 
                                    id={`edit-${permission.id}`}
                                    checked={formData.permissions.includes(permission.id)}
                                    onCheckedChange={() => togglePermission(permission.id)}
                                  />
                                  <div className="flex-1">
                                    <label
                                      htmlFor={`edit-${permission.id}`}
                                      className="text-sm font-medium leading-none cursor-pointer"
                                    >
                                      {permission.label}
                                    </label>
                                    <p className="text-sm text-muted-foreground mt-1">{permission.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setEditingUser(null)}>
                            Cancelar
                          </Button>
                          <Button className="bg-blue-500 hover:bg-blue-600" onClick={handleUpdateUser}>Salvar Alterações</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </AppShell>
    
  )
}
