"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Droplets, Thermometer, Power, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SoloData {
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

export function SensorMonitoring() {
  const [soloData, setSoloData] = useState<SoloData | null>(null)
  const [dhtData, setDHTData] = useState<DHTData | null>(null)
  const [bombaData, setBombaData] = useState<BombaData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchESP32Data = async () => {
    try {
      const [soloRes, dhtRes, bombaRes] = await Promise.all([
        axios.get("/api/esp32/solo"),
        axios.get("/api/esp32/dht"),
        axios.get("/api/esp32/bomba"),
      ])

      setSoloData(soloRes.data)
      setDHTData(dhtRes.data)
      setBombaData(bombaRes.data)
      setLoading(false)
      setError(null)
    } catch (err) {
      console.error("[v0] Error fetching ESP32 data:", err)
      setError("Erro ao conectar com ESP32")
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchESP32Data()
    const interval = setInterval(fetchESP32Data, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleToggleBomba = async () => {
    if (!bombaData) return

    const action = bombaData.estado === "LIGADA" ? "desligar" : "ligar"

    try {
      await axios.post("/api/esp32/bomba", { action })
      await fetchESP32Data()
    } catch (err) {
      console.error(`[v0] Error toggling pump:`, err)
      setError("Erro ao controlar bomba")
    }
  }

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
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
    )
  }

  return (
      <div className="space-y-6">
        {bombaData && (
            <div className="rounded-2xl p-[1.5px] bg-gradient-to-br from-emerald-200/70 via-teal-200/50 to-sky-200/70">
              <Card className="rounded-2xl bg-white/80 backdrop-blur shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>Controle da Bomba</span>
                    <Badge
                        variant="outline"
                        className={`rounded-full px-2 py-0.5 ${
                            bombaData.estado === "LIGADA"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-50 text-slate-700 border-slate-200"
                        }`}
                    >
                      {bombaData.estado}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-slate-500">Modo:</span>
                        <p className="font-medium">{bombaData.modo}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Pino:</span>
                        <p className="font-medium">{bombaData.pino}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Ativo em:</span>
                        <p className="font-medium">{bombaData.ativo_em}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Timestamp:</span>
                        <p className="font-medium">{bombaData.timestamp}</p>
                      </div>
                    </div>
                    <Button
                        onClick={handleToggleBomba}
                        className={`w-full rounded-xl ${
                            bombaData.estado === "LIGADA"
                                ? "bg-rose-600 hover:bg-rose-500"
                                : "bg-emerald-600 hover:bg-emerald-500"
                        }`}
                    >
                      <Power className="h-4 w-4 mr-2" />
                      {bombaData.estado === "LIGADA" ? "Desligar Bomba" : "Ligar Bomba"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {soloData && (
              <div className="rounded-2xl p-[1.5px] bg-gradient-to-br from-emerald-200/70 via-teal-200/50 to-sky-200/70">
                <Card className="rounded-2xl bg-white/80 backdrop-blur">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Droplets className="h-5 w-5 text-emerald-600" />
                      Sensor de Umidade do Solo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Umidade:</span>
                        <span className="text-3xl font-extrabold">{soloData.umidade_percent}%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Status:</span>
                        <Badge
                            variant="outline"
                            className={`rounded-full ${
                                soloData.status === "SECO"
                                    ? "bg-rose-50 text-rose-700 border-rose-200"
                                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                        >
                          {soloData.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">ADC:</span>
                        <span className="font-medium">{soloData.adc}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Timestamp:</span>
                        <span className="font-medium">{soloData.timestamp}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
          )}

          {dhtData && (
              <div className="rounded-2xl p-[1.5px] bg-gradient-to-br from-amber-200/70 via-orange-200/50 to-rose-200/70">
                <Card className="rounded-2xl bg-white/80 backdrop-blur">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Thermometer className="h-5 w-5 text-orange-600" />
                      Sensor DHT (Temperatura e Umidade)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Temperatura:</span>
                        <span className="text-3xl font-extrabold">{dhtData.temperatura}°C</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Umidade do Ar:</span>
                        <span className="text-3xl font-extrabold">{dhtData.umidade}%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Timestamp:</span>
                        <span className="font-medium">{dhtData.timestamp}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
          )}
        </div>
      </div>
  )
}
