"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Droplets } from "lucide-react"
import { useRouter } from "next/navigation"
import axios from "axios"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    try {
      // Envia a requisição para a API de login
      const response = await axios.post("/api/auth/login", { email, password })
      const { token, userId, profile_type } = response.data // Desestruturando a resposta

      // Armazena o token JWT no localStorage
      localStorage.setItem('auth_token', token)
      localStorage.setItem('user_id', userId)

      // Redireciona com base no profile_type
      if (profile_type === "large") {
        router.push("/large-producer") // Se for grande produtor
      } else {
        router.push("/small-producer") // Se for pequeno produtor
      }

    } catch (error) {
      console.error("Error during login:", error)
      setError("Email ou senha inválidos.")
    }
  }

  return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Droplets className="h-8 w-8 text-primary" />
              <span className="text-3xl font-bold">AgroFlux</span>
            </div>
            <CardTitle>Bem-vindo</CardTitle>
            <CardDescription>Faça login para acessar sua conta</CardDescription>
          </CardHeader>
          <CardContent>
            {error && <div className="text-red-600 mb-4">{error}</div>} {/* Exibe erro se houver */}
            <Tabs defaultValue="small" className="w-full">

              <TabsContent value="small" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="email-small">Email</Label>
                  <Input
                      id="email-small"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-small">Senha</Label>
                  <Input
                      id="password-small"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button className="w-full" onClick={handleLogin}>
                  Entrar
                </Button>
              </TabsContent>

              <TabsContent value="large" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="email-large">Email</Label>
                  <Input
                      id="email-large"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-large">Senha</Label>
                  <Input
                      id="password-large"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button className="w-full" onClick={handleLogin}>
                  Entrar
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
  )
}
