"use client"

import { useState, useRef, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera, Text } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import * as THREE from "three"

interface SensorLocationMapProps {
  onLocationSelect: (lat: number, lng: number) => void
}

function Terrain({ onSelect }: { onSelect: (x: number, z: number) => void }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const [markerPosition, setMarkerPosition] = useState<[number, number, number] | null>(null)

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.geometry.computeVertexNormals()
    }
  }, [])

  const handleClick = (event: any) => {
    event.stopPropagation()
    const point = event.point
    setMarkerPosition([point.x, 0.1, point.z])

    // Convert 3D coordinates to lat/lng (simplified)
    const lat = -23.5505 + (point.z / 50) * 0.1
    const lng = -46.6333 + (point.x / 50) * 0.1
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
      >
        <planeGeometry args={[50, 50, 32, 32]} />
        <meshStandardMaterial color={hovered ? "#4ade80" : "#22c55e"} wireframe={false} side={THREE.DoubleSide} />
      </mesh>

      {markerPosition && (
        <group position={markerPosition}>
          <mesh>
            <cylinderGeometry args={[0.5, 0.5, 2, 16]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0, 1.5, 0]}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.8} />
          </mesh>
        </group>
      )}
    </>
  )
}

function GridHelper() {
  return <gridHelper args={[50, 50, "#666666", "#444444"]} position={[0, 0, 0]} />
}

export function SensorLocationMap({ onLocationSelect }: SensorLocationMapProps) {
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null)

  const handleSelect = (lat: number, lng: number) => {
    setSelectedCoords({ lat, lng })
  }

  const handleConfirm = () => {
    if (selectedCoords) {
      onLocationSelect(selectedCoords.lat, selectedCoords.lng)
    }
  }

  return (
    <div className="space-y-4">
      <div className="h-[500px] w-full border rounded-lg overflow-hidden bg-background">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 30, 30]} />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={10}
            maxDistance={80}
            maxPolarAngle={Math.PI / 2.5}
          />

          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
          <pointLight position={[-10, 10, -10]} intensity={0.5} />

          <Terrain onSelect={handleSelect} />
          <GridHelper />

          <Text position={[0, 0.2, -26]} rotation={[-Math.PI / 2, 0, 0]} fontSize={1.5} color="#888888">
            Clique no terreno para posicionar o sensor
          </Text>
        </Canvas>
      </div>

      {selectedCoords && (
        <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
          <div className="text-sm">
            <span className="font-medium">Coordenadas selecionadas:</span>
            <div className="text-muted-foreground mt-1">
              Latitude: {selectedCoords.lat.toFixed(6)} | Longitude: {selectedCoords.lng.toFixed(6)}
            </div>
          </div>
          <Button onClick={handleConfirm}>Confirmar Localização</Button>
        </div>
      )}
    </div>
  )
}
