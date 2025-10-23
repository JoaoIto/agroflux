"use client"

import type React from "react"

import { useState, useEffect, useMemo, useRef } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Droplets,
  TrendingDown,
  AlertTriangle,
  Plus,
  LogOut,
  Cloud,
  Wind,
  Thermometer,
  Home,
  CalendarRange,
  Brain,
  Sun,
  MapPin,
  Sprout,
  MessageCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { CropForm } from "./crop-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { getWeatherData, getWeatherDescription, type WeatherData } from "@/lib/weather-api"
import { IGarden } from "@/models/IGarden"

type IrrigationPlan = {
  kc: number
  eto: number
  base: {
    hoje: { mm: number; liters: number }
    dias7: { mm: number; liters: number }
    dias30: { mm: number; liters: number }
    meses6: { mm: number; liters: number }
  }
  recomendacao: string
}

export function SmallProducerDashboard() {
  const router = useRouter()
  const [selectedGarden, setSelectedGarden] = useState<string>("")
  const [showAddGarden, setShowAddGarden] = useState(false)
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [gardens, setGardens] = useState<IGarden[]>([])
  const [gardensError, setGardensError] = useState<string | null>(null)

  const [irrigationPlan, setIrrigationPlan] = useState<IrrigationPlan | null>(null)
  const [loadingIrrigation, setLoadingIrrigation] = useState(false)

  const refOverview = useRef<HTMLDivElement | null>(null)
  const refGardenInfo = useRef<HTMLDivElement | null>(null)
  const refWeather = useRef<HTMLDivElement | null>(null)
  const refInsights = useRef<HTMLDivElement | null>(null)
  const refSchedule = useRef<HTMLDivElement | null>(null)

  const [showWhatsAppCard, setShowWhatsAppCard] = useState(false)

  const fetchGardens = async () => {
    try {
      setGardensError(null)
      const userId = localStorage.getItem("user_id")
      if (!userId) throw new Error("User ID not found in localStorage")
      const response = await axios.get(`/api/gardens?user_id=${userId}`)
      setGardens(response.data)
      if (response.data.length > 0) localStorage.setItem("garden_id", response.data[0]._id)
    } catch (error) {
      console.error("[v0] Error fetching gardens:", error)
      setGardensError("Erro ao carregar hortas")
    }
  }

  useEffect(() => {
    fetchGardens()
  }, [])

  useEffect(() => {
    if (gardens && gardens.length > 0 && !selectedGarden) setSelectedGarden(gardens[0]._id)
  }, [gardens, selectedGarden])

  const currentGarden = useMemo(() => gardens?.find((g) => g._id === selectedGarden), [gardens, selectedGarden])

  useEffect(() => {
    if (!currentGarden) return

    const garden = currentGarden
    let cancelled = false

    async function fetchWeather(g: typeof garden) {
      setLoading(true)
      const weather = await getWeatherData(g.location.latitude, g.location.longitude)
      if (!cancelled) {
        setWeatherData(weather)
        setLoading(false)
      }
    }

    fetchWeather(garden)
  }, [currentGarden])

  useEffect(() => {
    if (!weatherData || !currentGarden) return

    const fetchIrrigationPlan = async () => {
      setLoadingIrrigation(true)
      try {
        const now = new Date()
        const start = new Date(now.getFullYear(), 0, 0)
        const diff = now.getTime() - start.getTime()
        const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))

        const response = await axios.post("/api/ai/irrigacao", {
          kc: currentGarden.kc || 1.15,
          tmax: weatherData.temperatureMax,
          tmin: weatherData.temperatureMin,
          rh: weatherData.humidity,
          u2: weatherData.windSpeed / 3.6,
          Rs: 20,
          latitude: currentGarden.location.latitude,
          longitude: currentGarden.location.longitude,
          altitude: 800,
          area_m2: currentGarden.area,
          dayOfYear,
        })

        setIrrigationPlan(response.data)
      } catch (error) {
        console.error("[v0] Erro ao buscar plano de irrigação:", error)
      } finally {
        setLoadingIrrigation(false)
      }
    }

    fetchIrrigationPlan()
  }, [weatherData, currentGarden])

  const goTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const getCropEmoji = (cropType: string) => {
    const cropMap: Record<string, string> = {
      tomato: "🍅",
      lettuce: "🥬",
      carrot: "🥕",
      corn: "🌽",
      beans: "🫘",
      potato: "🥔",
      other: "🌱",
    }
    return cropMap[cropType] || "🌱"
  }

  const handleWhatsAppClick = () => {
    if (!currentGarden || !irrigationPlan) return

    const message = `🌱 *AgroFlux - Consulta de Irrigação*

📍 *Horta:* ${currentGarden.name}
🌾 *Cultura:* ${currentGarden.cropType}
📏 *Área:* ${currentGarden.area} m²
📊 *Kc:* ${currentGarden.kc}

💧 *Plano de Irrigação Atual:*
• Hoje: ${Math.round(irrigationPlan.base.hoje.liters)} L
• 7 dias: ${Math.round(irrigationPlan.base.dias7.liters)} L
• 30 dias: ${Math.round(irrigationPlan.base.dias30.liters)} L

🤖 Gostaria de receber recomendações personalizadas de irrigação com base nos meus dados!`

    const encodedMessage = encodeURIComponent(message)
    setShowWhatsAppCard(false)
    window.open(`https://wa.me/5563984142982?text=${encodedMessage}`, "_blank")
  }

  if (!gardens.length && !gardensError) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="text-center max-w-sm w-full">
            <Droplets className="h-12 w-12 text-emerald-500 animate-pulse mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando hortas...</p>
          </div>
        </div>
    )
  }
  if (gardensError) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="text-center max-w-sm w-full">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-muted-foreground">Erro ao carregar hortas. Verifique sua conexão.</p>
          </div>
        </div>
    )
  }
  if (gardens && gardens.length === 0) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="text-center max-w-sm w-full">
            <Droplets className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Você ainda não tem hortas cadastradas</p>
            <Dialog open={showAddGarden} onOpenChange={setShowAddGarden}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeira Horta
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Nova Horta</DialogTitle>
                </DialogHeader>
                <CropForm
                    onSuccess={() => {
                      setShowAddGarden(false)
                      fetchGardens()
                    }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
    )
  }
  if (loading) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="text-center max-w-sm w-full">
            <Droplets className="h-12 w-12 text-emerald-500 animate-pulse mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando dados climáticos...</p>
          </div>
        </div>
    )
  }

  return (
      <div className="min-h-screen bg-[linear-gradient(180deg,rgba(16,185,129,0.06),rgba(14,165,233,0.06))]">
        <header className="sticky top-0 z-30 border-b bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/50">
          <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500" />
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 flex items-center justify-center ring-2 ring-emerald-400/40">
                  <Droplets className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg sm:text-xl font-semibold tracking-tight">AgroFlux</span>
              </div>

              {/* ações desktop */}
              <div className="hidden sm:flex items-center gap-2">
                <Select value={selectedGarden} onValueChange={setSelectedGarden}>
                  <SelectTrigger className="w-[220px] rounded-xl bg-white/60 backdrop-blur hover:bg-white/80">
                    <SelectValue placeholder="Selecione a horta" />
                  </SelectTrigger>
                  <SelectContent>
                    {gardens?.map((g) => (
                        <SelectItem key={g._id} value={g._id}>
                          {g.name}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Dialog open={showAddGarden} onOpenChange={setShowAddGarden}>
                  <DialogTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-xl border-emerald-300/60 hover:bg-emerald-50 bg-transparent"
                    >
                      <Plus className="h-4 w-4 text-emerald-600" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Nova Horta</DialogTitle>
                    </DialogHeader>
                    <CropForm
                        onSuccess={() => {
                          setShowAddGarden(false)
                          fetchGardens()
                        }}
                    />
                  </DialogContent>
                </Dialog>
                <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="rounded-xl">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* ações mobile */}
            <div className="mt-3 grid grid-cols-[1fr_auto_auto] items-center gap-2 sm:hidden">
              <Select value={selectedGarden} onValueChange={setSelectedGarden}>
                <SelectTrigger className="w-full rounded-xl bg-white/70 backdrop-blur">
                  <SelectValue placeholder="Selecione a horta" />
                </SelectTrigger>
                <SelectContent>
                  {gardens?.map((g) => (
                      <SelectItem key={g._id} value={g._id}>
                        {g.name}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Dialog open={showAddGarden} onOpenChange={setShowAddGarden}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-xl border-emerald-300/60 bg-transparent">
                    <Plus className="h-4 w-4 text-emerald-600" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Nova Horta</DialogTitle>
                  </DialogHeader>
                  <CropForm
                      onSuccess={() => {
                        setShowAddGarden(false)
                        fetchGardens()
                      }}
                  />
                </DialogContent>
              </Dialog>
              <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="rounded-xl">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        <div
            className="container mx-auto px-4 pt-5 space-y-6"
            style={{ paddingBottom: "calc(88px + env(safe-area-inset-bottom))" }}
        >
          <section ref={refOverview} className="scroll-mt-24">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {[
                {
                  title: "Água Gasta Hoje",
                  value: irrigationPlan ? `${Math.round(irrigationPlan.base.hoje.liters)} L` : "...",
                  sub: (
                      <>
                        <TrendingDown className="h-3 w-3 text-emerald-600" />
                        <span>Baseado em IA</span>
                      </>
                  ),
                },
                {
                  title: "Previsão para 7 dias",
                  value: irrigationPlan ? `${Math.round(irrigationPlan.base.dias7.liters)} L` : "...",
                  sub: "Com base no clima e na IA",
                },
                {
                  title: "Previsão 30 dias",
                  value: irrigationPlan ? `${Math.round(irrigationPlan.base.dias30.liters)} L` : "...",
                  sub: irrigationPlan ? `${(irrigationPlan.base.dias30.mm / 30).toFixed(1)} mm/dia` : "Calculando...",
                },
                {
                  title: "ETo × Kc",
                  value: irrigationPlan ? (
                      <span className="text-emerald-600">{irrigationPlan.eto.toFixed(2)} mm</span>
                  ) : (
                      "..."
                  ),
                  sub: irrigationPlan ? `Kc = ${irrigationPlan.kc}` : "Calculando...",
                },
              ].map((kpi, i) => (
                  <div
                      key={i}
                      className="bg-gradient-to-br from-emerald-200/70 via-teal-200/50 to-sky-200/70 p-[1.5px] rounded-2xl"
                  >
                    <Card className="rounded-2xl shadow-sm bg-white/80 backdrop-blur">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-700">{kpi.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-extrabold tracking-tight">{kpi.value}</div>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">{kpi.sub}</p>
                      </CardContent>
                    </Card>
                  </div>
              ))}
            </div>
          </section>

          {currentGarden && (
              <section ref={refGardenInfo} className="scroll-mt-24">
                <div className="bg-gradient-to-r from-lime-500/10 to-emerald-500/10 rounded-2xl p-0.5">
                  <Card className="rounded-2xl bg-white/80 backdrop-blur">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2">
                        <Sprout className="h-5 w-5 text-lime-600" />
                        <span className="bg-gradient-to-r from-lime-600 to-emerald-600 bg-clip-text text-transparent font-semibold">
                      Informações da Horta
                    </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Garden details */}
                        <div className="space-y-3">
                          <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-br from-lime-50 to-emerald-50 border">
                            <div className="text-4xl">{getCropEmoji(currentGarden.cropType)}</div>
                            <div className="flex-1">
                              <div className="text-sm text-slate-600 mb-1">Nome da Horta</div>
                              <div className="font-semibold text-lg">{currentGarden.name}</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border">
                              <div className="text-xs text-slate-600 mb-1">Cultura</div>
                              <div className="font-semibold capitalize">{currentGarden.cropType}</div>
                            </div>
                            <div className="p-3 rounded-xl bg-gradient-to-br from-sky-50 to-cyan-50 border">
                              <div className="text-xs text-slate-600 mb-1">Coef. Kc</div>
                              <div className="font-semibold">{currentGarden.kc}</div>
                            </div>
                            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border">
                              <div className="text-xs text-slate-600 mb-1">Área</div>
                              <div className="font-semibold">{currentGarden.area} m²</div>
                            </div>
                            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border">
                              <div className="text-xs text-slate-600 mb-1">Altitude</div>
                              <div className="font-semibold">{currentGarden.altitude} m</div>
                            </div>
                          </div>
                        </div>

                        {/* Mini map illustration */}
                        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-100 to-lime-100 border-2 border-emerald-200 flex flex-col items-center justify-center">
                          <MapPin className="h-8 w-8 text-emerald-600 mb-2" />
                          <div className="text-center">
                            <div className="text-sm font-medium text-slate-700 mb-1">Localização</div>
                            <div className="text-xs text-slate-600">Lat: {currentGarden.location.latitude.toFixed(4)}°</div>
                            <div className="text-xs text-slate-600">
                              Long: {currentGarden.location.longitude.toFixed(4)}°
                            </div>
                          </div>
                          <div className="mt-4 text-6xl">{getCropEmoji(currentGarden.cropType)}</div>
                          <div className="mt-2 text-xs text-slate-500 text-center">Mapa ilustrativo da cultura</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>
          )}

          {weatherData && (
              <section ref={refWeather} className="scroll-mt-24">
                <div className="bg-gradient-to-r from-emerald-500/10 to-sky-500/10 rounded-2xl p-0.5">
                  <Card className="rounded-2xl bg-white/80 backdrop-blur">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2">
                        <Cloud className="h-5 w-5 text-sky-600" />
                        <span className="bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent font-semibold">
                      Condições climáticas atuais
                    </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
                        {[
                          {
                            icon: <Thermometer className="h-5 w-5" />,
                            label: "Temperatura",
                            val: `${weatherData.temperature.toFixed(1)}°C`,
                            color: "from-rose-100 to-amber-100 text-amber-700",
                          },
                          {
                            icon: <Droplets className="h-5 w-5" />,
                            label: "Umidade do ar",
                            val: `${weatherData.humidity.toFixed(0)} %`,
                            color: "from-sky-100 to-cyan-100 text-sky-700",
                          },
                          {
                            icon: <Wind className="h-5 w-5" />,
                            label: "Vento",
                            val: `${weatherData.windSpeed.toFixed(1)} km/h`,
                            color: "from-teal-100 to-emerald-100 text-teal-700",
                          },
                          {
                            icon: <Droplets className="h-5 w-5" />,
                            label: "Umidade do solo",
                            val: `${weatherData.soilMoisture.toFixed(0)} %`,
                            color: "from-emerald-100 to-lime-100 text-emerald-700",
                          },
                          {
                            icon: <Sun className="h-5 w-5" />,
                            label: "Condição",
                            val: getWeatherDescription(weatherData.weatherCode),
                            color: "from-indigo-100 to-sky-100 text-indigo-700",
                          },
                        ].map((tile, i) => (
                            <div key={i} className={`text-center p-3 rounded-xl border bg-gradient-to-br ${tile.color}`}>
                              <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-white/70 flex items-center justify-center">
                                {tile.icon}
                              </div>
                              <div className="text-xl font-bold">{tile.val}</div>
                              <div className="text-xs text-slate-600">{tile.label}</div>
                            </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>
          )}

          <section ref={refInsights} className="scroll-mt-24">
            <Card className="rounded-2xl bg-white/80 backdrop-blur shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <span className="bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent font-semibold">
                  Plano de Irrigação Gerado por IA
                </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingIrrigation && (
                    <div className="text-center py-8">
                      <Brain className="h-8 w-8 text-purple-600 animate-pulse mx-auto mb-3" />
                      <p className="text-slate-600">Gerando plano de irrigação personalizado...</p>
                    </div>
                )}

                {irrigationPlan && !loadingIrrigation && (
                    <>
                      <div className="relative">
                        <div className="absolute left-0 top-0 h-full w-1 rounded-l-md bg-gradient-to-b from-purple-400 to-indigo-400" />
                        <div className="ml-2 p-4 rounded-xl border bg-gradient-to-br from-purple-50 to-indigo-50">
                          <div className="flex items-start gap-3">
                            <Brain className="h-5 w-5 mt-0.5 text-purple-600" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm sm:text-base mb-2">Recomendações Personalizadas</p>
                              <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                                {irrigationPlan.recomendacao}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="text-center p-3 rounded-xl border bg-gradient-to-br from-emerald-50 to-teal-50">
                          <div className="text-xs text-slate-600 mb-1">Hoje</div>
                          <div className="text-xl font-bold text-emerald-700">
                            {Math.round(irrigationPlan.base.hoje.liters)} L
                          </div>
                          <div className="text-xs text-slate-500">{irrigationPlan.base.hoje.mm.toFixed(2)} mm</div>
                        </div>
                        <div className="text-center p-3 rounded-xl border bg-gradient-to-br from-sky-50 to-cyan-50">
                          <div className="text-xs text-slate-600 mb-1">7 dias</div>
                          <div className="text-xl font-bold text-sky-700">
                            {Math.round(irrigationPlan.base.dias7.liters)} L
                          </div>
                          <div className="text-xs text-slate-500">{irrigationPlan.base.dias7.mm.toFixed(2)} mm</div>
                        </div>
                        <div className="text-center p-3 rounded-xl border bg-gradient-to-br from-amber-50 to-orange-50">
                          <div className="text-xs text-slate-600 mb-1">30 dias</div>
                          <div className="text-xl font-bold text-amber-700">
                            {Math.round(irrigationPlan.base.dias30.liters)} L
                          </div>
                          <div className="text-xs text-slate-500">{irrigationPlan.base.dias30.mm.toFixed(2)} mm</div>
                        </div>
                        <div className="text-center p-3 rounded-xl border bg-gradient-to-br from-indigo-50 to-purple-50">
                          <div className="text-xs text-slate-600 mb-1">6 meses</div>
                          <div className="text-xl font-bold text-indigo-700">
                            {Math.round(irrigationPlan.base.meses6.liters)} L
                          </div>
                          <div className="text-xs text-slate-500">{irrigationPlan.base.meses6.mm.toFixed(2)} mm</div>
                        </div>
                      </div>
                    </>
                )}
              </CardContent>
            </Card>
          </section>
        </div>

        {currentGarden && irrigationPlan && (
            <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3">
              {showWhatsAppCard && (
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-4 rounded-2xl shadow-2xl max-w-[280px] animate-in slide-in-from-right duration-300">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
                        <Brain className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm mb-1">Suporte com IA</h3>
                        <p className="text-xs text-white/90 leading-relaxed">
                          Receba recomendações personalizadas e melhore seu plano de irrigação
                        </p>
                      </div>
                    </div>
                    <Button
                        onClick={handleWhatsAppClick}
                        className="w-full mt-3 bg-white text-green-600 hover:bg-white/90 font-semibold rounded-xl shadow-md"
                        size="sm"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Falar com IA
                    </Button>
                  </div>
              )}

              <Button
                  onClick={() => setShowWhatsAppCard(!showWhatsAppCard)}
                  className="h-14 w-14 rounded-full bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-200 animate-pulse"
                  size="icon"
              >
                <MessageCircle className="h-6 w-6 text-white" />
              </Button>
            </div>
        )}

        <nav
            className="fixed bottom-0 inset-x-0 z-40 border-t bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 sm:hidden"
            style={{ height: "64px", paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="grid grid-cols-4 h-full">
            {[
              {
                icon: Home,
                label: "Resumo",
                ref: refOverview,
              },
              {
                icon: Cloud,
                label: "Clima",
                ref: refWeather,
              },
              {
                icon: Brain,
                label: "Percepções",
                ref: refInsights,
              },
              {
                icon: CalendarRange,
                label: "Agenda",
                ref: refSchedule,
              },
            ].map((item, i) => (
                <button
                    key={i}
                    onClick={() => goTo(item.ref)}
                    className="flex flex-col items-center justify-center gap-1 hover:bg-emerald-50"
                >
                  <item.icon className="h-5 w-5 text-emerald-600" />
                  <span className="text-[10px] leading-none text-slate-700">{item.label}</span>
                </button>
            ))}
          </div>
        </nav>
      </div>
  )
}
