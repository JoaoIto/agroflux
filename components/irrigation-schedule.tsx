import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Droplets } from "lucide-react"

interface IrrigationScheduleProps {
  detailed?: boolean
}

export function IrrigationSchedule({ detailed = false }: IrrigationScheduleProps) {
  const schedule = [
    { time: "06:00", amount: "12L/m²", status: "completed", day: "Hoje" },
    { time: "18:00", amount: "10L/m²", status: "scheduled", day: "Hoje" },
    { time: "06:00", amount: "15L/m²", status: "scheduled", day: "Amanhã" },
    { time: "14:00", amount: "0L/m²", status: "cancelled", day: "Amanhã", reason: "Previsão de chuva" },
    { time: "18:00", amount: "12L/m²", status: "scheduled", day: "Amanhã" },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success/10 text-success border-success/20"
      case "scheduled":
        return "bg-info/10 text-info border-info/20"
      case "cancelled":
        return "bg-muted text-muted-foreground border-border"
      default:
        return "bg-muted"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Concluído"
      case "scheduled":
        return "Agendado"
      case "cancelled":
        return "Cancelado"
      default:
        return status
    }
  }

  if (!detailed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Próximas Irrigações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {schedule.slice(0, 3).map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <Droplets className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">{item.time}</div>
                    <div className="text-sm text-muted-foreground">{item.day}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{item.amount}</div>
                  <Badge variant="outline" className={getStatusColor(item.status)}>
                    {getStatusLabel(item.status)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {schedule.map((item, index) => (
        <div key={index} className="flex items-start gap-4 p-4 rounded-lg border bg-card">
          <div className="flex-shrink-0 w-20 text-center">
            <div className="text-2xl font-bold">{item.time}</div>
            <div className="text-xs text-muted-foreground">{item.day}</div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="h-4 w-4 text-primary" />
              <span className="font-semibold">{item.amount}</span>
              <Badge variant="outline" className={getStatusColor(item.status)}>
                {getStatusLabel(item.status)}
              </Badge>
            </div>
            {item.reason && <p className="text-sm text-muted-foreground">{item.reason}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}
