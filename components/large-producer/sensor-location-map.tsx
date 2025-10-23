"use client"

import { useState, useRef, useEffect } from "react"
import { Canvas, ThreeEvent } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera, Text } from "@react-three/drei"
import { Button } from "@/components/ui/button" // Assumindo que você tem este componente no seu projeto
import * as THREE from "three"

// --- Props do Componente Principal ---
interface SensorLocationMapProps {
    onLocationSelect: (lat: number, lng: number) => void
}

// --- Props do Componente Terrain ---
interface TerrainProps {
    // CORREÇÃO: A função recebe 'lat' e 'lng', que são 'number'
    onSelect: (lat: number, lng: number) => void
}

/**
 * Componente de Terreno 3D clicável
 */
function Terrain({ onSelect }: TerrainProps) {
    // Tipagem da Ref para um Mesh do Three.js
    const meshRef = useRef<THREE.Mesh>(null)
    const [hovered, setHovered] = useState(false)
    // Armazena a posição [x, y, z] do marcador
    const [markerPosition, setMarkerPosition] = useState<THREE.Vector3 | null>(null)

    useEffect(() => {
        // Calcula as normais do vértice para a iluminação correta
        if (meshRef.current) {
            meshRef.current.geometry.computeVertexNormals()
        }
    }, [])

    // CORREÇÃO: Tipagem do evento de clique do R3F
    const handleClick = (event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation()

        // Ponto de interseção exato do clique no mesh
        const point = event.point

        // CORREÇÃO: Define a posição do marcador no plano (Y=0)
        // O grupo do marcador será posicionado em [x, 0, z]
        setMarkerPosition(new THREE.Vector3(point.x, 0, point.z))

        // --- Lógica de Simulação de Coordenadas ---
        // Esta lógica converte a posição (x, z) no plano 3D
        // para coordenadas (lat, lng) simuladas.
        // O centro do plano (0,0) é mapeado para (-23.5505, -46.6333)
        // O tamanho do plano (50x50) e o fator (0.1) definem a "escala" do mapa.
        const centerLat = -23.5505
        const centerLng = -46.6333
        const mapScale = 0.1 // Define a variação total de lat/lng (0.1 grau)
        const planeSize = 50 // Deve ser igual ao 'args' da planeGeometry

        // point.z (eixo Z do 3D) é mapeado para Latitude (Norte/Sul)
        // O eixo Z do R3F é invertido em relação ao esperado (positivo é "para baixo")
        // por isso usamos -point.z para mapear corretamente.
        const lat = centerLat - (point.z / (planeSize / 2)) * (mapScale / 2)

        // point.x (eixo X do 3D) é mapeado para Longitude (Leste/Oeste)
        const lng = centerLng + (point.x / (planeSize / 2)) * (mapScale / 2)
        // ------------------------------------------

        // Envia as coordenadas simuladas para o componente pai
        onSelect(lat, lng)
    }

    return (
        <>
            {/* O Plano/Terreno Clicável */}
            <mesh
                ref={meshRef}
                rotation={[-Math.PI / 2, 0, 0]} // Deita o plano no eixo XZ
                onClick={handleClick}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                {/* Plano de 50x50 unidades */}
                <planeGeometry args={[50, 50, 32, 32]} />
                <meshStandardMaterial
                    color={hovered ? "#4ade80" : "#22c55e"}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Marcador do Sensor (renderizado se markerPosition não for null) */}
            {markerPosition && (
                <group position={markerPosition}>
                    {/* Haste do Sensor */}
                    <mesh position={[0, 1, 0]}> {/* Centro da haste em Y=1 (metade da altura) */}
                        <cylinderGeometry args={[0.1, 0.1, 2, 16]} /> {/* Raio, Raio, Altura, Segmentos */}
                        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
                    </mesh>

                    {/* Cabeça do Sensor */}
                    <mesh position={[0, 2.1, 0]}> {/* Posição Y = altura da haste + raio da esfera (aprox) */}
                        <sphereGeometry args={[0.3, 16, 16]} /> {/* Raio, Segmentos, Segmentos */}
                        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.8} />
                    </mesh>
                </group>
            )}
        </>
    )
}

/**
 * Helper de Grid
 */
function GridHelper() {
    return <gridHelper args={[50, 50, "#666666", "#444444"]} position={[0, 0, 0]} />
}

/**
 * Componente Principal do Mapa de Seleção
 */
export function SensorLocationMap({ onLocationSelect }: SensorLocationMapProps) {
    const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null)

    // Recebe as coordenadas do componente Terrain
    const handleSelect = (lat: number, lng: number) => {
        setSelectedCoords({ lat, lng })
    }

    // Confirma a seleção e envia para o componente pai
    const handleConfirm = () => {
        if (selectedCoords) {
            onLocationSelect(selectedCoords.lat, selectedCoords.lng)
        }
    }

    return (
        <div className="space-y-4">
            <div className="h-[500px] w-full border rounded-lg overflow-hidden bg-background">
                <Canvas>
                    {/* Configuração da Câmera */}
                    <PerspectiveCamera makeDefault position={[0, 30, 30]} fov={75} />

                    {/* Controles de Órbita */}
                    <OrbitControls
                        enablePan={true}
                        enableZoom={true}
                        enableRotate={true}
                        minDistance={10}  // Zoom máximo
                        maxDistance={80}  // Zoom mínimo
                        maxPolarAngle={Math.PI / 2.5} // Limita a rotação para não "virar" o mapa
                    />

                    {/* Iluminação da Cena */}
                    <ambientLight intensity={0.6} />
                    <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
                    <pointLight position={[-10, 10, -10]} intensity={0.5} />

                    {/* Componentes da Cena */}
                    <Terrain onSelect={handleSelect} />
                    <GridHelper />

                    {/* Texto de Instrução */}
                    <Text position={[0, 0.2, -26]} rotation={[-Math.PI / 2, 0, 0]} fontSize={1.5} color="#888888">
                        Clique no terreno para posicionar o sensor
                    </Text>
                </Canvas>
            </div>

            {/* Painel de Confirmação */}
            {selectedCoords && (
                <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                    <div className="text-sm">
                        <span className="font-medium">Coordenadas selecionadas:</span>
                        <div className="text-muted-foreground mt-1">
                            Latitude: {selectedCoords.lat.toFixed(6)} | Longitude: {selectedCoords.lng.toFixed(6)}
                        </div>
                    </div>
                    {/* Este botão deve vir do seu sistema de UI (shadcn/ui) */}
                    <Button onClick={handleConfirm}>Confirmar Localização</Button>
                </div>
            )}
        </div>
    )
}