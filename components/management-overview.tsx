"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Droplets, TrendingDown, TrendingUp, AlertTriangle, Zap } from "lucide-react"

export function ManagementOverview() {
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
          <CardTitle>Consumo de Água por Campo - Últimas 24h</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { field: "Campo A", crop: "Tomate", area: "2.5 ha", usage: 2850, optimal: 3000, status: "optimal" },
              { field: "Campo B", crop: "Milho", area: "3.2 ha", usage: 3200, optimal: 3500, status: "optimal" },
              { field: "Campo C", crop: "Soja", area: "2.8 ha", usage: 3100, optimal: 2800, status: "warning" },
              { field: "Campo D", crop: "Alface", area: "1.5 ha", usage: 1450, optimal: 1500, status: "optimal" },
              { field: "Campo E", crop: "Cenoura", area: "1.8 ha", usage: 1850, optimal: 2000, status: "optimal" },
            ].map((field, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      field.status === "warning" ? "bg-warning" : "bg-success"
                    } flex-shrink-0`}
                  />
                  <div className="min-w-[100px]">
                    <div className="font-medium">{field.field}</div>
                    <div className="text-xs text-muted-foreground">{field.crop}</div>
                  </div>
                  <div className="text-sm text-muted-foreground min-w-[60px]">{field.area}</div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <span className="text-muted-foreground">Usado: </span>
                    <span className="font-medium">{field.usage}L</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ideal: </span>
                    <span className="font-medium">{field.optimal}L</span>
                  </div>
                  <div className="min-w-[80px] text-right">
                    {field.usage > field.optimal ? (
                      <span className="text-warning font-medium">
                        +{((field.usage / field.optimal - 1) * 100).toFixed(0)}%
                      </span>
                    ) : (
                      <span className="text-success font-medium">
                        -{((1 - field.usage / field.optimal) * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
