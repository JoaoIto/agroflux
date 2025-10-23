import OpenAI from "openai"
import { NextResponse } from "next/server"
import { calcularETo, gerarBaseIrrigacao } from "@/functions/calcIrrigacao"

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(req: Request) {
    try {
        // 1️⃣ lê dados do corpo da requisição
        const body = await req.json()
        const {
            kc,
            tmax,
            tmin,
            rh,
            u2,
            Rs,
            latitude,
            longitude,
            altitude,
            area_m2,
            dayOfYear
        } = body

        // 2️⃣ validação simples
        if ([kc, tmax, tmin, rh, u2, Rs, latitude, altitude, area_m2].some(v => v === undefined)) {
            return NextResponse.json({ error: "Parâmetros insuficientes" }, { status: 400 })
        }

        // 3️⃣ cálculo do ETo (Penman-Monteith FAO-56)
        const eto = calcularETo({
            tmax,
            tmin,
            rh,
            u2,
            Rs,
            altitude,
            latitude,
            dayOfYear
        })

        // 4️⃣ base de irrigação (ETc = ETo * Kc)
        const base = gerarBaseIrrigacao(kc, eto, area_m2)

        // 5️⃣ prompt com dados formatados
        const prompt = `
Você é uma IA agronômica do AgroFlux 🌱
Com base nesses dados, gere uma recomendação simples para o produtor:

Latitude: ${latitude}
Altitude: ${altitude} m
Kc: ${kc}
ETo: ${eto} mm/dia
Área: ${area_m2} m²
Previsão de irrigação:
- Hoje: ${base.hoje.liters.toFixed(0)} L (${base.hoje.mm.toFixed(2)} mm)
- 7 dias: ${base.dias7.liters.toFixed(0)} L
- 30 dias: ${base.dias30.liters.toFixed(0)} L
- 6 meses: ${base.meses6.liters.toFixed(0)} L

Dê sugestões práticas (quando irrigar, se deve reduzir/aumentar, etc.)
Responda de forma curta, objetiva e em português do Brasil.
`

        // 6️⃣ gera recomendação via OpenAI
        const completion = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Você é uma IA agrícola especializada em irrigação eficiente e manejo hídrico." },
                { role: "user", content: prompt }
            ],
            temperature: 0.4
        })

        const recomendacao = completion.choices[0].message.content

        // 7️⃣ resposta final
        return NextResponse.json({
            kc,
            eto,
            base,
            recomendacao
        })
    } catch (error: any) {
        console.error("Erro na rota /api/ai/irrigacao:", error)
        return NextResponse.json(
            { error: "Falha ao processar solicitação", detalhe: error?.message },
            { status: 500 }
        )
    }
}
