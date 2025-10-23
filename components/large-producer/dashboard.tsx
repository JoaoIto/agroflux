"use client"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, LogOut, Activity, MapPin, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { ManagementOverview } from "./management-overview"
import { SensorMonitoring } from "./sensor-monitoring"
import { FieldMap } from "./field-map"
import { ZoneForm } from "./zone-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState } from "react"

export function LargeProducerDashboard() {
  const router = useRouter()
  const [showZoneForm, setShowZoneForm] = useState(false)

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,rgba(16,185,129,0.06),rgba(14,165,233,0.06))]">
      {/* HEADER sticky com faixa gradiente e controles responsivos */}
      <header className="sticky top-0 z-30 border-b bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500" />
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-xl ring-2 ring-emerald-400/40 bg-white flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-emerald-600" />
              </div>
              <span className="text-lg sm:text-xl font-semibold tracking-tight">Olá João Carlos!</span>
            </div>

            {/* ações desktop */}
            <div className="hidden sm:flex items-center gap-2">
              <Dialog open={showZoneForm} onOpenChange={setShowZoneForm}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-2 rounded-xl border-emerald-300/60 bg-white/70 hover:bg-emerald-50"
                  >
                    <Plus className="h-4 w-4 text-emerald-700" />
                    Cadastrar Zona
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl">
                  <DialogHeader>
                    <DialogTitle className="bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent">
                      Cadastrar Nova Zona e Sensores
                    </DialogTitle>
                  </DialogHeader>
                  <ZoneForm />
                </DialogContent>
              </Dialog>

              <div className="hidden md:flex items-center gap-2 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm text-emerald-700">Sistema Online</span>
              </div>

              <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="rounded-xl">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* ações mobile */}
          <div className="mt-3 grid grid-cols-[1fr_auto_auto] items-center gap-2 sm:hidden">
            <Dialog open={showZoneForm} onOpenChange={setShowZoneForm}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="col-span-1 w-full gap-2 rounded-xl border-emerald-300/60 bg-white/70"
                >
                  <Plus className="h-4 w-4 text-emerald-700" />
                  Cadastrar Zona
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent">
                    Cadastrar Nova Zona e Sensores
                  </DialogTitle>
                </DialogHeader>
                <ZoneForm />
              </DialogContent>
            </Dialog>

            <div className="flex items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse mr-2" />
              <span className="text-xs text-emerald-700">Online</span>
            </div>

            <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="rounded-xl">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* CONTEÚDO */}
      <div
        className="container mx-auto px-4 pb-8 pt-6"
        style={{ paddingBottom: "calc(24px + env(safe-area-inset-bottom))" }}
      >
        <Tabs defaultValue="overview" className="space-y-6">
          {/* Tabs “pill/segmented” scrolláveis no mobile */}
          <TabsList
            className="w-full justify-start sm:justify-center overflow-x-auto no-scrollbar flex gap-2 sm:gap-3 p-1 rounded-2xl bg-white/70 backdrop-blur border border-slate-200"
          >
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-sky-600
                         data-[state=active]:text-white rounded-xl px-3 sm:px-4 py-2 text-sm whitespace-nowrap"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Gestão e Dados
            </TabsTrigger>

            <TabsTrigger
              value="sensors"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-sky-600
                         data-[state=active]:text-white rounded-xl px-3 sm:px-4 py-2 text-sm whitespace-nowrap"
            >
              <Activity className="h-4 w-4 mr-2" />
              Sensores em Tempo Real
            </TabsTrigger>

            <TabsTrigger
              value="map"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-sky-600
                         data-[state=active]:text-white rounded-xl px-3 sm:px-4 py-2 text-sm whitespace-nowrap"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Mapeamento
            </TabsTrigger>
          </TabsList>

          {/* conteúdos (só layout/box) */}
          <TabsContent value="overview" className="space-y-6">
            <div className="rounded-2xl p-[1.5px] bg-gradient-to-br from-emerald-200/70 via-teal-200/50 to-sky-200/70">
              <div className="rounded-2xl bg-white/80 backdrop-blur p-4 sm:p-6">
                <ManagementOverview />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sensors" className="space-y-6">
            <div className="rounded-2xl p-[1.5px] bg-gradient-to-br from-emerald-200/70 via-teal-200/50 to-sky-200/70">
              <div className="rounded-2xl bg-white/80 backdrop-blur p-4 sm:p-6">
                <SensorMonitoring />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="map" className="space-y-6">
            <div className="rounded-2xl p-[1.5px] bg-gradient-to-br from-emerald-200/70 via-teal-200/50 to-sky-200/70">
              <div className="rounded-2xl bg-white/80 backdrop-blur p-4 sm:p-6">
                <FieldMap />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
