"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Droplets, ThermometerSun } from "lucide-react"

export function FieldMap() {
  const fields = [
    { id: "A", name: "Campo A", crop: "Tomate", moisture: 52, temp: 27, status: "optimal", x: 20, y: 30 },
    { id: "B", name: "Campo B", crop: "Milho",  moisture: 48, temp: 29, status: "optimal", x: 45, y: 25 },
    { id: "C", name: "Campo C", crop: "Soja",   moisture: 38, temp: 31, status: "warning", x: 70, y: 35 },
    { id: "D", name: "Campo D", crop: "Alface", moisture: 55, temp: 26, status: "optimal", x: 30, y: 60 },
    { id: "E", name: "Campo E", crop: "Cenoura",moisture: 61, temp: 28, status: "optimal", x: 60, y: 65 },
  ]

  return (
    <div className="space-y-6">
      <Tabs defaultValue="map" className="space-y-4">
        {/* Tabs “pill” com scroll horizontal no mobile */}
        <TabsList
          className="w-full justify-start sm:justify-center overflow-x-auto no-scrollbar flex gap-2 sm:gap-3 p-1 rounded-2xl bg-white/70 backdrop-blur border border-slate-200"
        >
          <TabsTrigger
            value="map"
            className="rounded-xl px-3 sm:px-4 py-2 text-sm whitespace-nowrap
                       data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-sky-600 data-[state=active]:text-white"
          >
            Mapa Geral
          </TabsTrigger>
          <TabsTrigger
            value="moisture"
            className="rounded-xl px-3 sm:px-4 py-2 text-sm whitespace-nowrap
                       data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-sky-600 data-[state=active]:text-white"
          >
            Mapa de Calor — Umidade
          </TabsTrigger>
          <TabsTrigger
            value="temperature"
            className="rounded-xl px-3 sm:px-4 py-2 text-sm whitespace-nowrap
                       data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-sky-600 data-[state=active]:text-white"
          >
            Mapa de Calor — Temperatura
          </TabsTrigger>
        </TabsList>

        {/* ==== MAPA GERAL ==== */}
        <TabsContent value="map">
          <div className="rounded-2xl p-[1.5px] bg-gradient-to-br from-emerald-200/70 via-teal-200/50 to-sky-200/70">
            <Card className="rounded-2xl bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent font-semibold">
                  Mapeamento de Campos em Tempo Real
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Área do mapa: altura confortável no mobile e maior no desktop */}
                <div className="relative w-full h-[380px] sm:h-[460px] md:h-[520px] rounded-2xl border overflow-hidden bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.10),transparent_60%),radial-gradient(ellipse_at_bottom_right,rgba(14,165,233,0.10),transparent_60%)]">
                  {/* grade sutil */}
                  <svg className="absolute inset-0 w-full h-full opacity-20 text-slate-400">
                    <defs>
                      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>

                  {/* pinos dos campos */}
                  {fields.map((f) => (
                    <div
                      key={f.id}
                      className="absolute group cursor-pointer"
                      style={{ left: `${f.x}%`, top: `${f.y}%`, transform: "translate(-50%, -50%)" }}
                    >
                      {/* aura animada */}
                      <span
                        className={`absolute -left-7 -top-7 h-14 w-14 rounded-full animate-ping opacity-25 ${f.status === "warning" ? "bg-amber-400" : "bg-emerald-500"}`}
                      />
                      {/* pino */}
                      <div
                        className={`relative z-10 h-11 w-11 rounded-full flex items-center justify-center border-4 shadow-lg transition-transform group-hover:scale-110
                                   ${f.status === "warning" ? "bg-amber-500 border-amber-200/60" : "bg-emerald-600 border-emerald-200/60"}`}
                        aria-label={`${f.name} — ${f.crop}`}
                      >
                        <span className="text-white font-bold">{f.id}</span>
                      </div>
                      {/* tooltip */}
                      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                        <div className="bg-white/90 backdrop-blur border rounded-xl shadow-xl p-3 min-w-[200px]">
                          <div className="font-semibold mb-1">{f.name}</div>
                          <div className="text-xs text-slate-500 mb-2">{f.crop}</div>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1 text-slate-500">
                                <Droplets className="h-3 w-3" /> Umidade
                              </span>
                              <span className="font-medium">{f.moisture}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1 text-slate-500">
                                <ThermometerSun className="h-3 w-3" /> Temperatura
                              </span>
                              <span className="font-medium">{f.temp}°C</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* legenda */}
                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur border rounded-xl p-3 shadow-lg">
                    <div className="text-sm font-semibold mb-2">Legenda</div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-600" />
                        <span>Operacional</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-amber-500" />
                        <span>Atenção</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ==== MAPA DE CALOR — UMIDADE ==== */}
        <TabsContent value="moisture">
          <div className="rounded-2xl p-[1.5px] bg-gradient-to-br from-emerald-200/70 via-teal-200/50 to-sky-200/70">
            <Card className="rounded-2xl bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent font-semibold">
                  Mapa de Calor — Umidade do Solo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative w-full h-[380px] sm:h-[460px] md:h-[520px] rounded-2xl border overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-sky-500/15 via-emerald-500/12 to-yellow-500/15" />
                  {fields.map((f) => {
                    const color =
                      f.moisture > 55 ? "bg-sky-500" :
                      f.moisture > 45 ? "bg-emerald-500" :
                      f.moisture > 35 ? "bg-yellow-500" : "bg-rose-500"
                    return (
                      <div
                        key={f.id}
                        className="absolute"
                        style={{ left: `${f.x}%`, top: `${f.y}%`, transform: "translate(-50%, -50%)" }}
                      >
                        <div className={`${color} opacity-40 rounded-full blur-3xl`} style={{ width: 200, height: 200 }} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-white/90 backdrop-blur border rounded-xl p-3 shadow-lg text-center">
                            <div className="font-bold text-lg">{f.id}</div>
                            <div className="text-2xl font-extrabold">{f.moisture}%</div>
                            <div className="text-xs text-slate-500">{f.crop}</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur border rounded-xl p-3 shadow-lg">
                    <div className="text-sm font-semibold mb-2">Escala de Umidade</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-sky-500" /> &gt; 55% — Muito Úmido</div>
                      <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-emerald-500" /> 45–55% — Ideal</div>
                      <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-yellow-500" /> 35–45% — Baixo</div>
                      <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-rose-500" /> &lt; 35% — Crítico</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ==== MAPA DE CALOR — TEMPERATURA ==== */}
        <TabsContent value="temperature">
          <div className="rounded-2xl p-[1.5px] bg-gradient-to-br from-emerald-200/70 via-teal-200/50 to-sky-200/70">
            <Card className="rounded-2xl bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent font-semibold">
                  Mapa de Calor — Temperatura
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative w-full h-[380px] sm:h-[460px] md:h-[520px] rounded-2xl border overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-sky-500/15 via-amber-500/15 to-rose-500/15" />
                  {fields.map((f) => {
                    const color =
                      f.temp > 30 ? "bg-rose-500" :
                      f.temp > 27 ? "bg-amber-500" :
                      f.temp > 24 ? "bg-yellow-500" : "bg-sky-500"
                    return (
                      <div
                        key={f.id}
                        className="absolute"
                        style={{ left: `${f.x}%`, top: `${f.y}%`, transform: "translate(-50%, -50%)" }}
                      >
                        <div className={`${color} opacity-40 rounded-full blur-3xl`} style={{ width: 200, height: 200 }} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-white/90 backdrop-blur border rounded-xl p-3 shadow-lg text-center">
                            <div className="font-bold text-lg">{f.id}</div>
                            <div className="text-2xl font-extrabold">{f.temp}°C</div>
                            <div className="text-xs text-slate-500">{f.crop}</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur border rounded-xl p-3 shadow-lg">
                    <div className="text-sm font-semibold mb-2">Escala de Temperatura</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-rose-500" /> &gt; 30°C — Muito Quente</div>
                      <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-amber-500" /> 27–30°C — Quente</div>
                      <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-yellow-500" /> 24–27°C — Ideal</div>
                      <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-sky-500" /> &lt; 24°C — Frio</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Cartões dos campos (responsivos) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {fields.map((f) => (
          <div key={f.id} className="bg-gradient-to-br from-emerald-200/70 via-teal-200/50 to-sky-200/70 p-[1.5px] rounded-2xl">
            <Card className="rounded-2xl bg-white/80 backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    {f.name}
                  </span>
                  <Badge
                    variant="outline"
                    className={`rounded-full px-2 py-0.5 ${f.status === "warning"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}
                  >
                    {f.status === "warning" ? "Atenção" : "OK"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-slate-600">Cultura: {f.crop}</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl border bg-white/70">
                    <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                      <Droplets className="h-3 w-3" /> Umidade
                    </div>
                    <div className="text-xl font-bold">{f.moisture}%</div>
                  </div>
                  <div className="p-3 rounded-xl border bg-white/70">
                    <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                      <ThermometerSun className="h-3 w-3" /> Temperatura
                    </div>
                    <div className="text-xl font-bold">{f.temp}°C</div>
                  </div>
                </div>
                <div className="text-xs text-slate-500 pt-2 border-t">Última atualização: há 2 minutos</div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
