"use client"

import type React from "react"
import { useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CROP_KC_VALUES } from "@/models/IGarden"

interface CropFormProps {
  isUpdate?: boolean
  onSuccess: () => void
}

export function CropForm({ isUpdate = false, onSuccess }: CropFormProps) {
  const [loading, setLoading] = useState(false)
  const [cropType, setCropType] = useState<string>(isUpdate ? "tomato" : "")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })

      const gardenData = {
        name: formData.get("name") as string,
        location: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
        area: Number(formData.get("area")),
        altitude: position.coords.altitude || 0,
        cropType: cropType,
        kc: CROP_KC_VALUES[cropType] || 1.0,
        user_id: localStorage.getItem("user_id") || "default_user",
        zones: [],
      }

      await axios.post("/api/gardens", gardenData)

      onSuccess()
    } catch (error) {
      console.error("[v0] Erro ao cadastrar jardim:", error)
      alert("Erro ao cadastrar jardim. Verifique os dados e tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Linha 1 */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
          <div className="space-y-2">
            <Label htmlFor="crop-type" className="text-sm font-medium text-slate-700">
              Tipo de cultura
            </Label>
            <Select value={cropType} onValueChange={setCropType}>
              <SelectTrigger
                  id="crop-type"
                  className="rounded-xl bg-white/80 backdrop-blur border-slate-200 focus:ring-2 focus:ring-emerald-500/60 focus:border-emerald-500/50"
              >
                <SelectValue placeholder="Selecione a cultura" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="tomato">Tomate (Kc: 1.15)</SelectItem>
                <SelectItem value="lettuce">Alface (Kc: 1.0)</SelectItem>
                <SelectItem value="carrot">Cenoura (Kc: 1.05)</SelectItem>
                <SelectItem value="corn">Milho (Kc: 1.2)</SelectItem>
                <SelectItem value="beans">Feijão (Kc: 1.05)</SelectItem>
                <SelectItem value="potato">Batata (Kc: 1.15)</SelectItem>
                <SelectItem value="other">Outro (Kc: 1.0)</SelectItem>
              </SelectContent>
            </Select>
            {cropType && <p className="text-xs text-emerald-600">Coeficiente Kc: {CROP_KC_VALUES[cropType]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="area" className="text-sm font-medium text-slate-700">
              Área Plantada (m²)
            </Label>
            <Input
                id="area"
                name="area"
                type="number"
                placeholder="Exemplo: 100"
                defaultValue={isUpdate ? "150" : ""}
                required
                className="rounded-xl bg-white/80 backdrop-blur border-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500/60 focus:border-sky-500/50"
            />
          </div>
        </div>

        {/* Linha 2 */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-slate-700">
            Nome da Horta
          </Label>
          <Input
              id="name"
              name="name"
              placeholder="Ex: Horta da Casa"
              defaultValue={isUpdate ? "Horta Principal" : ""}
              required
              className="rounded-xl bg-white/80 backdrop-blur border-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/60 focus:border-emerald-500/50"
          />
          <p className="text-xs text-slate-500">A localização será obtida automaticamente do seu dispositivo</p>
        </div>

        {/* Linha 3 */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
          <div className="space-y-2">
            <Label htmlFor="planting-date" className="text-sm font-medium text-slate-700">
              Data de Plantio
            </Label>
            <Input
                id="planting-date"
                name="planting-date"
                type="date"
                defaultValue={isUpdate ? "2025-01-15" : ""}
                required
                className="rounded-xl bg-white/80 backdrop-blur border-slate-200 focus:ring-2 focus:ring-teal-500/60 focus:border-teal-500/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="soil-type" className="text-sm font-medium text-slate-700">
              Tipo de Solo
            </Label>
            <Select defaultValue={isUpdate ? "clay" : undefined}>
              <SelectTrigger
                  id="soil-type"
                  className="rounded-xl bg-white/80 backdrop-blur border-slate-200 focus:ring-2 focus:ring-sky-500/60 focus:border-sky-500/50"
              >
                <SelectValue placeholder="Selecione o tipo de solo" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="sandy">Arenoso</SelectItem>
                <SelectItem value="clay">Argiloso</SelectItem>
                <SelectItem value="loamy">Areno-argiloso</SelectItem>
                <SelectItem value="organic">Orgânico</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Botão com gradiente verde→azul (mesmo do dashboard) */}
        <Button
            type="submit"
            disabled={loading || !cropType}
            className="w-full rounded-xl h-11 bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white shadow-md"
        >
          {loading ? "Salvando..." : isUpdate ? "Atualizar Informações" : "Cadastrar Cultura"}
        </Button>
      </form>
  )
}
