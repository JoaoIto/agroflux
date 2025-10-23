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
        if (!currentArea.sensors) {
            currentArea.sensors = []
        }

        const newSensor: Sensor = {
            id: `S${Date.now()}`,
            type: currentSensorType,
            lat,
            lng,
        }

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

    const handleRemoveArea = (areaId: string) => {
        setAreas(areas.filter((a) => a.id !== areaId))
    }

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
            <Card>
                <CardHeader>
                    <CardTitle>Cadastrar Nova Zona</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="zone-name">Nome da Zona</Label>
                        <Input
                            id="zone-name"
                            placeholder="Ex: Zona Norte"
                            value={zoneName}
                            onChange={(e) => setZoneName(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Adicionar Área</CardTitle>
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
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="crop">Cultura</Label>
                            <Select
                                value={currentArea.crop}
                                onValueChange={(value) => setCurrentArea({ ...currentArea, crop: value })}
                            >
                                <SelectTrigger id="crop">
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
                            onChange={(e) => setCurrentArea({ ...currentArea, size: Number.parseFloat(e.target.value) })}
                        />
                    </div>

                    <div className="space-y-3">
                        <Label>Sensores Disponíveis</Label>
                        <div className="grid md:grid-cols-2 gap-3">
                            {sensorTypes.map((sensor) => (
                                <div key={sensor.id} className="flex items-center space-x-2">
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
                                    <label
                                        htmlFor={sensor.id}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        {sensor.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {selectedSensorTypes.length > 0 && (
                        <div className="space-y-3">
                            <Label>Localização dos Sensores</Label>
                            <div className="space-y-2">
                                {selectedSensorTypes.map((sensorType) => {
                                    const sensorLabel = sensorTypes.find((s) => s.id === sensorType)?.label
                                    const existingSensor = currentArea.sensors?.find((s) => s.type === sensorType)

                                    return (
                                        <div key={sensorType} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-primary" />
                                                <span className="text-sm font-medium">{sensorLabel}</span>
                                                {existingSensor && (
                                                    <span className="text-xs text-muted-foreground">
                            ({existingSensor.lat.toFixed(6)}, {existingSensor.lng.toFixed(6)})
                          </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {existingSensor ? (
                                                    <Button size="sm" variant="ghost" onClick={() => handleRemoveSensor(existingSensor.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                ) : (
                                                    <Dialog
                                                        open={showMapDialog && currentSensorType === sensorType}
                                                        onOpenChange={(open) => {
                                                            setShowMapDialog(open)
                                                            if (open) setCurrentSensorType(sensorType)
                                                        }}
                                                    >
                                                        <DialogTrigger asChild>
                                                            <Button size="sm" variant="outline">
                                                                Definir Localização
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-4xl">
                                                            <DialogHeader>
                                                                <DialogTitle>Selecione a Localização do Sensor - {sensorLabel}</DialogTitle>
                                                            </DialogHeader>
                                                            <SensorLocationMap onLocationSelect={handleAddSensorLocation} />
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

                    <Button onClick={handleAddArea} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Área
                    </Button>
                </CardContent>
            </Card>

            {areas.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Áreas Cadastradas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {areas.map((area) => (
                            <div key={area.id} className="p-4 border rounded-lg space-y-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium">{area.name}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {area.crop} • {area.size} ha • {area.sensors.length} sensores
                                        </div>
                                    </div>
                                    <Button size="sm" variant="ghost" onClick={() => handleRemoveArea(area.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                {area.sensors.length > 0 && (
                                    <div className="text-xs text-muted-foreground">
                                        Sensores: {area.sensors.map((s) => sensorTypes.find((st) => st.id === s.type)?.label).join(", ")}
                                    </div>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            <Button className="w-full" size="lg" disabled={!zoneName || areas.length === 0}>
                Salvar Zona Completa
            </Button>
        </div>
    )
}
