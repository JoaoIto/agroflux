import { LargeProducerDashboard } from "@/components/dashboard"
import { Suspense } from "react"

export default function LargeProducerPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <LargeProducerDashboard />
    </Suspense>
  )
}
