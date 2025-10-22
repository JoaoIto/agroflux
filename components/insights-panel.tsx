import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sparkles, AlertTriangle, CheckCircle2, Info } from "lucide-react"

export function InsightsPanel() {
  const insights = [
    {
      type: "warning",
      icon: AlertTriangle,
      title: "Alerta de Temperatura",
      message: "Temperatura acima de 30°C prevista para amanhã. Recomendamos irrigação extra às 6h.",
      color: "text-warning",
    },
    {
      type: "success",
      icon: CheckCircle2,
      title: "Economia Detectada",
      message: "Chuva prevista para hoje à tarde. Irrigação das 14h foi cancelada automaticamente.",
      color: "text-success",
    },
    {
      type: "info",
      icon: Info,
      title: "Recomendação de Irrigação",
      message: "Baseado na evapotranspiração, recomendamos 15L/m² para os próximos 3 dias.",
      color: "text-info",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Insights da IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight, index) => (
          <Alert key={index} className="border-l-4" style={{ borderLeftColor: `var(--color-${insight.type})` }}>
            <insight.icon className={`h-4 w-4 ${insight.color}`} />
            <AlertDescription>
              <div className="font-medium mb-1">{insight.title}</div>
              <div className="text-sm text-muted-foreground">{insight.message}</div>
            </AlertDescription>
          </Alert>
        ))}
      </CardContent>
    </Card>
  )
}
