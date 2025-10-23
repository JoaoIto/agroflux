"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import { Canvas, ThreeEvent } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera, Text } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import * as THREE from "three"

/* =========================
   Tipagens
========================= */
interface SensorLocationMapProps {
  onLocationSelect: (lat: number, lng: number) => void
}
interface TerrainProps {
  onSelect: (lat: number, lng: number) => void
}

/* =========================
   Helper: Corrige render ao abrir Dialog
========================= */
function ResizeFix() {
  useEffect(() => {
    const id = window.setTimeout(() => window.dispatchEvent(new Event("resize")), 50)
    return () => clearTimeout(id)
  }, [])
  return null
}

/* =========================
   Terreno clicável
========================= */
function Terrain({ onSelect }: TerrainProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const [markerPosition, setMarkerPosition] = useState<THREE.Vector3 | null>(null)

  useEffect(() => {
    if (meshRef.current) meshRef.current.geometry.computeVertexNormals()
  }, [])

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    const point = event.point
    setMarkerPosition(new THREE.Vector3(point.x, 0, point.z))

    // Conversão simples para lat/lng simulada
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
      {/* Terreno */}
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

      {/* Marcador */}
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

/* =========================
   Grade visual
========================= */
function GridHelper() {
  return <gridHelper args={[50, 50, "#7dd3fc", "#86efac"]} position={[0, 0, 0]} />
}

/* =========================
   Componente principal
========================= */
export function SensorLocationMap({ onLocationSelect }: SensorLocationMapProps) {
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null)

  const handleSelect = (lat: number, lng: number) => setSelectedCoords({ lat, lng })
  const handleConfirm = () => {
    if (selectedCoords) onLocationSelect(selectedCoords.lat, selectedCoords.lng)
  }

  return (
    <div className="space-y-4">
      {/* Moldura com gradiente e vidro */}
      <div className="rounded-2xl p-[1.5px] bg-gradient-to-br from-emerald-200/70 via-teal-200/50 to-sky-200/70">
        <div className="rounded-2xl bg-white/80 backdrop-blur border overflow-hidden">
          <div className="relative h-[360px] sm:h-[440px] md:h-[560px] w-full">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.10),transparent_60%),radial-gradient(ellipse_at_bottom_right,rgba(14,165,233,0.10),transparent_60%)]" />

            {/* Canvas com fallback e resize fix */}
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
                <OrbitControls enablePan enableZoom enableRotate minDistance={10} maxDistance={80} maxPolarAngle={Math.PI / 2.5} />

                <ambientLight intensity={0.6} />
                <directionalLight position={[12, 24, 12]} intensity={1.1} castShadow />
                <pointLight position={[-12, 10, -12]} intensity={0.5} />

                <Terrain onSelect={handleSelect} />
                <GridHelper />

                <Text position={[0, 0.2, -26]} rotation={[-Math.PI / 2, 0, 0]} fontSize={1.2} color="#334155">
                  Toque/Clique no terreno para posicionar o sensor
                </Text>
              </Canvas>
            </Suspense>

            {/* Overlay de instruções */}
            <div className="pointer-events-none absolute top-3 left-3 right-3 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
              <div className="pointer-events-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur border">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs sm:text-sm text-slate-700">Selecione um ponto no terreno</span>
              </div>
              <div className="pointer-events-auto inline-flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur border">
                <span className="text-[11px] sm:text-xs text-slate-600">Arraste para girar</span>
                <span className="text-[11px] sm:text-xs text-slate-600">Pinça/Scroll para zoom</span>
                <span className="text-[11px] sm:text-xs text-slate-600">Arraste com right/middle para mover</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Painel de confirmação */}
      {selectedCoords && (
        <div className="fixed bottom-0 left-0 right-0 z-40 sm:static sm:z-auto" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
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
