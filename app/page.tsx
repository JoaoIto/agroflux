"use client"

import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, User2 } from "lucide-react"

// Imagens (ajuste caminho se estiverem em /public/img)
import logoAgro from "@/app/img/Logo Agroflux - Hackaton.png"
import bgLogin from "@/app/img/background-login.png"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // === mesma lógica do João Victor ===
  const handleLogin = async () => {
    try {
      setLoading(true)
      setError(null)

      // Se sua API não está no mesmo host, use baseURL:
      // const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, { email, password }, { withCredentials: true })
      const response = await axios.post("/api/auth/login", { email, password })

      const { token, userId, profile_type } = response.data

      localStorage.setItem("auth_token", token)
      localStorage.setItem("user_id", userId)

      if (profile_type === "large") {
        router.push("/large-producer")
      } else {
        router.push("/small-producer")
      }
    } catch (err: any) {
      // Mostra mensagem vinda da API se existir; senão mostra padrão
      const apiMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Email ou senha inválidos."
      setError(apiMsg)
      console.error("Error during login:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-[100svh] w-full flex flex-col items-center justify-center px-4 relative"
      style={{
        backgroundImage: `url(${bgLogin.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* overlay/gradiente */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#7D8453]/25 via-[#C06C50]/10 to-black/60" />

      {/* Card central */}
      <Card className="relative w-full max-w-md rounded-3xl border-white/20 bg-white/15 backdrop-blur-md shadow-2xl">
        <CardHeader className="pt-8 pb-4 text-center">
          <div className="flex w-full justify-center">
            <Image src={logoAgro} alt="AgroFlux" priority className="h-10 w-auto" />
          </div>
          <p className="mt-3 text-sm text-white/80">
            Bem-vindo de volta — acesse sua conta
          </p>
        </CardHeader>

        <CardContent className="pb-8 px-8">
          {/* erro */}
          {error && (
            <div className="mb-4 rounded-md bg-red-500/15 border border-red-500/30 px-3 py-2 text-sm text-red-100">
              {error}
            </div>
          )}

          {/* campos (sem <form> e sem submit; botão chama handleLogin) */}
          <div className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <div className="relative">
                <User2 className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="pl-10 bg-white/80 focus:bg-white border-white/40 placeholder:text-black/40"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pr-10 bg-white/80 focus:bg-white border-white/40 placeholder:text-black/40"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-black/70"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Lembrar-me / Esqueci */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={remember}
                  onCheckedChange={(v) => setRemember(Boolean(v))}
                />
                <span className="text-sm text-white/90">Lembrar-me</span>
              </label>

              <a
                href="/reset-password"
                className="text-sm underline underline-offset-4 text-white/90 hover:text-white"
              >
                Esqueci minha senha
              </a>
            </div>

            {/* Entrar (mesmas cores que você escolheu) */}
            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full h-12 text-base font-semibold rounded-xl shadow-lg bg-gradient-to-r from-[#0290d3] to-[#5cac4c] hover:opacity-95 transition"
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>

            {/* Criar conta */}
            <p className="text-center text-sm text-white/90">
              Não tem uma conta?{" "}
              <a href="/signup" className="font-semibold underline underline-offset-4 hover:text-white">
                Criar conta
              </a>
            </p>

            {/* Rodapé */}
            <p className="mt-2 text-center text-[11px] text-white/70">
              Irrigação inteligente e uso eficiente da água
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
