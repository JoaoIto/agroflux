"use client"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart3,
  LogOut,
  Activity,
  MapPin,
  Plus,
  AlertTriangle,
  Droplets,
  Thermometer,
  TrendingUp,
  TrendingDown, Cloud, Wind
} from "lucide-react"
import { useRouter } from "next/navigation"
import { ManagementOverview } from "./management-overview"
import { SensorMonitoring } from "./sensor-monitoring"
import { FieldMap } from "./field-map"
import { ZoneForm } from "./zone-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {useEffect, useState} from "react"
import {
  getWeatherData,
  getWeatherDescription,
  getWeatherForecast,
  WeatherData,
  WeatherForecast
} from "@/lib/weather-api";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {CropForm} from "@/components/crop-form";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

export function LargeProducerDashboard() {
  const router = useRouter()
  const [showZoneForm, setShowZoneForm] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BarChart3 className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">Grande Produtor</span>
          </div>
          <div className="flex items-center gap-4">
            <Dialog open={showZoneForm} onOpenChange={setShowZoneForm}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Plus className="h-4 w-4" />
                  Cadastrar Zona
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Cadastrar Nova Zona e Sensores</DialogTitle>
                </DialogHeader>
                <ZoneForm />
              </DialogContent>
            </Dialog>

            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm text-muted-foreground">Sistema Online</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Gestão e Dados
            </TabsTrigger>
            <TabsTrigger value="sensors" className="gap-2">
              <Activity className="h-4 w-4" />
              Sensores em Tempo Real
            </TabsTrigger>
            <TabsTrigger value="map" className="gap-2">
              <MapPin className="h-4 w-4" />
              Mapeamento
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <ManagementOverview />
          </TabsContent>

          <TabsContent value="sensors" className="space-y-6">
            <SensorMonitoring />
          </TabsContent>

          <TabsContent value="map" className="space-y-6">
            <FieldMap />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

const mockGardens = [
  { id: "1", name: "Horta Principal", crop: "Tomate", area: 50, lat: -23.5505, lng: -46.6333 },
  { id: "2", name: "Horta Secundária", crop: "Alface", area: 30, lat: -23.5489, lng: -46.6388 },
]

export function SmallProducerDashboard() {
  const router = useRouter()
  const [selectedGarden, setSelectedGarden] = useState(mockGardens[0].id)
  const [showAddGarden, setShowAddGarden] = useState(false)
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [forecast, setForecast] = useState<WeatherForecast[]>([])
  const [loading, setLoading] = useState(true)

  const currentGarden = mockGardens.find((g) => g.id === selectedGarden) || mockGardens[0]

  useEffect(() => {
    async function fetchWeatherData() {
      setLoading(true)
      const weather = await getWeatherData(currentGarden.lat, currentGarden.lng)
      const forecastData = await getWeatherForecast(currentGarden.lat, currentGarden.lng, 7)
      setWeatherData(weather)
      setForecast(forecastData)
      setLoading(false)
    }

    fetchWeatherData()

    // Refresh weather data every 5 minutes
    const interval = setInterval(fetchWeatherData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [currentGarden])

  const calculateWaterUsage = () => {
    if (!weatherData) return { today: 245, forecast7Days: 1680, balance: 8450 }

    // Base water usage calculation based on area and crop type
    const baseUsage = currentGarden.area * 5 // 5L per m² base

    // Adjust based on temperature
    const tempFactor = weatherData.temperature > 28 ? 1.3 : weatherData.temperature < 20 ? 0.8 : 1.0

    // Adjust based on humidity
    const humidityFactor = weatherData.humidity < 50 ? 1.2 : weatherData.humidity > 70 ? 0.9 : 1.0

    // Adjust based on wind
    const windFactor = weatherData.windSpeed > 15 ? 1.15 : 1.0

    const todayUsage = Math.round(baseUsage * tempFactor * humidityFactor * windFactor)

    // Calculate 7-day forecast
    const forecast7Days = forecast.reduce((total, day) => {
      const dayTempFactor = day.temperatureMax > 28 ? 1.3 : day.temperatureMax < 20 ? 0.8 : 1.0
      const dayHumidityFactor = day.humidity < 50 ? 1.2 : day.humidity > 70 ? 0.9 : 1.0
      const rainReduction = day.precipitation > 5 ? 0.5 : day.precipitation > 0 ? 0.8 : 1.0
      return total + baseUsage * dayTempFactor * dayHumidityFactor * rainReduction
    }, 0)

    return {
      today: todayUsage,
      forecast7Days: Math.round(forecast7Days),
      balance: 8450,
    }
  }

  const waterUsage = calculateWaterUsage()

  const generateInsights = () => {
    if (!weatherData || forecast.length === 0) return []

    const insights = []

    // Rain prediction insight
    const rainTomorrow = forecast[1]?.precipitation > 5
    if (rainTomorrow) {
      insights.push({
        type: "warning",
        icon: AlertTriangle,
        title: "Chuva prevista para amanhã",
        description: `Precipitação de ${forecast[1].precipitation.toFixed(1)}mm esperada. Recomendamos reduzir irrigação em 60% hoje. Economia estimada: ${Math.round(waterUsage.today * 0.6)}L`,
      })
    }

    // Soil moisture insight
    insights.push({
      type: "info",
      icon: Droplets,
      title: "Umidade do solo",
      description: `Baseado em dados climáticos, a umidade está em ${weatherData.soilMoisture.toFixed(0)}%. ${weatherData.soilMoisture < 40 ? "Próxima irrigação: em 2 horas" : "Próxima irrigação: 18:30"}`,
    })

    // Temperature alert
    if (weatherData.temperature > 30) {
      insights.push({
        type: "warning",
        icon: Thermometer,
        title: "Temperatura elevada",
        description: `Temperatura atual de ${weatherData.temperature.toFixed(1)}°C. Recomendamos aumentar frequência de irrigação em 20% e irrigar nas horas mais frescas.`,
      })
    }

    // Efficiency insight
    insights.push({
      type: "success",
      icon: TrendingUp,
      title: "Eficiência aumentou",
      description: "Seu consumo de água reduziu 15% esta semana comparado à média anterior",
    })

    return insights
  }

  const insights = generateInsights()

  if (loading) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Droplets className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando dados climáticos...</p>
          </div>
        </div>
    )
  }

  return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Droplets className="h-6 w-6 text-primary" />
              <span className="text-xl font-semibold">Pequeno Produtor</span>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedGarden} onValueChange={setSelectedGarden}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockGardens.map((garden) => (
                      <SelectItem key={garden.id} value={garden.id}>
                        {garden.name}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Dialog open={showAddGarden} onOpenChange={setShowAddGarden}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Nova Horta</DialogTitle>
                  </DialogHeader>
                  <CropForm onSuccess={() => setShowAddGarden(false)} />
                </DialogContent>
              </Dialog>

              <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Água Gasta Hoje</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{waterUsage.today} L</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <TrendingDown className="h-3 w-3 text-success" />
                  12% menos que ontem
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Previsão 7 Dias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{waterUsage.forecast7Days} L</div>
                <p className="text-xs text-muted-foreground mt-1">Baseado em clima e IA</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Saldo de Água</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{waterUsage.balance} L</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Suficiente para {Math.round(waterUsage.balance / (waterUsage.forecast7Days / 7))} dias
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Economia Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success">38%</div>
                <p className="text-xs text-muted-foreground mt-1">vs. irrigação manual</p>
              </CardContent>
            </Card>
          </div>

          {weatherData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cloud className="h-5 w-5 text-primary" />
                    Condições Climáticas Atuais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-5 gap-4">
                    <div className="text-center p-3 rounded-lg border bg-card">
                      <Thermometer className="h-5 w-5 mx-auto mb-2 text-warning" />
                      <div className="text-2xl font-bold">{weatherData.temperature.toFixed(1)}°C</div>
                      <div className="text-xs text-muted-foreground">Temperatura</div>
                    </div>
                    <div className="text-center p-3 rounded-lg border bg-card">
                      <Droplets className="h-5 w-5 mx-auto mb-2 text-info" />
                      <div className="text-2xl font-bold">{weatherData.humidity.toFixed(0)}%</div>
                      <div className="text-xs text-muted-foreground">Umidade do Ar</div>
                    </div>
                    <div className="text-center p-3 rounded-lg border bg-card">
                      <Wind className="h-5 w-5 mx-auto mb-2 text-primary" />
                      <div className="text-2xl font-bold">{weatherData.windSpeed.toFixed(1)} km/h</div>
                      <div className="text-xs text-muted-foreground">Vento</div>
                    </div>
                    <div className="text-center p-3 rounded-lg border bg-card">
                      <Droplets className="h-5 w-5 mx-auto mb-2 text-success" />
                      <div className="text-2xl font-bold">{weatherData.soilMoisture.toFixed(0)}%</div>
                      <div className="text-xs text-muted-foreground">Umidade Solo</div>
                    </div>
                    <div className="text-center p-3 rounded-lg border bg-card">
                      <Cloud className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                      <div className="text-sm font-medium mt-2">{getWeatherDescription(weatherData.weatherCode)}</div>
                      <div className="text-xs text-muted-foreground">Condição</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Insights e Alertas da IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights.map((insight, index) => (
                  <div
                      key={index}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                          insight.type === "warning"
                              ? "bg-warning/10 border-warning/20"
                              : insight.type === "info"
                                  ? "bg-info/10 border-info/20"
                                  : "bg-success/10 border-success/20"
                      }`}
                  >
                    <insight.icon
                        className={`h-5 w-5 mt-0.5 ${
                            insight.type === "warning" ? "text-warning" : insight.type === "info" ? "text-info" : "text-success"
                        }`}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{insight.title}</p>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                    </div>
                  </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Programação de Irrigação - Próximos 3 Dias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {forecast.slice(0, 3).map((day, i) => {
                  const dayLabel = i === 0 ? "Hoje" : i === 1 ? "Amanhã" : "Depois de amanhã"
                  const morningAmount = day.precipitation > 5 ? 0 : Math.round(waterUsage.today * 0.4)
                  const eveningAmount = day.precipitation > 5 ? 0 : Math.round(waterUsage.today * 0.6)
                  const cancelled = day.precipitation > 5

                  return (
                      <div key={i} className="space-y-2">
                        <div
                            className={`flex items-center justify-between p-3 rounded-lg border ${cancelled ? "bg-muted/50 opacity-60" : "bg-card"}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="text-sm font-medium w-32">{dayLabel}</div>
                            <div className="text-sm text-muted-foreground">
                              {cancelled ? "Cancelado - Chuva" : "06:00 - 06:15"}
                            </div>
                          </div>
                          <div className="flex items-center gap-6 text-sm">
                            <div>
                              <span className="text-muted-foreground">Volume: </span>
                              <span className="font-medium">{morningAmount}L</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Temp: </span>
                              <span className="font-medium">{day.temperatureMin.toFixed(0)}°C</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Umidade: </span>
                              <span className="font-medium">{day.humidity.toFixed(0)}%</span>
                            </div>
                          </div>
                        </div>
                        {!cancelled && (
                            <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                              <div className="flex items-center gap-4">
                                <div className="text-sm font-medium w-32">{dayLabel}</div>
                                <div className="text-sm text-muted-foreground">18:30 - 18:45</div>
                              </div>
                              <div className="flex items-center gap-6 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Volume: </span>
                                  <span className="font-medium">{eveningAmount}L</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Temp: </span>
                                  <span className="font-medium">{day.temperatureMax.toFixed(0)}°C</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Umidade: </span>
                                  <span className="font-medium">{day.humidity.toFixed(0)}%</span>
                                </div>
                              </div>
                            </div>
                        )}
                      </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  )
}
