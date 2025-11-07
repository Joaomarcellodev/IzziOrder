"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/atoms/button"
import { Input } from "@/components/atoms/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/molecules/card"
import { Label } from "@/components/atoms/label"
import { Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement password reset logic
    console.log("Password reset requested for:", email)
    setIsSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo Section */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center mb-4">
            <img className="w-20 h-20" src="/android-chrome-512x512.png" alt="Logo principal" />
          </div>
          <div className="text-4xl font-bold text-gray-900">
            <span style={{ color: "#007BFF" }}>izzi</span>
            <span style={{ color: "#FD7E14" }}>Order</span>
          </div>
          <p className="text-muted-foreground mt-2">Recupere o acesso à sua conta.</p>
        </div>

        {/* Forgot Password Form */}
        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Esqueceu sua senha?</CardTitle>
            <CardDescription className="text-center">
              {isSubmitted
                ? "Verifique seu e-mail para instruções de recuperação."
                : "Insira seu e-mail e enviaremos um link para redefinir sua senha."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Insira seu e-mail"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  Enviar link de recuperação
                </Button>

                <div className="text-center">
                  <Link
                    href="/login"
                    className="text-sm text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar para o login
                  </Link>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Um e-mail foi enviado para <strong>{email}</strong> com instruções para redefinir sua senha.
                  </p>
                </div>

                <Button onClick={() => setIsSubmitted(false)} variant="outline" className="w-full">
                  Enviar novamente
                </Button>

                <div className="text-center">
                  <Link
                    href="/login"
                    className="text-sm text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar para o login
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
