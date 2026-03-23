"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/atoms/button"
import { Input } from "@/components/atoms/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/molecules/card"
import { Label } from "@/components/atoms/label"
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react"
import Link from "next/link"
import { signup } from "../actions/auth-actions"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const { toast } = useToast();
  const [userName, setUserName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo Section */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center mb-4">
            <img className="w-20 h-20" src="./android-chrome-512x512.png" alt="Logo principal" />
          </div>
          <div className="text-4xl font-bold text-gray-900">
            <span style={{ color: "#007BFF" }}>izzi</span>
            <span style={{ color: "#FD7E14" }}>Order</span>
          </div>
          <p className="text-muted-foreground mt-2">Registre-se na plataforma de controle do seu restaurante.</p>
        </div>

        {/* Login Form */}
        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Bem vindo!</CardTitle>
            <CardDescription className="text-center">Insira seus dados para criar sua conta.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={async (formData: FormData) => {
              try {
                await signup(formData)
              } catch (error: any) {
                if (error?.digest?.includes("NEXT_REDIRECT")) {
                  throw error
                }

                toast({ title: error.message })
              }
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Nome de Usuário</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="user_name"
                    name="user_name"
                    type="user_name"
                    placeholder="Insira seu nome de usuário"
                    className="pl-10 "
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Insira seu e-mail"
                    className="pl-10 "
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Insira sua senha"
                    className="pl-10 pr-10"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Repita sua senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password_confirmation"
                    name="password_confirmation"
                    type="password"
                    placeholder="Insira sua senha"
                    className="pl-10 pr-10"
                    required
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Link href="/login" className="text-sm text-primary hover:text-primary/80 transition-colors">
                  Já possui uma conta?
                </Link>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                Criar Conta
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
