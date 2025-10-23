"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Droplets, TrendingDown, TrendingUp, AlertTriangle, Zap, Wheat, Sprout, Leaf } from "lucide-react"

// --- Ícones simples em SVG p/ culturas que não existem no Lucide (milho/tomate) ---
const CornIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="M12 3c-2 0-3.5 1.5-3.5 3.5S10 10 12 10s3.5-1.5 3.5-3.5S14 3 12 3Z" fill="currentColor"/>
    <path d="M7 13c2.5-1.5 7.5-1.5 10 0 1 2.5-1 6-5 8-4-2-6-5.5-5-8Z" fill="currentColor" opacity=".6"/>
  </svg>
)
const TomatoIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <circle cx="12" cy="13" r="6.5" fill="currentColor"/>
    <path d="M12 6c-1.2-1.2-3-2-4.6-2 .9 1.8 2.6 3 4.6 3s3.7-1.2 4.6-3C15 4 13.2 4.8 12 6Z" fill="currentColor" opacity=".8"/>
  </svg>
)

// --- Mapa de estilos por cultura (nome em pt-BR minúsculo) ---
const cultureMeta = (name: string) => {
  const key = (name || "").toLowerCase().trim()
  const base = {
    from: "from-emerald-200/70",
    to: "to-sky-200/70",
    ring: "ring-emerald-300/40",
    icon: <Leaf className="h-5 w-5" />,
    iconWrap: "bg-white/80 text-emerald-700",
  }

  const map: Record<string, typeof base> = {
    "milho": {
      from: "from-yellow-200/80",
      to: "to-amber-200/80",
      ring: "ring-amber-300/50",
      icon: <CornIcon className="h-5 w-5" />,
      iconWrap: "bg-yellow-50 text-amber-600",
    },
    "soja": {
      from: "from-emerald-200/80",
      to: "to-lime-200/80",
      ring: "ring-emerald-300/50",
      icon: <Sprout className="h-5 w-5" />,
      iconWrap: "bg-emerald-50 text-emerald-700",
    },
    "trigo": {
      from: "from-amber-200/80",
      to: "to-yellow-200/80",
      ring: "ring-amber-300/50",
      icon: <Wheat className="h-5 w-5" />,
      iconWrap: "bg-amber-50 text-amber-700",
    },
    "tomate": {
      from: "from-rose-200/80",
      to: "to-red-200/80",
      ring: "ring-rose-300/50",
      icon: <TomatoIcon className="h-5 w-5" />,
      iconWrap: "bg-rose-50 text-rose-700",
    },
    "alface": {
      from: "from-green-200/80",
      to: "to-emerald-200/80",
      ring: "ring-green-300/50",
      icon: <Leaf className="h-5 w-5" />,
      iconWrap: "bg-green-50 text-green-700",
    },
  }

  return map[key] || base
}

export function ManagementOverview() {
  const [zones, setZones] = useState<IZone[]>([])
  const [cultures, setCultures] = useState<ICulture[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const garden_id = localStorage.getItem("garden_id")
      const [zonesResponse, culturesResponse] = await Promise.all([
        axios.get(`/api/zones?garden_id=${garden_id}`),
        axios.get("/api/cultures"),
      ])
      setZones(zonesResponse.data)
      setCultures(culturesResponse.data)
    } catch (err) {
      console.error("[v0] Error fetching data:", err)
      setError("Erro ao carregar dados")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Droplets className="h-12 w-12 text-emerald-500 animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Erro ao carregar dados. Verifique sua conexão.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPIs (mantidos, só estilo) */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Água Gasta Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12.450 L</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingDown className="h-3 w-3 text-emerald-600" />
              18% menos que ontem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Previsão 7 Dias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">82.300 L</div>
            <p className="text-xs text-muted-foreground mt-1">Baseado em clima e IA</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo de Água</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">450.000 L</div>
            <p className="text-xs text-muted-foreground mt-1">Suficiente para 38 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Economia Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">42%</div>
            <p className="text-xs text-muted-foreground mt-1">vs. irrigação tradicional</p>
          </CardContent>
        </Card>
      </div>

      {/* Insights (mantidos) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-sky-600" />
            Insights e Previsões da IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-sm">Campo C requer atenção</p>
              <p className="text-sm text-muted-foreground">
                Umidade do solo em 38%. Recomendamos irrigação de 2.500L nas próximas 3 horas. Sensor de temperatura
                registrando 31°C.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-sky-50 rounded-lg border border-sky-200">
            <Droplets className="h-5 w-5 text-sky-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-sm">Previsão de chuva para amanhã</p>
              <p className="text-sm text-muted-foreground">
                85% de chance de precipitação (15-20mm). Sistema reduzirá irrigação em 70% automaticamente. Economia
                estimada: 8.500L
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <TrendingUp className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-sm">Eficiência hídrica aumentou</p>
              <p className="text-sm text-muted-foreground">
                Campos A, B e E apresentaram redução de 22% no consumo de água esta semana mantendo produtividade ideal
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consumo por Zona (mantido) */}
      {/* ... seu bloco existente ... */}

      {/* === CULTURAS: cards coloridos com ícones === */}
      {cultures?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {cultures.map((culture) => {
            const meta = cultureMeta(culture.name)
            const hum =
              culture.optimal_conditions?.humidity_range
                ? `${culture.optimal_conditions.humidity_range[0]}–${culture.optimal_conditions.humidity_range[1]}%`
                : "Faixa não definida"
            const temp =
              culture.optimal_conditions?.temperature_range
                ? `${culture.optimal_conditions.temperature_range[0]}–${culture.optimal_conditions.temperature_range[1]}°C`
                : "Faixa não definida"

            return (
              <div key={culture._id} className={`rounded-2xl p-[1.5px] bg-gradient-to-br ${meta.from} ${meta.to}`}>
                <Card className={`rounded-2xl bg-white/80 backdrop-blur ring-1 ${meta.ring}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className={`h-8 w-8 rounded-full ${meta.iconWrap} grid place-items-center`}>
                            {meta.icon}
                          </div>
                          <h3 className="text-lg font-semibold">{culture.name}</h3>
                        </div>
                        <div className="mt-3 space-y-2 text-slate-600 text-sm">
                          <div>
                            <span className="font-medium">Umidade ideal:</span> {hum}
                          </div>
                          <div>
                            <span className="font-medium">Temperatura ideal:</span> {temp}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
