"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Droplets, TrendingDown, TrendingUp, AlertTriangle, Plus, LogOut,
  Cloud, Wind, Thermometer, Home, CalendarRange, Brain, Sun
} from "lucide-react"
import { useRouter } from "next/navigation"
import { CropForm } from "./crop-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  getWeatherData, getWeatherForecast, getWeatherDescription,
  type WeatherData, type WeatherForecast,
} from "@/lib/weather-api"
import Image from "next/image"

// logo (ajuste o caminho se preciso)
import logoAgroSymbol from "@/app/img/favicon.ico"

export function SmallProducerDashboard() {
  // ====== state/lógica original (inalterado) ======
  const router = useRouter()
  const [selectedGarden, setSelectedGarden] = useState<string>("")
  const [showAddGarden, setShowAddGarden] = useState(false)
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [forecast, setForecast] = useState<WeatherForecast[]>([])
  const [loading, setLoading] = useState(true)
  const [gardens, setGardens] = useState<IGarden[]>([])
  const [gardensError, setGardensError] = useState<string | null>(null)

  const refOverview = useRef<HTMLDivElement | null>(null)
  const refWeather  = useRef<HTMLDivElement | null>(null)
  const refInsights = useRef<HTMLDivElement | null>(null)
  const refSchedule = useRef<HTMLDivElement | null>(null)

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
    const interval = setInterval(fetchGardens, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (gardens && gardens.length > 0 && !selectedGarden) setSelectedGarden(gardens[0]._id)
  }, [gardens, selectedGarden])

  const currentGarden = useMemo(() => gardens?.find((g) => g._id === selectedGarden), [gardens, selectedGarden])

  useEffect(() => {
    if (!currentGarden) return
    async function fetchWeather() {
      setLoading(true)
      const weather = await getWeatherData(currentGarden.location.latitude, currentGarden.location.longitude)
      const forecastData = await getWeatherForecast(currentGarden.location.latitude, currentGarden.location.longitude, 7)
      setWeatherData(weather)
      setForecast(forecastData)
      setLoading(false)
    }
    fetchWeather()
    const i = setInterval(fetchWeather, 5 * 60 * 1000)
    return () => clearInterval(i)
  }, [currentGarden])

  const calculateWaterUsage = () => {
    if (!weatherData || !currentGarden) return { today: 245, forecast7Days: 1680, balance: 8450 }
    const base = currentGarden.area * 5
    const tf = weatherData.temperature > 28 ? 1.3 : weatherData.temperature < 20 ? 0.8 : 1.0
    const hf = weatherData.humidity < 50 ? 1.2 : weatherData.humidity > 70 ? 0.9 : 1.0
    const wf = weatherData.windSpeed > 15 ? 1.15 : 1.0
    const today = Math.round(base * tf * hf * wf)
    const f7 = forecast.reduce((t, d) => {
      const dtf = d.temperatureMax > 28 ? 1.3 : d.temperatureMax < 20 ? 0.8 : 1.0
      const dhf = d.humidity < 50 ? 1.2 : d.humidity > 70 ? 0.9 : 1.0
      const rain = d.precipitation > 5 ? 0.5 : d.precipitation > 0 ? 0.8 : 1.0
      return t + base * dtf * dhf * rain
    }, 0)
    return { today, forecast7Days: Math.round(f7), balance: 8450 }
  }
  const waterUsage = useMemo(calculateWaterUsage, [weatherData, currentGarden, forecast])

  const generateInsights = () => {
    if (!weatherData || forecast.length === 0) return []
    const arr: any[] = []
    if (forecast[1]?.precipitation > 5) {
      arr.push({
        type: "warning", icon: AlertTriangle,
        title: "Chuva prevista para amanhã",
        description: `Precipitação de ${forecast[1].precipitation.toFixed(1)}mm. Reduza irrigação em 60% hoje (≈ ${Math.round(waterUsage.today * 0.6)}L).`,
      })
    }
    arr.push({
      type: "info", icon: Droplets,
      title: "Umidade do solo",
      description: `Estimada em ${weatherData.soilMoisture.toFixed(0)}%. ${weatherData.soilMoisture < 40 ? "Próxima irrigação em ~2h." : "Próxima irrigação: 18:30."}`,
    })
    if (weatherData.temperature > 30) {
      arr.push({
        type: "warning", icon: Thermometer,
        title: "Temperatura elevada",
        description: `Agora ${weatherData.temperature.toFixed(1)}°C. Aumente frequência em 20% e irrigue nas horas mais frescas.`,
      })
    }
    arr.push({
      type: "success", icon: TrendingUp,
      title: "Eficiência aumentou",
      description: "Consumo de água -15% vs. média anterior.",
    })
    return arr
  }
  const insights = useMemo(generateInsights, [weatherData, forecast, waterUsage])

  const goTo = (ref: React.RefObject<HTMLDivElement>) => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" })

  // ====== estados de carregamento/erro (sem mudança) ======
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
              <DialogHeader><DialogTitle>Adicionar Nova Horta</DialogTitle></DialogHeader>
              <CropForm onSuccess={() => { setShowAddGarden(false); fetchGardens() }} />
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

  // ====== UI ======
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,rgba(16,185,129,0.06),rgba(14,165,233,0.06))]">
      {/* HEADER com faixa gradiente */}
      <header className="sticky top-0 z-30 border-b bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500" />
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative h-8 w-8 overflow-hidden rounded-xl ring-2 ring-emerald-400/40">
                <Image src={logoAgroSymbol} alt="AgroFlux" fill className="object-cover" sizes="32px" priority />
              </div>
              <span className="text-lg sm:text-xl font-semibold tracking-tight">Olá Leandra!</span>
            </div>

            {/* ações desktop */}
            <div className="hidden sm:flex items-center gap-2">
              <Select value={selectedGarden} onValueChange={setSelectedGarden}>
                <SelectTrigger className="w-[220px] rounded-xl bg-white/60 backdrop-blur hover:bg-white/80">
                  <SelectValue placeholder="Selecione a horta" />
                </SelectTrigger>
                <SelectContent>
                  {gardens?.map((g) => <SelectItem key={g._id} value={g._id}>{g.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Dialog open={showAddGarden} onOpenChange={setShowAddGarden}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-xl border-emerald-300/60 hover:bg-emerald-50">
                    <Plus className="h-4 w-4 text-emerald-600" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Adicionar Nova Horta</DialogTitle></DialogHeader>
                  <CropForm onSuccess={() => { setShowAddGarden(false); fetchGardens() }} />
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
                {gardens?.map((g) => <SelectItem key={g._id} value={g._id}>{g.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Dialog open={showAddGarden} onOpenChange={setShowAddGarden}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-xl border-emerald-300/60">
                  <Plus className="h-4 w-4 text-emerald-600" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Adicionar Nova Horta</DialogTitle></DialogHeader>
                <CropForm onSuccess={() => { setShowAddGarden(false); fetchGardens() }} />
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="rounded-xl">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* CONTEÚDO */}
      <div className="container mx-auto px-4 pt-5 space-y-6" style={{ paddingBottom: "calc(88px + env(safe-area-inset-bottom))" }}>
        {/* KPIs com borda gradiente */}
        <section ref={refOverview} className="scroll-mt-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {[
              { title: "Água Gasta Hoje", value: `${waterUsage.today} L`, sub: <> <TrendingDown className="h-3 w-3 text-emerald-600" /> <span>12% menos que ontem</span></> },
              { title: "Previsão para 7 dias", value: `${waterUsage.forecast7Days} L`, sub: "Com base no clima e na IA" },
              { title: "Balanço Hídrico", value: `${waterUsage.balance} L`, sub: `Suficiente para ${Math.round(waterUsage.balance / (waterUsage.forecast7Days / 7))} dias` },
              { title: "Economia Mensal", value: <span className="text-emerald-600">38%</span>, sub: "vs. manual de irrigação" },
            ].map((kpi, i) => (
              <div key={i} className="bg-gradient-to-br from-emerald-200/70 via-teal-200/50 to-sky-200/70 p-[1.5px] rounded-2xl">
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

        {/* CLIMA com tiles coloridos */}
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
                      { icon: <Thermometer className="h-5 w-5" />, label: "Temperatura", val: `${weatherData.temperature.toFixed(1)}°C`, color: "from-rose-100 to-amber-100 text-amber-700" },
                      { icon: <Droplets className="h-5 w-5" />, label: "Umidade do ar", val: `${weatherData.humidity.toFixed(0)} %`, color: "from-sky-100 to-cyan-100 text-sky-700" },
                      { icon: <Wind className="h-5 w-5" />, label: "Vento", val: `${weatherData.windSpeed.toFixed(1)} km/h`, color: "from-teal-100 to-emerald-100 text-teal-700" },
                      { icon: <Droplets className="h-5 w-5" />, label: "Umidade do solo", val: `${weatherData.soilMoisture.toFixed(0)} %`, color: "from-emerald-100 to-lime-100 text-emerald-700" },
                      { icon: <Sun className="h-5 w-5" />, label: "Condição", val: getWeatherDescription(weatherData.weatherCode), color: "from-indigo-100 to-sky-100 text-indigo-700" },
                    ].map((tile, i) => (
                      <div key={i} className={`text-center p-3 rounded-xl border bg-gradient-to-br ${tile.color}`}>
                        <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-white/70 flex items-center justify-center">{tile.icon}</div>
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

        {/* INSIGHTS com faixa lateral colorida */}
        <section ref={refInsights} className="scroll-mt-24">
          <Card className="rounded-2xl bg-white/80 backdrop-blur shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <span className="bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent font-semibold">
                  Insights e alertas da IA
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights.map((ins, i) => {
                const theme =
                  ins.type === "warning" ? "from-amber-400 to-rose-400" :
                  ins.type === "info"    ? "from-sky-400 to-cyan-400"  :
                                           "from-emerald-400 to-teal-400"
                return (
                  <div key={i} className="relative">
                    <div className={`absolute left-0 top-0 h-full w-1 rounded-l-md bg-gradient-to-b ${theme}`} />
                    <div className="ml-2 flex items-start gap-3 p-3 rounded-xl border bg-white/70">
                      <ins.icon className="h-5 w-5 mt-0.5 text-slate-600" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base">{ins.title}</p>
                        <p className="text-sm text-slate-600 break-words">{ins.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </section>

        {/* AGENDA com cápsulas */}
        <section ref={refSchedule} className="scroll-mt-24">
          <Card className="rounded-2xl bg-white/80 backdrop-blur shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent font-semibold">
                Cronograma de Irrigação — Próximos 3 dias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {forecast.slice(0, 3).map((day, i) => {
                  const label = i === 0 ? "Hoje" : i === 1 ? "Amanhã" : "Depois de amanhã"
                  const morningAmount = day.precipitation > 5 ? 0 : Math.round(waterUsage.today * 0.4)
                  const eveningAmount = day.precipitation > 5 ? 0 : Math.round(waterUsage.today * 0.6)
                  const cancelled = day.precipitation > 5
                  const Capsule = ({ when, vol, temp, hum }: any) => (
                    <div className="rounded-2xl border p-3 bg-gradient-to-br from-emerald-50 to-sky-50">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium px-2 py-1 rounded-full bg-white/70 border text-slate-700">{label}</span>
                          <span className="text-xs sm:text-sm text-slate-600">{when}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs sm:text-sm">
                          <div><span className="text-slate-500">Volume: </span><span className="font-medium">{vol} L</span></div>
                          <div><span className="text-slate-500">Temp: </span><span className="font-medium">{temp}°C</span></div>
                          <div><span className="text-slate-500">Umidade: </span><span className="font-medium">{hum}%</span></div>
                        </div>
                      </div>
                    </div>
                  )
                  return (
                    <div key={i} className="space-y-2">
                      <div className={`rounded-2xl ${cancelled ? "opacity-60" : ""}`}>
                        <Capsule when={cancelled ? "Cancelado — Chuva" : "06:00 — 06:15"}
                          vol={morningAmount} temp={day.temperatureMin.toFixed(0)} hum={day.humidity.toFixed(0)} />
                      </div>
                      {!cancelled && (
                        <Capsule when="18:30 — 18:45"
                          vol={eveningAmount} temp={day.temperatureMax.toFixed(0)} hum={day.humidity.toFixed(0)} />
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* NAV INFERIOR */}
      <nav
        className="fixed bottom-0 inset-x-0 z-40 border-t bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 sm:hidden"
        style={{ height: "64px", paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="grid grid-cols-4 h-full">
          {[
            { icon: Home, label: "Resumo", ref: refOverview },
            { icon: Cloud, label: "Clima", ref: refWeather },
            { icon: Brain, label: "Percepções", ref: refInsights },
            { icon: CalendarRange, label: "Agenda", ref: refSchedule },
          ].map((item, i) => (
            <button key={i} onClick={() => goTo(item.ref)} className="flex flex-col items-center justify-center gap-1 hover:bg-emerald-50">
              <item.icon className="h-5 w-5 text-emerald-600" />
              <span className="text-[10px] leading-none text-slate-700">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
