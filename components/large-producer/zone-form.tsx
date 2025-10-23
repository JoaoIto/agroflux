"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, MapPin } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { SensorLocationMap } from "./sensor-location-map"

interface Sensor {
  id: string
  type: string
  lat: number
  lng: number
}

interface Area {
  id: string
  name: string
  crop: string
  size: number
  sensors: Sensor[]
}

export function ZoneForm() {
  const [zoneName, setZoneName] = useState("")
  const [areas, setAreas] = useState<Area[]>([])
  const [currentArea, setCurrentArea] = useState<Partial<Area>>({})
  const [selectedSensorTypes, setSelectedSensorTypes] = useState<string[]>([])
  const [showMapDialog, setShowMapDialog] = useState(false)
  const [currentSensorType, setCurrentSensorType] = useState("")

  const sensorTypes = [
    { id: "soil-moisture", label: "Umidade do Solo" },
    { id: "temperature", label: "Temperatura" },
    { id: "air-humidity", label: "Umidade do Ar" },
    { id: "evapotranspiration", label: "Evapotranspiração" },
    { id: "wind", label: "Vento" },
    { id: "rain", label: "Pluviômetro" },
    { id: "light", label: "Luminosidade" },
  ]

  const handleAddSensorLocation = (lat: number, lng: number) => {
    if (!currentArea.sensors) currentArea.sensors = []
    const newSensor: Sensor = { id: `S${Date.now()}`, type: currentSensorType, lat, lng }
    setCurrentArea({
      ...currentArea,
      sensors: [...currentArea.sensors, newSensor],
    })
    setShowMapDialog(false)
  }

  const handleAddArea = () => {
    if (currentArea.name && currentArea.crop && currentArea.size) {
      const newArea: Area = {
        id: `A${Date.now()}`,
        name: currentArea.name,
        crop: currentArea.crop,
        size: currentArea.size,
        sensors: currentArea.sensors || [],
      }
      setAreas([...areas, newArea])
      setCurrentArea({})
      setSelectedSensorTypes([])
    }
  }

  const handleRemoveArea = (areaId: string) => setAreas(areas.filter((a) => a.id !== areaId))

  const handleRemoveSensor = (sensorId: string) => {
    if (currentArea.sensors) {
      setCurrentArea({
        ...currentArea,
        sensors: currentArea.sensors.filter((s) => s.id !== sensorId),
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* --- ZONA --- */}
      <div className="rounded-2xl p-[1.5px] bg-gradient-to-br from-emerald-200/70 via-teal-200/50 to-sky-200/70">
        <Card className="rounded-2xl bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent font-semibold">
              Cadastrar Nova Zona
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="zone-name">Nome da Zona</Label>
              <Input
                id="zone-name"
                placeholder="Ex: Zona Norte"
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
                className="rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-200"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- ÁREA --- */}
      <div className="rounded-2xl p-[1.5px] bg-gradient-to-br from-emerald-200/70 via-teal-200/50 to-sky-200/70">
        <Card className="rounded-2xl bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent font-semibold">
              Adicionar Área
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="area-name">Nome da Área</Label>
                <Input
                  id="area-name"
                  placeholder="Ex: Campo A"
                  value={currentArea.name || ""}
                  onChange={(e) => setCurrentArea({ ...currentArea, name: e.target.value })}
                  className="rounded-xl border-slate-200 focus:border-sky-400 focus:ring-sky-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="crop">Cultura</Label>
                <Select value={currentArea.crop} onValueChange={(v) => setCurrentArea({ ...currentArea, crop: v })}>
                  <SelectTrigger
                    id="crop"
                    className="rounded-xl border-slate-200 focus:border-sky-400 focus:ring-sky-200"
                  >
                    <SelectValue placeholder="Selecione a cultura" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tomato">Tomate</SelectItem>
                    <SelectItem value="corn">Milho</SelectItem>
                    <SelectItem value="soy">Soja</SelectItem>
                    <SelectItem value="lettuce">Alface</SelectItem>
                    <SelectItem value="carrot">Cenoura</SelectItem>
                    <SelectItem value="beans">Feijão</SelectItem>
                    <SelectItem value="potato">Batata</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="area-size">Área (hectares)</Label>
              <Input
                id="area-size"
                type="number"
                step="0.1"
                placeholder="Ex: 2.5"
                value={currentArea.size || ""}
                onChange={(e) => setCurrentArea({ ...currentArea, size: parseFloat(e.target.value) })}
                className="rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-200"
              />
            </div>

            {/* Sensores */}
            <div className="space-y-3">
              <Label>Sensores Disponíveis</Label>
              <div className="grid md:grid-cols-2 gap-3">
                {sensorTypes.map((sensor) => (
                  <div key={sensor.id} className="flex items-center gap-2">
                    <Checkbox
                      id={sensor.id}
                      checked={selectedSensorTypes.includes(sensor.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedSensorTypes([...selectedSensorTypes, sensor.id])
                        } else {
                          setSelectedSensorTypes(selectedSensorTypes.filter((id) => id !== sensor.id))
                          if (currentArea.sensors) {
                            setCurrentArea({
                              ...currentArea,
                              sensors: currentArea.sensors.filter((s) => s.type !== sensor.id),
                            })
                          }
                        }
                      }}
                    />
                    <label htmlFor={sensor.id} className="text-sm font-medium text-slate-700">
                      {sensor.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Localização dos sensores */}
            {selectedSensorTypes.length > 0 && (
              <div className="space-y-3">
                <Label>Localização dos Sensores</Label>
                <div className="space-y-2">
                  {selectedSensorTypes.map((sensorType) => {
                    const sensorLabel = sensorTypes.find((s) => s.id === sensorType)?.label
                    const existingSensor = currentArea.sensors?.find((s) => s.type === sensorType)
                    return (
                      <div
                        key={sensorType}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded-xl bg-white/70"
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm font-medium">{sensorLabel}</span>
                          {existingSensor && (
                            <span className="text-xs text-slate-500">
                              ({existingSensor.lat.toFixed(6)}, {existingSensor.lng.toFixed(6)})
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {existingSensor ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveSensor(existingSensor.id)}
                              className="rounded-xl text-rose-600 hover:text-rose-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          ) : (
                            /* >>> Dialog corrigido e funcional <<< */
                            <Dialog
                              open={showMapDialog && currentSensorType === sensorType}
                              onOpenChange={(open) => {
                                setShowMapDialog(open)
                                if (open) setCurrentSensorType(sensorType)
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-xl border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                                >
                                  Definir Localização
                                </Button>
                              </DialogTrigger>

                              {/* Corrigido: força renderização e recalculo do Canvas */}
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" forceMount>
                                <DialogHeader>
                                  <DialogTitle>Selecione a Localização do Sensor - {sensorLabel}</DialogTitle>
                                </DialogHeader>
                                <SensorLocationMap
                                  key={showMapDialog ? `map-${sensorType}` : "map-closed"}
                                  onLocationSelect={handleAddSensorLocation}
                                />
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <Button
              onClick={handleAddArea}
              className="w-full rounded-xl h-11 bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white font-semibold"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Área
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* --- Áreas cadastradas --- */}
      {areas.length > 0 && (
        <div className="rounded-2xl p-[1.5px] bg-gradient-to-br from-emerald-200/70 via-teal-200/50 to-sky-200/70">
          <Card className="rounded-2xl bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent font-semibold">
                Áreas Cadastradas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {areas.map((area) => (
                <div key={area.id} className="p-4 rounded-xl border bg-white/70">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{area.name}</div>
                      <div className="text-sm text-slate-500">
                        {area.crop} • {area.size} ha • {area.sensors.length} sensores
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveArea(area.id)}
                      className="text-rose-600 hover:text-rose-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {area.sensors.length > 0 && (
                    <div className="text-xs text-slate-500">
                      Sensores:{" "}
                      {area.sensors
                        .map((s) => sensorTypes.find((st) => st.id === s.type)?.label)
                        .join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      <Button
        className="w-full h-12 rounded-2xl text-white font-semibold text-base bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 disabled:opacity-50"
        disabled={!zoneName || areas.length === 0}
      >
        Salvar Zona Completa
      </Button>
    </div>
  )
}
