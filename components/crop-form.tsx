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

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setLoading(false)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="crop-type">Tipo de Cultura</Label>
        <Select defaultValue={isUpdate ? "tomato" : undefined}>
          <SelectTrigger id="crop-type">
            <SelectValue placeholder="Selecione a cultura" />
          </SelectTrigger>
          <SelectContent>
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
        <Label htmlFor="area">Área Plantada (m²)</Label>
        <Input id="area" type="number" placeholder="Ex: 100" defaultValue={isUpdate ? "150" : ""} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Localização</Label>
        <Input id="location" placeholder="Ex: São Paulo, SP" defaultValue={isUpdate ? "São Paulo, SP" : ""} required />
        <p className="text-xs text-muted-foreground">Usaremos sua localização para dados climáticos precisos</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="planting-date">Data de Plantio</Label>
        <Input id="planting-date" type="date" defaultValue={isUpdate ? "2025-01-15" : ""} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="soil-type">Tipo de Solo</Label>
        <Select defaultValue={isUpdate ? "clay" : undefined}>
          <SelectTrigger id="soil-type">
            <SelectValue placeholder="Selecione o tipo de solo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sandy">Arenoso</SelectItem>
            <SelectItem value="clay">Argiloso</SelectItem>
            <SelectItem value="loamy">Areno-argiloso</SelectItem>
            <SelectItem value="organic">Orgânico</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Salvando..." : isUpdate ? "Atualizar Informações" : "Cadastrar Cultura"}
      </Button>
    </form>
  )
}
