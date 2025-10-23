"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Droplets, Power, PowerOff, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SensorMonitoring() {
  const [sensors, setSensors] = useState<ISensor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [sensorData, setSensorData] = useState({
    soilMoisture: 45,
    temperature: 28,
    humidity: 65,
    evapotranspiration: 4.2,
    windSpeed: 12,
  })

  const [gardenId, setGardenId] = useState<string | null>(null)

  useEffect(() => {
    const garden_id = localStorage.getItem("garden_id")
    if (garden_id) setGardenId(garden_id)
  }, [])

  useEffect(() => {
    const fetchSensors = async () => {
      if (!gardenId) return
      try {
        setLoading(true)
        setError(null)

        const gardenResponse = await axios.get(`/api/gardens/${gardenId}`)
        const gardenData = gardenResponse.data
        const sensorIds = gardenData?.sensor_ids || gardenData?.sensors || []

        if (sensorIds.length === 0) {
          setSensors([])
          return
        }

        const fetchSensorData = async () => {
          try {
            const sensorRequests = sensorIds.map((id: string) => axios.get(`/api/sensors/${id}`))
            const sensorsResponses = await Promise.all(sensorRequests)
            const sensorsData = sensorsResponses.map((res) => res.data)
            setSensors(sensorsData)
          } catch (err) {
            console.error("[v0] Error fetching sensors:", err)
            setError("Erro ao carregar sensores")
          }
        }

        await fetchSensorData()
        const interval = setInterval(fetchSensorData, 3000)
        return () => clearInterval(interval)
      } catch (err) {
        console.error("[v0] Error fetching garden/sensors:", err)
        setError("Erro ao carregar sensores")
      } finally {
        setLoading(false)
      }
    }

    fetchSensors()
  }, [gardenId])

  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData((prev) => ({
        soilMoisture: Math.max(30, Math.min(70, prev.soilMoisture + (Math.random() - 0.5) * 2)),
        temperature: Math.max(20, Math.min(35, prev.temperature + (Math.random() - 0.5) * 0.5)),
        humidity: Math.max(40, Math.min(80, prev.humidity + (Math.random() - 0.5) * 2)),
        evapotranspiration: Math.max(3, Math.min(6, prev.evapotranspiration + (Math.random() - 0.5) * 0.2)),
        windSpeed: Math.max(5, Math.min(20, prev.windSpeed + (Math.random() - 0.5) * 1)),
      }))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Droplets className="h-12 w-12 text-emerald-500 animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando sensores...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Erro ao carregar sensores. Verifique sua conexão.</p>
        </div>
      </div>
    )
  }

  if (sensors && sensors.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Droplets className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum sensor cadastrado ainda.</p>
          <p className="text-sm text-muted-foreground mt-2">Cadastre zonas e sensores para começar o monitoramento.</p>
        </div>
      </div>
    )
  }

  const getLatestValue = (sensor: ISensor) => {
    if (sensor.data && sensor.data.length > 0) return sensor.data[sensor.data.length - 1].value
    return 0
  }

  const sensorsByType = sensors?.reduce((acc, sensor) => {
    if (!acc[sensor.sensor_type]) acc[sensor.sensor_type] = []
    acc[sensor.sensor_type].push(sensor)
    return acc
  }, {} as Record<string, ISensor[]>)

  return (
    <div className="space-y-6">
      <Tabs defaultValue="all" className="space-y-4">
        {/* Tabs “pill” com scroll horizontal no mobile */}
        <TabsList className="w-full justify-start sm:justify-center overflow-x-auto no-scrollbar flex gap-2 sm:gap-3 p-1 rounded-2xl bg-white/70 backdrop-blur border border-slate-200">
          <TabsTrigger
            value="all"
            className="rounded-xl px-3 sm:px-4 py-2 text-sm whitespace-nowrap
                       data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-sky-600 data-[state=active]:text-white"
          >
            Todos os Sensores
          </TabsTrigger>
          <TabsTrigger
            value="type"
            className="rounded-xl px-3 sm:px-4 py-2 text-sm whitespace-nowrap
                       data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-sky-600 data-[state=active]:text-white"
          >
            Por Tipo
          </TabsTrigger>
          <TabsTrigger
            value="status"
            className="rounded-xl px-3 sm:px-4 py-2 text-sm whitespace-nowrap
                       data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-sky-600 data-[state=active]:text-white"
          >
            Status On/Off
          </TabsTrigger>
        </TabsList>

        {/* ====== TODOS ====== */}
        <TabsContent value="all" className="space-y-4">
          {/* KPIs (glass + borda gradiente) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {[
              { title: "Umidade do Solo", value: `${sensorData.soilMoisture.toFixed(1)}%` },
              { title: "Temperatura", value: `${sensorData.temperature.toFixed(1)}°C` },
              { title: "Umidade do Ar", value: `${sensorData.humidity.toFixed(1)}%` },
              { title: "Evapotranspiração", value: `${sensorData.evapotranspiration.toFixed(1)} mm` },
              { title: "Vento", value: `${sensorData.windSpeed.toFixed(1)} km/h` },
            ].map((kpi, i) => (
              <div key={i} className="rounded-2xl p-[1.5px] bg-gradient-to-br from-emerald-200/70 via-teal-200/50 to-sky-200/70">
                <Card className="rounded-2xl bg-white/80 backdrop-blur shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-700">{kpi.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-extrabold tracking-tight">{kpi.value}</div>
                    <p className="text-[11px] text-emerald-700 mt-1">Atualizado agora</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Cards de sensores (mobile-first) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {sensors?.map((sensor) => (
              <div key={sensor._id} className="rounded-2xl p-[1.5px] bg-gradient-to-br from-emerald-200/70 via-teal-200/50 to-sky-200/70">
                <Card className="rounded-2xl bg-white/80 backdrop-blur">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span className="truncate">{sensor.name}</span>
                      <Badge
                        variant="outline"
                        className={`rounded-full px-2 py-0.5 ${sensor.status === "On"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"}`}
                      >
                        {sensor.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Tipo:</span>
                        <span className="font-medium">{sensor.sensor_type}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Última leitura:</span>
                        <span className="font-semibold text-lg">{getLatestValue(sensor)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Localização:</span>
                        <span className="font-medium text-xs">
                          {sensor.location.latitude.toFixed(4)}, {sensor.location.longitude.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ====== POR TIPO ====== */}
        <TabsContent value="type" className="space-y-4">
          {sensorsByType &&
            Object.entries(sensorsByType).map(([type, typeSensors]) => (
              <div key={type} className="rounded-2xl p-[1.5px] bg-gradient-to-br from-emerald-200/70 via-teal-200/50 to-sky-200/70">
                <Card className="rounded-2xl bg-white/80 backdrop-blur">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span className="truncate">{type}</span>
                      <Badge variant="outline" className="rounded-full px-2 py-0.5 bg-sky-50 text-sky-700 border-sky-200">
                        {typeSensors.length} {typeSensors.length === 1 ? "Sensor" : "Sensores"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {typeSensors.map((sensor) => (
                        <div key={sensor._id} className="p-3 rounded-xl border bg-white/70">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm truncate">{sensor.name}</span>
                            <div
                              className={`h-2 w-2 rounded-full ${sensor.status === "On" ? "bg-emerald-600 animate-pulse" : "bg-rose-500"}`}
                              aria-label={sensor.status === "On" ? "Online" : "Offline"}
                            />
                          </div>
                          <div className="text-2xl font-extrabold">{getLatestValue(sensor)}</div>
                          <div className="text-xs text-slate-500 mt-1">{sensor.status === "On" ? "Online" : "Offline"}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
        </TabsContent>

        {/* ====== STATUS ====== */}
        <TabsContent value="status" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {sensors?.map((sensor) => (
              <div key={sensor._id} className="rounded-2xl p-[1.5px] bg-gradient-to-br from-emerald-200/70 via-teal-200/50 to-sky-200/70">
                <Card className="rounded-2xl bg-white/80 backdrop-blur">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`h-3 w-3 rounded-full ${sensor.status === "On" ? "bg-emerald-600 animate-pulse" : "bg-rose-500"}`}
                        />
                        <div className="min-w-0">
                          <div className="font-medium truncate">{sensor.name}</div>
                          <div className="text-sm text-slate-500">{sensor.sensor_type}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`rounded-full px-2 py-0.5 ${sensor.status === "On"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"}`}
                        >
                          {sensor.status === "On" ? "Online" : "Offline"}
                        </Badge>
                        <Button size="sm" variant="outline" className="rounded-xl">
                          {sensor.status === "On" ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
