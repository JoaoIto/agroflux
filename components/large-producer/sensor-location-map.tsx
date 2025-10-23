"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import { Canvas, type ThreeEvent } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera, Text } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Droplets, ThermometerSun, Activity } from "lucide-react"
import * as THREE from "three"
import axios from "axios"

interface SensorLocationMapProps {
  onLocationSelect: (lat: number, lng: number) => void
}

interface TerrainProps {
  onSelect: (lat: number, lng: number) => void
  currentLocation: { lat: number; lng: number } | null
}

interface ESP32Data {
  solo: { timestamp: number; adc: number; umidade_percent: number; status: string } | null
  dht: { timestamp: number; temperatura: number; umidade: number } | null
  bomba: { timestamp: number; estado: string; modo: string; pino: string; ativo_em: string } | null
}

function ResizeFix() {
  useEffect(() => {
    const id = window.setTimeout(() => window.dispatchEvent(new Event("resize")), 50)
    return () => clearTimeout(id)
  }, [])
  return null
}

function Terrain({ onSelect, currentLocation }: TerrainProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const [markerPosition, setMarkerPosition] = useState<THREE.Vector3 | null>(null)

  useEffect(() => {
    if (meshRef.current) meshRef.current.geometry.computeVertexNormals()
  }, [])

  const currentLocationMarker = currentLocation
      ? new THREE.Vector3(
          ((currentLocation.lng + 46.6333) / 0.1) * (50 / 2),
          0.1,
          -((currentLocation.lat + 23.5505) / 0.1) * (50 / 2),
      )
      : null

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    const point = event.point
    setMarkerPosition(new THREE.Vector3(point.x, 0, point.z))

    const centerLat = -23.5505
    const centerLng = -46.6333
    const mapScale = 0.1
    const planeSize = 50
    const lat = centerLat - (point.z / (planeSize / 2)) * (mapScale / 2)
    const lng = centerLng + (point.x / (planeSize / 2)) * (mapScale / 2)

    onSelect(lat, lng)
  }

  return (
      <>
        <mesh
            ref={meshRef}
            rotation={[-Math.PI / 2, 0, 0]}
            onClick={handleClick}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            receiveShadow
        >
          <planeGeometry args={[50, 50, 64, 64]} />
          <meshStandardMaterial
              color={hovered ? "#10b981" : "#22c55e"}
              roughness={0.85}
              metalness={0.05}
              side={THREE.DoubleSide}
          />
        </mesh>

        {currentLocationMarker && (
            <group position={currentLocationMarker}>
              <mesh position={[0, 1, 0]} castShadow>
                <cylinderGeometry args={[0.15, 0.15, 2, 16]} />
                <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.6} />
              </mesh>
              <mesh position={[0, 2.2, 0]} castShadow>
                <sphereGeometry args={[0.4, 24, 24]} />
                <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.9} />
              </mesh>
            </group>
        )}

        {/* Selected position marker (green) */}
        {markerPosition && (
            <group position={markerPosition}>
              <mesh position={[0, 1, 0]} castShadow>
                <cylinderGeometry args={[0.1, 0.1, 2, 16]} />
                <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.4} />
              </mesh>
              <mesh position={[0, 2.1, 0]} castShadow>
                <sphereGeometry args={[0.35, 24, 24]} />
                <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.75} />
              </mesh>
            </group>
        )}
      </>
  )
}

function GridHelper() {
  return <gridHelper args={[50, 50, "#7dd3fc", "#86efac"]} position={[0, 0, 0]} />
}

