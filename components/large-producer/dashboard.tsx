"use client"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, LogOut, Activity, MapPin, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { ManagementOverview } from "./management-overview"
import { SensorMonitoring } from "./sensor-monitoring"
import { SensorLocationMap } from "./sensor-location-map"
import { ZoneForm } from "./zone-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState } from "react"

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
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <ManagementOverview />
            </TabsContent>

            <TabsContent value="sensors" className="space-y-6">
              <SensorMonitoring />
            </TabsContent>
          </Tabs>
        </div>
      </div>
  )
}
