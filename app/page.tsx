"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Droplets } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = (type: "small" | "large") => {
    if (type === "small") {
      router.push("/small-producer")
    } else {
      router.push("/large-producer")
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
          <Tabs defaultValue="small" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="small">Pequeno Produtor</TabsTrigger>
              <TabsTrigger value="large">Grande Produtor</TabsTrigger>
            </TabsList>

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
              <Button className="w-full" onClick={() => handleLogin("small")}>
                Entrar como Pequeno Produtor
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
              <Button className="w-full" onClick={() => handleLogin("large")}>
                Entrar como Grande Produtor
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
