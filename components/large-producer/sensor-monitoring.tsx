"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Droplets, Power, PowerOff, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

type Sensor = {
    _id: { $oid: string }
    name: string
    sensor_type: string
    status: string
    location: { latitude: number; longitude: number }
    zone_id: string
    data: Array<{ timestamp: { $date: string }; value: number }>
}

export function SensorMonitoring() {
    const [sensors, setSensors] = useState<Sensor[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [sensorData, setSensorData] = useState({
        soilMoisture: 45,
        temperature: 28,
        humidity: 65,
        evapotranspiration: 4.2,
        windSpeed: 12,
    })

    useEffect(() => {
        const fetchSensors = async () => {
            try {
                setLoading(true)
                setError(null)
                const response = await axios.get("/api/sensors?zone_id=68f90ebdd48e8e21583df061")
                setSensors(response.data)
            } catch (err) {
                console.error("[v0] Error fetching sensors:", err)
                setError("Erro ao carregar sensores")
            } finally {
                setLoading(false)
            }
        }

        fetchSensors()

        // Refresh every 3 seconds for real-time data
        const interval = setInterval(fetchSensors, 3000)
        return () => clearInterval(interval)
    }, [])

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
                    <Droplets className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
                    <p className="text-muted-foreground">Carregando sensores...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
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

    const getLatestValue = (sensor: Sensor) => {
        if (sensor.data && sensor.data.length > 0) {
            return sensor.data[sensor.data.length - 1].value
        }
        return 0
    }

    const sensorsByType = sensors?.reduce(
        (acc, sensor) => {
            if (!acc[sensor.sensor_type]) {
                acc[sensor.sensor_type] = []
            }
            acc[sensor.sensor_type].push(sensor)
            return acc
        },
        {} as Record<string, Sensor[]>,
    )

    return (
        <div className="space-y-6">
            <Tabs defaultValue="all" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="all">Todos os Sensores</TabsTrigger>
                    <TabsTrigger value="type">Por Tipo</TabsTrigger>
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

                    <div className="grid md:grid-cols-2 gap-4">
                        {sensors?.map((sensor) => (
                            <Card key={sensor._id.$oid}>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center justify-between">
                                        <span>{sensor.name}</span>
                                        <Badge
                                            variant="outline"
                                            className={
                                                sensor.status === "On" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                                            }
                                        >
                                            {sensor.status}
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Tipo:</span>
                                            <span className="font-medium">{sensor.sensor_type}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Última leitura:</span>
                                            <span className="font-medium text-lg">{getLatestValue(sensor)}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Localização:</span>
                                            <span className="font-medium text-xs">
                        {sensor.location.latitude.toFixed(4)}, {sensor.location.longitude.toFixed(4)}
                      </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="type" className="space-y-4">
                    {sensorsByType &&
                        Object.entries(sensorsByType).map(([type, typeSensors]) => (
                            <Card key={type}>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center justify-between">
                                        <span>{type}</span>
                                        <Badge variant="outline" className="bg-primary/10 text-primary">
                                            {typeSensors.length} {typeSensors.length === 1 ? "Sensor" : "Sensores"}
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-3 gap-3">
                                        {typeSensors.map((sensor) => (
                                            <div key={sensor._id.$oid} className="p-3 rounded-lg border bg-card">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-medium text-sm">{sensor.name}</span>
                                                    <div
                                                        className={`h-2 w-2 rounded-full ${sensor.status === "On" ? "bg-success animate-pulse" : "bg-destructive"}`}
                                                    />
                                                </div>
                                                <div className="text-2xl font-bold">{getLatestValue(sensor)}</div>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {sensor.status === "On" ? "Online" : "Offline"}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                </TabsContent>

                <TabsContent value="status" className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        {sensors?.map((sensor) => (
                            <Card key={sensor._id.$oid}>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`h-3 w-3 rounded-full ${sensor.status === "On" ? "bg-success animate-pulse" : "bg-destructive"}`}
                                            />
                                            <div>
                                                <div className="font-medium">{sensor.name}</div>
                                                <div className="text-sm text-muted-foreground">{sensor.sensor_type}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant="outline"
                                                className={
                                                    sensor.status === "On" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                                                }
                                            >
                                                {sensor.status === "On" ? "Online" : "Offline"}
                                            </Badge>
                                            <Button size="sm" variant="outline">
                                                {sensor.status === "On" ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
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
