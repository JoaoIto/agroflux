"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Droplets, TrendingDown, AlertTriangle, Brain, Cloud, Wind, Thermometer, Sun } from "lucide-react"
import { getWeatherData, getWeatherDescription, type WeatherData } from "@/lib/weather-api"

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

type Zone = {
  _id: string
  garden_id: string
  name: string
  location: { latitude: number; longitude: number }
  area: number
}

type Culture = {
  _id: string
  name: string
  type: string
  ideal_conditions: string | { humidity_range?: string; temperature_range?: string }
}

export function ManagementOverview() {
  const [zones, setZones] = useState<Zone[]>([])
  const [cultures, setCultures] = useState<Culture[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [irrigationPlan, setIrrigationPlan] = useState<IrrigationPlan | null>(null)
  const [loadingIrrigation, setLoadingIrrigation] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [zonesResponse, culturesResponse] = await Promise.all([
          axios.get("/api/zones?garden_id=68f90e39d48e8e21583df060"),
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

    fetchData()
  }, [])

  useEffect(() => {
    if (!zones || zones.length === 0) return

    const firstZone = zones[0]
    let cancelled = false

    async function fetchWeather() {
      const weather = await getWeatherData(firstZone.location.latitude, firstZone.location.longitude)
      if (!cancelled) {
        setWeatherData(weather)
      }
    }

    fetchWeather()
  }, [zones])

  useEffect(() => {
    if (!weatherData || !zones || zones.length === 0) return

    const fetchIrrigationPlan = async () => {
      setLoadingIrrigation(true)
      try {
        const now = new Date()
        const start = new Date(now.getFullYear(), 0, 0)
        const diff = now.getTime() - start.getTime()
        const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))

        // Calculate total area from all zones
        const totalArea = zones.reduce((sum, zone) => sum + zone.area, 0)
        const firstZone = zones[0]

        const response = await axios.post("/api/ai/irrigacao", {
          kc: 1.15, // Default Kc for large producer
          tmax: weatherData.temperatureMax,
          tmin: weatherData.temperatureMin,
          rh: weatherData.humidity,
          u2: weatherData.windSpeed / 3.6,
          Rs: 20,
          latitude: firstZone.location.latitude,
          longitude: firstZone.location.longitude,
          altitude: 800,
          area_m2: totalArea,
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
  }, [weatherData, zones])

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
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-muted-foreground">Erro ao carregar dados. Verifique sua conexão.</p>
          </div>
        </div>
    )
  }

  return (
      <div className="space-y-6">
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
              gradient: "from-emerald-200/70 via-teal-200/50 to-sky-200/70",
            },
            {
              title: "Previsão para 7 dias",
              value: irrigationPlan ? `${Math.round(irrigationPlan.base.dias7.liters)} L` : "...",
              sub: "Com base no clima e na IA",
              gradient: "from-sky-200/70 via-cyan-200/50 to-blue-200/70",
            },
            {
              title: "Previsão 30 dias",
              value: irrigationPlan ? `${Math.round(irrigationPlan.base.dias30.liters)} L` : "...",
              sub: irrigationPlan ? `${(irrigationPlan.base.dias30.mm / 30).toFixed(1)} mm/dia` : "Calculando...",
              gradient: "from-amber-200/70 via-orange-200/50 to-yellow-200/70",
            },
            {
              title: "ETo × Kc",
              value: irrigationPlan ? (
                  <span className="text-emerald-600">{irrigationPlan.eto.toFixed(2)} mm</span>
              ) : (
                  "..."
              ),
              sub: irrigationPlan ? `Kc = ${irrigationPlan.kc}` : "Calculando...",
              gradient: "from-purple-200/70 via-indigo-200/50 to-violet-200/70",
            },
          ].map((kpi, i) => (
              <div key={i} className={`bg-gradient-to-br ${kpi.gradient} p-[1.5px] rounded-2xl`}>
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

        {weatherData && (
            <div className="bg-gradient-to-r from-emerald-500/10 to-sky-500/10 rounded-2xl p-0.5">
              <Card className="rounded-2xl bg-white/80 backdrop-blur">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Cloud className="h-5 w-5 text-sky-600" />
                    <span className="bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent font-semibold">
                  Condições Climáticas Atuais
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
                        val: `${weatherData.humidity.toFixed(0)}%`,
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
                        val: `${weatherData.soilMoisture.toFixed(0)}%`,
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
        )}

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
                      <div className="text-xl font-bold text-sky-700">{Math.round(irrigationPlan.base.dias7.liters)} L</div>
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

        <Card>
          <CardHeader>
            <CardTitle>Consumo de Água por Zona - Últimas 24h</CardTitle>
          </CardHeader>
          <CardContent>
            {zones && zones.length > 0 ? (
                <div className="space-y-3">
                  {zones.map((zone, i) => {
                    const usage = irrigationPlan
                        ? Math.round(irrigationPlan.base.hoje.liters / zones.length)
                        : 2500 + i * 300
                    const optimal = irrigationPlan
                        ? Math.round((irrigationPlan.base.hoje.liters / zones.length) * 1.1)
                        : 2800 + i * 200
                    const status = usage > optimal ? "warning" : "optimal"

                    return (
                        <div key={zone._id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                          <div className="flex items-center gap-4 flex-1">
                            <div
                                className={`h-3 w-3 rounded-full ${
                                    status === "warning" ? "bg-warning" : "bg-success"
                                } flex-shrink-0`}
                            />
                            <div className="min-w-[100px]">
                              <div className="font-medium">{zone.name}</div>
                              <div className="text-xs text-muted-foreground">{zone.area}m²</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 text-sm">
                            <div>
                              <span className="text-muted-foreground">Usado: </span>
                              <span className="font-medium">{usage}L</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Ideal: </span>
                              <span className="font-medium">{optimal}L</span>
                            </div>
                            <div className="min-w-[80px] text-right">
                              {usage > optimal ? (
                                  <span className="text-warning font-medium">+{((usage / optimal - 1) * 100).toFixed(0)}%</span>
                              ) : (
                                  <span className="text-success font-medium">-{((1 - usage / optimal) * 100).toFixed(0)}%</span>
                              )}
                            </div>
                          </div>
                        </div>
                    )
                  })}
                </div>
            ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhuma zona cadastrada ainda.</p>
                  <p className="text-sm mt-2">Clique em "Cadastrar Zona" para adicionar sua primeira zona.</p>
                </div>
            )}
          </CardContent>
        </Card>

        {cultures && cultures.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Culturas Disponíveis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {cultures.map((culture) => (
                      <div key={culture._id} className="p-3 rounded-lg border bg-card">
                        <div className="font-medium">{culture.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">{culture.type}</div>
                        <div className="text-xs text-muted-foreground mt-2">
                          {typeof culture.ideal_conditions === "string"
                              ? culture.ideal_conditions
                              : culture.ideal_conditions && typeof culture.ideal_conditions === "object"
                                  ? `Umidade: ${culture.ideal_conditions.humidity_range || "N/A"}, Temperatura: ${culture.ideal_conditions.temperature_range || "N/A"}`
                                  : "Condições ideais não disponíveis"}
                        </div>
                      </div>
                  ))}
                </div>
              </CardContent>
            </Card>
        )}
      </div>
  )
}
