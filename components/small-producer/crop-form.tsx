"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CropFormProps {
  isUpdate?: boolean
  onSuccess: () => void
}

export function CropForm({ isUpdate = false, onSuccess }: CropFormProps) {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setLoading(false)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Linha 1 */}
      <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
        <div className="space-y-2">
          <Label htmlFor="crop-type" className="text-sm font-medium text-slate-700">
            Tipo de cultura
          </Label>
          <Select defaultValue={isUpdate ? "tomato" : undefined}>
            <SelectTrigger
              id="crop-type"
              className="rounded-xl bg-white/80 backdrop-blur border-slate-200 focus:ring-2 focus:ring-emerald-500/60 focus:border-emerald-500/50"
            >
              <SelectValue placeholder="Selecione a cultura" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="tomato">Tomate</SelectItem>
              <SelectItem value="lettuce">Alface</SelectItem>
              <SelectItem value="carrot">Cenoura</SelectItem>
              <SelectItem value="corn">Milho</SelectItem>
              <SelectItem value="beans">Feijão</SelectItem>
              <SelectItem value="potato">Batata</SelectItem>
              <SelectItem value="other">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="area" className="text-sm font-medium text-slate-700">
            Área Plantada (m²)
          </Label>
          <Input
            id="area"
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
        <Label htmlFor="location" className="text-sm font-medium text-slate-700">
          Localização
        </Label>
        <Input
          id="location"
          placeholder="Ex: São Paulo, SP"
          defaultValue={isUpdate ? "São Paulo, SP" : ""}
          required
          className="rounded-xl bg-white/80 backdrop-blur border-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/60 focus:border-emerald-500/50"
        />
        <p className="text-xs text-slate-500">Usaremos sua localização para obter dados climáticos precisos</p>
      </div>

      {/* Linha 3 */}
      <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
        <div className="space-y-2">
          <Label htmlFor="planting-date" className="text-sm font-medium text-slate-700">
            Dados Plantio
          </Label>
          <Input
            id="planting-date"
            type="date"
            defaultValue={isUpdate ? "2025-01-15" : ""}
            required
            className="rounded-xl bg-white/80 backdrop-blur border-slate-200 focus:ring-2 focus:ring-teal-500/60 focus:border-teal-500/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="soil-type" className="text-sm font-medium text-slate-700">
            Tipo Solo
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
        disabled={loading}
        className="w-full rounded-xl h-11 bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white shadow-md"
      >
        {loading ? "Salvando..." : isUpdate ? "Atualizar Informações" : "Cadastrar Cultura"}
      </Button>
    </form>
  )
}
