import { SmallProducerDashboard } from "@/components/small-producer/dashboard"
import { Suspense } from "react"

export default function SmallProducerPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <SmallProducerDashboard />
    </Suspense>
  )
}