export function SensorLocationMap({ onLocationSelect }: SensorLocationMapProps) {
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)

  const [esp32Data, setEsp32Data] = useState<ESP32Data>({
    solo: null,
    dht: null,
    bomba: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
          (position) => {
            setCurrentLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            })
            setLocationError(null)
          },
          (error) => {
            console.error("[v0] Geolocation error:", error)
            setLocationError("Não foi possível obter sua localização")
          },
      )
    } else {
      setLocationError("Geolocalização não suportada pelo navegador")
    }
  }, [])

  useEffect(() => {
    const fetchESP32Data = async () => {
      try {
        const [soloRes, dhtRes, bombaRes] = await Promise.all([
          axios.get("/api/esp32/solo"),
          axios.get("/api/esp32/dht"),
          axios.get("/api/esp32/bomba"),
        ])

        setEsp32Data({
          solo: soloRes.data,
          dht: dhtRes.data,
          bomba: bombaRes.data,
        })
        setLoading(false)
      } catch (error) {
        console.error("[v0] Error fetching ESP32 data:", error)
        setLoading(false)
      }
    }

    fetchESP32Data()
    const interval = setInterval(fetchESP32Data, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleSelect = (lat: number, lng: number) => setSelectedCoords({ lat, lng })
  const handleConfirm = () => {
    if (selectedCoords) onLocationSelect(selectedCoords.lat, selectedCoords.lng)
  }

  return (
      <div className="space-y-4">
        <Tabs defaultValue="solo" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="solo" className="flex items-center gap-2">
              <Droplets className="h-4 w-4" />
              Umidade do Solo
            </TabsTrigger>
            <TabsTrigger value="temperatura" className="flex items-center gap-2">
              <ThermometerSun className="h-4 w-4" />
              Temperatura
            </TabsTrigger>
            <TabsTrigger value="bomba" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Bomba
            </TabsTrigger>
          </TabsList>

          <TabsContent value="solo" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-blue-500" />
                  Sensor de Umidade do Solo
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                    <div className="text-muted-foreground">Carregando dados do sensor...</div>
                ) : esp32Data.solo ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Umidade</div>
                          <div className="text-4xl font-bold text-blue-600">{esp32Data.solo.umidade_percent}%</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Status</div>
                          <Badge
                              variant={esp32Data.solo.status === "SECO" ? "destructive" : "default"}
                              className="text-lg px-3 py-1"
                          >
                            {esp32Data.solo.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="pt-4 border-t space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Valor ADC:</span>
                          <span className="font-medium">{esp32Data.solo.adc}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Timestamp:</span>
                          <span className="font-medium">{esp32Data.solo.timestamp}ms</span>
                        </div>
                      </div>
                    </div>
                ) : (
                    <div className="text-muted-foreground">Nenhum dado disponível</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="temperatura" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ThermometerSun className="h-5 w-5 text-orange-500" />
                  Sensor de Temperatura e Umidade do Ar (DHT)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                    <div className="text-muted-foreground">Carregando dados do sensor...</div>
                ) : esp32Data.dht ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Temperatura</div>
                          <div className="text-4xl font-bold text-orange-600">{esp32Data.dht.temperatura}°C</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Umidade do Ar</div>
                          <div className="text-4xl font-bold text-blue-600">{esp32Data.dht.umidade}%</div>
                        </div>
                      </div>
                      <div className="pt-4 border-t space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Timestamp:</span>
                          <span className="font-medium">{esp32Data.dht.timestamp}ms</span>
                        </div>
                      </div>
                    </div>
                ) : (
                    <div className="text-muted-foreground">Nenhum dado disponível</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bomba" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  Status da Bomba de Irrigação
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                    <div className="text-muted-foreground">Carregando dados do sensor...</div>
                ) : esp32Data.bomba ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Estado</div>
                          <Badge
                              variant={esp32Data.bomba.estado === "LIGADA" ? "default" : "secondary"}
                              className="text-2xl px-4 py-2"
                          >
                            {esp32Data.bomba.estado}
                          </Badge>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Modo</div>
                          <Badge variant="outline" className="text-xl px-3 py-1">
                            {esp32Data.bomba.modo}
                          </Badge>
                        </div>
                      </div>
                      <div className="pt-4 border-t space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Pino:</span>
                          <span className="font-medium">{esp32Data.bomba.pino}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Ativo em:</span>
                          <span className="font-medium">{esp32Data.bomba.ativo_em}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Timestamp:</span>
                          <span className="font-medium">{esp32Data.bomba.timestamp}ms</span>
                        </div>
                      </div>
                    </div>
                ) : (
                    <div className="text-muted-foreground">Nenhum dado disponível</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {currentLocation && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Sua Localização Atual:</span>
                  <span className="text-muted-foreground">
                Lat: {currentLocation.lat.toFixed(6)}, Lng: {currentLocation.lng.toFixed(6)}
              </span>
                </div>
              </CardContent>
            </Card>
        )}

        {locationError && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="pt-4">
                <div className="text-sm text-yellow-800">{locationError}</div>
              </CardContent>
            </Card>
        )}

        <div className="rounded-2xl p-[1.5px] bg-gradient-to-br from-emerald-200/70 via-teal-200/50 to-sky-200/70">
          <div className="rounded-2xl bg-white/80 backdrop-blur border overflow-hidden">
            <div className="relative h-[360px] sm:h-[440px] md:h-[560px] w-full">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.10),transparent_60%),radial-gradient(ellipse_at_bottom_right,rgba(14,165,233,0.10),transparent_60%)]" />

              <Suspense
                  fallback={
                    <div className="absolute inset-0 grid place-items-center">
                      <div className="animate-pulse rounded-xl border p-3 bg-white/80 text-slate-600">
                        carregando mapa 3D…
                      </div>
                    </div>
                  }
              >
                <Canvas
                    shadows
                    dpr={[1, 2]}
                    resize={{ scroll: false, offsetSize: true }}
                    gl={{ antialias: true, powerPreference: "high-performance" }}
                >
                  <ResizeFix />
                  {/* @ts-ignore */}
                  <fog attach="fog" args={["#e2f7f0", 60, 120]} />
                  <PerspectiveCamera makeDefault position={[0, 30, 30]} fov={75} />
                  <OrbitControls
                      enablePan
                      enableZoom
                      enableRotate
                      minDistance={10}
                      maxDistance={80}
                      maxPolarAngle={Math.PI / 2.5}
                  />

                  <ambientLight intensity={0.6} />
                  <directionalLight position={[12, 24, 12]} intensity={1.1} castShadow />
                  <pointLight position={[-12, 10, -12]} intensity={0.5} />

                  <Terrain onSelect={handleSelect} currentLocation={currentLocation} />
                  <GridHelper />

                  <Text position={[0, 0.2, -26]} rotation={[-Math.PI / 2, 0, 0]} fontSize={1.2} color="#334155">
                    {currentLocation ? "Marcador azul = sua localização" : "Toque/Clique no terreno"}
                  </Text>
                </Canvas>
              </Suspense>

              <div className="pointer-events-none absolute top-3 left-3 right-3 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                <div className="pointer-events-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur border">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-xs sm:text-sm text-slate-700">Selecione um ponto no terreno</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {selectedCoords && (
            <div
                className="fixed bottom-0 left-0 right-0 z-40 sm:static sm:z-auto"
                style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            >
              <div className="mx-4 sm:mx-0 mb-3 sm:mb-0 rounded-2xl p-[1.5px] bg-gradient-to-r from-emerald-300/80 to-sky-300/80 sm:bg-none">
                <div className="rounded-2xl bg-white/95 backdrop-blur border sm:border-transparent sm:bg-transparent sm:p-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border sm:border rounded-2xl bg-white/80 sm:bg-white">
                    <div className="text-sm">
                      <span className="font-medium">Coordenadas selecionadas:</span>
                      <div className="text-slate-600 mt-1">
                        Latitude: {selectedCoords.lat.toFixed(6)} | Longitude: {selectedCoords.lng.toFixed(6)}
                      </div>
                    </div>
                    <Button
                        onClick={handleConfirm}
                        className="rounded-xl h-11 w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white shadow-md"
                    >
                      Confirmar Localização
                    </Button>
                  </div>
                </div>
              </div>
            </div>
        )}
      </div>
  )
}
