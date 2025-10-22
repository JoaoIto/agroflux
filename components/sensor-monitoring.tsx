"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Droplets, ThermometerSun, Wind, Power, PowerOff } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SensorMonitoring() {
  const [sensorData, setSensorData] = useState({
    soilMoisture: 45,
    temperature: 28,
    humidity: 65,
    evapotranspiration: 4.2,
    windSpeed: 12,
  })

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

  return (
    <div className="space-y-6">
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todos os Sensores</TabsTrigger>
          <TabsTrigger value="crop">Por Cultura</TabsTrigger>
          <TabsTrigger value="zone">Por Zona</TabsTrigger>
          <TabsTrigger value="status">Status On/Off</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Umidade do Solo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{sensorData.soilMoisture.toFixed(1)}%</div>
                <p className="text-xs text-success mt-1">Atualizado agora</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Temperatura</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{sensorData.temperature.toFixed(1)}°C</div>
                <p className="text-xs text-success mt-1">Atualizado agora</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Umidade do Ar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{sensorData.humidity.toFixed(1)}%</div>
                <p className="text-xs text-success mt-1">Atualizado agora</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Evapotranspiração</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{sensorData.evapotranspiration.toFixed(1)} mm</div>
                <p className="text-xs text-success mt-1">Atualizado agora</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Vento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{sensorData.windSpeed.toFixed(1)} km/h</div>
                <p className="text-xs text-success mt-1">Atualizado agora</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="crop" className="space-y-4">
          {[
            { crop: "Tomate", field: "Campo A", sensors: 5, active: 5 },
            { crop: "Milho", field: "Campo B", sensors: 6, active: 6 },
            { crop: "Soja", field: "Campo C", sensors: 5, active: 4 },
            { crop: "Alface", field: "Campo D", sensors: 4, active: 4 },
            { crop: "Cenoura", field: "Campo E", sensors: 5, active: 5 },
          ].map((item, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span>
                    {item.crop} - {item.field}
                  </span>
                  <Badge
                    variant="outline"
                    className={
                      item.active === item.sensors ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                    }
                  >
                    {item.active}/{item.sensors} Ativos
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-3">
                  {["Umidade Solo", "Temperatura", "Umidade Ar", "Evapotransp.", "Vento"].map((sensor, j) => (
                    <div key={j} className="text-center p-3 rounded-lg border bg-card">
                      <div
                        className={`h-2 w-2 rounded-full mx-auto mb-2 ${i === 2 && j === 3 ? "bg-destructive" : "bg-success"}`}
                      />
                      <div className="text-xs font-medium">{sensor}</div>
                      <div className="text-lg font-bold mt-1">
                        {j === 0 && `${(45 + i * 3).toFixed(0)}%`}
                        {j === 1 && `${(27 + i).toFixed(0)}°C`}
                        {j === 2 && `${(62 + i * 2).toFixed(0)}%`}
                        {j === 3 && `${(4.0 + i * 0.2).toFixed(1)}mm`}
                        {j === 4 && `${(11 + i).toFixed(0)}km/h`}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="zone" className="space-y-4">
          {["Zona Norte", "Zona Sul", "Zona Leste", "Zona Oeste", "Zona Central"].map((zone, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="text-base">{zone}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <Droplets className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Umidade Média</span>
                    </div>
                    <div className="text-2xl font-bold">{(48 + i * 2).toFixed(0)}%</div>
                  </div>
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <ThermometerSun className="h-4 w-4 text-warning" />
                      <span className="text-sm font-medium">Temp. Média</span>
                    </div>
                    <div className="text-2xl font-bold">{(26 + i).toFixed(0)}°C</div>
                  </div>
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <Wind className="h-4 w-4 text-info" />
                      <span className="text-sm font-medium">Vento Médio</span>
                    </div>
                    <div className="text-2xl font-bold">{(10 + i * 2).toFixed(0)} km/h</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { id: "S001", type: "Umidade Solo", field: "Campo A", status: true },
              { id: "S002", type: "Temperatura", field: "Campo A", status: true },
              { id: "S003", type: "Umidade Ar", field: "Campo A", status: true },
              { id: "S004", type: "Evapotranspiração", field: "Campo A", status: true },
              { id: "S005", type: "Vento", field: "Campo A", status: true },
              { id: "S006", type: "Umidade Solo", field: "Campo B", status: true },
              { id: "S007", type: "Temperatura", field: "Campo B", status: true },
              { id: "S008", type: "Umidade Ar", field: "Campo B", status: true },
              { id: "S009", type: "Evapotranspiração", field: "Campo B", status: true },
              { id: "S010", type: "Vento", field: "Campo B", status: true },
              { id: "S011", type: "Umidade Solo", field: "Campo C", status: true },
              { id: "S012", type: "Temperatura", field: "Campo C", status: true },
              { id: "S013", type: "Umidade Ar", field: "Campo C", status: true },
              { id: "S014", type: "Evapotranspiração", field: "Campo C", status: false },
              { id: "S015", type: "Vento", field: "Campo C", status: true },
            ].map((sensor) => (
              <Card key={sensor.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-3 w-3 rounded-full ${sensor.status ? "bg-success animate-pulse" : "bg-destructive"}`}
                      />
                      <div>
                        <div className="font-medium">
                          {sensor.id} - {sensor.type}
                        </div>
                        <div className="text-sm text-muted-foreground">{sensor.field}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={sensor.status ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}
                      >
                        {sensor.status ? "Online" : "Offline"}
                      </Badge>
                      <Button size="sm" variant="outline">
                        {sensor.status ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
