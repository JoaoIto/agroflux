"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Droplets, TrendingDown, TrendingUp, AlertTriangle, Zap } from "lucide-react"

export function ManagementOverview() {
    const [zones, setZones] = useState<IZone[]>([])
    const [cultures, setCultures] = useState<ICulture[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = async () => {
        try {
            setLoading(true)
            setError(null)

            const garden_id = localStorage.getItem('garden_id')

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

        // Refresh every 10 seconds
        const interval = setInterval(fetchData, 10000)
        return () => clearInterval(interval)
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <Droplets className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
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
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Água Gasta Hoje</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">12.450 L</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <TrendingDown className="h-3 w-3 text-success" />
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
                        <div className="text-3xl font-bold text-success">42%</div>
                        <p className="text-xs text-muted-foreground mt-1">vs. irrigação tradicional</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-accent" />
                        Insights e Previsões da IA
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-start gap-3 p-4 bg-warning/10 rounded-lg border border-warning/20">
                        <AlertTriangle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="font-medium text-sm">Campo C requer atenção</p>
                            <p className="text-sm text-muted-foreground">
                                Umidade do solo em 38%. Recomendamos irrigação de 2.500L nas próximas 3 horas. Sensor de temperatura
                                registrando 31°C.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-info/10 rounded-lg border border-info/20">
                        <Droplets className="h-5 w-5 text-info mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="font-medium text-sm">Previsão de chuva para amanhã</p>
                            <p className="text-sm text-muted-foreground">
                                85% de chance de precipitação (15-20mm). Sistema irá reduzir irrigação em 70% automaticamente. Economia
                                estimada: 8.500L
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-success/10 rounded-lg border border-success/20">
                        <TrendingUp className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="font-medium text-sm">Eficiência hídrica aumentou</p>
                            <p className="text-sm text-muted-foreground">
                                Campos A, B e E apresentaram redução de 22% no consumo de água esta semana mantendo produtividade ideal
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-accent/10 rounded-lg border border-accent/20">
                        <Zap className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="font-medium text-sm">Otimização automática ativada</p>
                            <p className="text-sm text-muted-foreground">
                                IA ajustou horários de irrigação para aproveitar menor evapotranspiração. Economia adicional de 12%
                                prevista
                            </p>
                        </div>
                    </div>
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
                                const usage = 2500 + i * 300
                                const optimal = 2800 + i * 200
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

            {cultures.map((culture) => (
                <div key={culture._id} className="p-3 rounded-lg border bg-card">
                    <div className="font-medium">{culture.name}</div>

                    <div className="text-xs text-muted-foreground mt-2">
                        {culture.optimal_conditions?.humidity_range
                            ? `${culture.optimal_conditions.humidity_range[0]} - ${culture.optimal_conditions.humidity_range[1]}`
                            : "Faixa de umidade não definida"}
                    </div>

                    <div className="text-xs text-muted-foreground mt-2">
                        {culture.optimal_conditions?.temperature_range
                            ? `${culture.optimal_conditions.temperature_range[0]} - ${culture.optimal_conditions.temperature_range[1]}`
                            : "Faixa de temperatura não definida"}
                    </div>
                </div>
            ))}

        </div>
    )
}
