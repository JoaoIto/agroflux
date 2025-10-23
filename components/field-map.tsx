"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Droplets, ThermometerSun, Activity } from "lucide-react"
import { useEffect, useState } from "react"
import axios from "axios"

interface SoilData {
  timestamp: number
  adc: number
  umidade_percent: number
  status: string
}

interface DHTData {
  timestamp: number
  temperatura: number
  umidade: number
}

interface BombaData {
  timestamp: number
  estado: string
  modo: string
  pino: string
  ativo_em: string
}

interface GeolocationData {
  latitude: number
  longitude: number
}

export function FieldMap() {
  const [soilData, setSoilData] = useState<SoilData | null>(null)
  const [dhtData, setDHTData] = useState<DHTData | null>(null)
  const [bombaData, setBombaData] = useState<BombaData | null>(null)
  const [geolocation, setGeolocation] = useState<GeolocationData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
          (position) => {
            setGeolocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            })
          },
          (error) => {
            console.error("[v0] Erro ao obter geolocalização:", error)
          },
      )
    }
  }, [])

  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const [soilRes, dhtRes, bombaRes] = await Promise.all([
          axios.get("/api/esp32/solo"),
          axios.get("/api/esp32/dht"),
          axios.get("/api/esp32/bomba"),
        ])

        setSoilData(soilRes.data)
        setDHTData(dhtRes.data)
        setBombaData(bombaRes.data)
        setLoading(false)
      } catch (error) {
        console.error("[v0] Erro ao buscar dados dos sensores:", error)
        setLoading(false)
      }
    }

    fetchSensorData()
    const interval = setInterval(fetchSensorData, 3000)

    return () => clearInterval(interval)
  }, [])

  const fields = [
    {
      id: "A",
      name: "Sensor de Solo",
      crop: "Umidade do Solo",
      moisture: soilData?.umidade_percent || 0,
      temp: dhtData?.temperatura || 0,
      status: soilData?.status === "SECO" ? "warning" : "optimal",
      x: 25,
      y: 35,
      type: "solo",
      rawStatus: soilData?.status || "N/A",
      adc: soilData?.adc || 0,
    },
    {
      id: "B",
      name: "Sensor DHT",
      crop: "Temperatura e Umidade",
      moisture: dhtData?.umidade || 0,
      temp: dhtData?.temperatura || 0,
      status: dhtData && dhtData.temperatura > 30 ? "warning" : "optimal",
      x: 50,
      y: 30,
      type: "dht",
      airHumidity: dhtData?.umidade || 0,
    },
    {
      id: "C",
      name: "Sistema de Bomba",
      crop: "Controle de Irrigação",
      moisture: soilData?.umidade_percent || 0,
      temp: dhtData?.temperatura || 0,
      status: bombaData?.estado === "LIGADA" ? "optimal" : "warning",
      x: 75,
      y: 40,
      type: "bomba",
      pumpState: bombaData?.estado || "N/A",
      pumpMode: bombaData?.modo || "N/A",
    },
  ]

  if (loading) {
    return (
        <div className="flex items-center justify-center h-[500px]">
          <div className="text-center space-y-2">
            <Activity className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Carregando dados dos sensores...</p>
          </div>
        </div>
    )
  }

  return (
      <div className="space-y-6">
        {geolocation && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Localização Atual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="text-muted-foreground">Latitude:</span>{" "}
                    <span className="font-mono">{geolocation.latitude.toFixed(6)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Longitude:</span>{" "}
                    <span className="font-mono">{geolocation.longitude.toFixed(6)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
        )}

        <Tabs defaultValue="map" className="space-y-4">
          <TabsList>
            <TabsTrigger value="map">Mapa Geral</TabsTrigger>
            <TabsTrigger value="moisture">Mapa de Calor - Umidade</TabsTrigger>
            <TabsTrigger value="temperature">Mapa de Calor - Temperatura</TabsTrigger>
          </TabsList>

          <TabsContent value="map">
            <Card>
              <CardHeader>
                <CardTitle>Mapeamento de Sensores em Tempo Real</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative w-full h-[500px] bg-muted/30 rounded-lg border overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-success/5" />

                  <svg className="absolute inset-0 w-full h-full opacity-20">
                    <defs>
                      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>

                  {fields.map((field) => (
                      <div
                          key={field.id}
                          className="absolute group cursor-pointer"
                          style={{
                            left: `${field.x}%`,
                            top: `${field.y}%`,
                            transform: "translate(-50%, -50%)",
                          }}
                      >
                        <div
                            className={`absolute inset-0 rounded-full animate-ping ${
                                field.status === "warning" ? "bg-warning" : "bg-primary"
                            } opacity-20`}
                            style={{ width: "60px", height: "60px", left: "-30px", top: "-30px" }}
                        />

                        <div
                            className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-4 ${
                                field.status === "warning" ? "bg-warning border-warning/20" : "bg-primary border-primary/20"
                            } shadow-lg transition-transform group-hover:scale-110`}
                        >
                          <span className="text-white font-bold">{field.id}</span>
                        </div>

                        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                          <div className="bg-card border rounded-lg shadow-lg p-3 min-w-[200px]">
                            <div className="font-semibold mb-1">{field.name}</div>
                            <div className="text-xs text-muted-foreground mb-2">{field.crop}</div>
                            <div className="space-y-1 text-sm">
                              {field.type === "solo" && (
                                  <>
                                    <div className="flex items-center justify-between">
                                      <span className="text-muted-foreground">Umidade</span>
                                      <span className="font-medium">{field.moisture}%</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-muted-foreground">Status</span>
                                      <span className="font-medium">{field.rawStatus}</span>
                                    </div>
                                  </>
                              )}
                              {field.type === "dht" && (
                                  <>
                                    <div className="flex items-center justify-between">
                                      <span className="text-muted-foreground">Temperatura</span>
                                      <span className="font-medium">{field.temp}°C</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-muted-foreground">Umidade Ar</span>
                                      <span className="font-medium">{field.airHumidity}%</span>
                                    </div>
                                  </>
                              )}
                              {field.type === "bomba" && (
                                  <>
                                    <div className="flex items-center justify-between">
                                      <span className="text-muted-foreground">Estado</span>
                                      <span className="font-medium">{field.pumpState}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-muted-foreground">Modo</span>
                                      <span className="font-medium">{field.pumpMode}</span>
                                    </div>
                                  </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                  ))}

                  <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur border rounded-lg p-3 shadow-lg">
                    <div className="text-sm font-semibold mb-2">Legenda</div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <span>Operacional</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-warning" />
                        <span>Atenção</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="moisture">
            <Card>
              <CardHeader>
                <CardTitle>Mapa de Calor - Umidade do Solo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative w-full h-[500px] rounded-lg border overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-green-500/20 to-yellow-500/20" />

                  {fields.map((field) => {
                    const moistureColor =
                        field.moisture > 55
                            ? "bg-blue-500"
                            : field.moisture > 45
                                ? "bg-green-500"
                                : field.moisture > 35
                                    ? "bg-yellow-500"
                                    : "bg-red-500"

                    return (
                        <div
                            key={field.id}
                            className="absolute"
                            style={{
                              left: `${field.x}%`,
                              top: `${field.y}%`,
                              transform: "translate(-50%, -50%)",
                            }}
                        >
                          <div
                              className={`${moistureColor} opacity-40 rounded-full blur-3xl`}
                              style={{ width: "200px", height: "200px" }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-card border rounded-lg p-3 shadow-lg text-center">
                              <div className="font-bold text-lg">{field.id}</div>
                              <div className="text-2xl font-bold">{field.moisture}%</div>
                              <div className="text-xs text-muted-foreground">{field.crop}</div>
                            </div>
                          </div>
                        </div>
                    )
                  })}

                  <div className="absolute bottom-4 right-4 bg-card/95 backdrop-blur border rounded-lg p-3 shadow-lg">
                    <div className="text-sm font-semibold mb-2">Escala de Umidade</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-blue-500" />
                        <span>&gt; 55% - Muito Úmido</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-500" />
                        <span>45-55% - Ideal</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-yellow-500" />
                        <span>35-45% - Baixo</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-red-500" />
                        <span>&lt; 35% - Crítico</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="temperature">
            <Card>
              <CardHeader>
                <CardTitle>Mapa de Calor - Temperatura</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative w-full h-[500px] rounded-lg border overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-orange-500/20 to-red-500/20" />

                  {fields.map((field) => {
                    const tempColor =
                        field.temp > 30
                            ? "bg-red-500"
                            : field.temp > 27
                                ? "bg-orange-500"
                                : field.temp > 24
                                    ? "bg-yellow-500"
                                    : "bg-blue-500"

                    return (
                        <div
                            key={field.id}
                            className="absolute"
                            style={{
                              left: `${field.x}%`,
                              top: `${field.y}%`,
                              transform: "translate(-50%, -50%)",
                            }}
                        >
                          <div
                              className={`${tempColor} opacity-40 rounded-full blur-3xl`}
                              style={{ width: "200px", height: "200px" }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-card border rounded-lg p-3 shadow-lg text-center">
                              <div className="font-bold text-lg">{field.id}</div>
                              <div className="text-2xl font-bold">{field.temp}°C</div>
                              <div className="text-xs text-muted-foreground">{field.crop}</div>
                            </div>
                          </div>
                        </div>
                    )
                  })}

                  <div className="absolute bottom-4 right-4 bg-card/95 backdrop-blur border rounded-lg p-3 shadow-lg">
                    <div className="text-sm font-semibold mb-2">Escala de Temperatura</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-red-500" />
                        <span>&gt; 30°C - Muito Quente</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-orange-500" />
                        <span>27-30°C - Quente</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-yellow-500" />
                        <span>24-27°C - Ideal</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-blue-500" />
                        <span>&lt; 24°C - Frio</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fields.map((field) => (
              <Card key={field.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  {field.name}
                </span>
                    <Badge
                        variant="outline"
                        className={field.status === "warning" ? "bg-warning/10 text-warning" : "bg-success/10 text-success"}
                    >
                      {field.status === "warning" ? "Atenção" : "OK"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground">{field.crop}</div>
                  <div className="grid grid-cols-2 gap-3">
                    {field.type === "solo" && (
                        <>
                          <div className="p-3 rounded-lg border bg-card">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                              <Droplets className="h-3 w-3" />
                              Umidade
                            </div>
                            <div className="text-xl font-bold">{field.moisture}%</div>
                          </div>
                          <div className="p-3 rounded-lg border bg-card">
                            <div className="text-xs text-muted-foreground mb-1">Status</div>
                            <div className="text-xl font-bold">{field.rawStatus}</div>
                          </div>
                          <div className="p-3 rounded-lg border bg-card col-span-2">
                            <div className="text-xs text-muted-foreground mb-1">ADC</div>
                            <div className="text-xl font-bold">{field.adc}</div>
                          </div>
                        </>
                    )}
                    {field.type === "dht" && (
                        <>
                          <div className="p-3 rounded-lg border bg-card">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                              <ThermometerSun className="h-3 w-3" />
                              Temperatura
                            </div>
                            <div className="text-xl font-bold">{field.temp}°C</div>
                          </div>
                          <div className="p-3 rounded-lg border bg-card">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                              <Droplets className="h-3 w-3" />
                              Umidade Ar
                            </div>
                            <div className="text-xl font-bold">{field.airHumidity}%</div>
                          </div>
                        </>
                    )}
                    {field.type === "bomba" && (
                        <>
                          <div className="p-3 rounded-lg border bg-card">
                            <div className="text-xs text-muted-foreground mb-1">Estado</div>
                            <div className="text-lg font-bold">{field.pumpState}</div>
                          </div>
                          <div className="p-3 rounded-lg border bg-card">
                            <div className="text-xs text-muted-foreground mb-1">Modo</div>
                            <div className="text-lg font-bold">{field.pumpMode}</div>
                          </div>
                        </>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground pt-2 border-t">Atualização em tempo real (3s)</div>
                </CardContent>
              </Card>
          ))}
        </div>
      </div>
  )
}
