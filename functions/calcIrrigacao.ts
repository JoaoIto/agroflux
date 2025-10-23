type IrrigationForecast = {
    mm: number
    liters: number
}

export function gerarBaseIrrigacao(kc: number, eto: number, area_m2: number): {
    hoje: IrrigationForecast
    dias7: IrrigationForecast
    dias30: IrrigationForecast
    meses6: IrrigationForecast
} {
    // Evita erro se valores vierem zerados
    if (!kc || !eto || !area_m2) {
        return {
            hoje: { mm: 0, liters: 0 },
            dias7: { mm: 0, liters: 0 },
            dias30: { mm: 0, liters: 0 },
            meses6: { mm: 0, liters: 0 }
        }
    }

    // cálculo base (mm)
    const etcDia = kc * eto

    // mm acumulados
    const etc7 = etcDia * 7
    const etc30 = etcDia * 30
    const etc180 = etcDia * 180

    // conversão p/ litros (1 mm = 1 L/m²)
    const hojeLitros = etcDia * area_m2
    const dias7Litros = etc7 * area_m2
    const dias30Litros = etc30 * area_m2
    const meses6Litros = etc180 * area_m2

    return {
        hoje: { mm: arred(etcDia), liters: arred(hojeLitros) },
        dias7: { mm: arred(etc7), liters: arred(dias7Litros) },
        dias30: { mm: arred(etc30), liters: arred(dias30Litros) },
        meses6: { mm: arred(etc180), liters: arred(meses6Litros) },
    }
}

function arred(v: number, casas = 2) {
    return Number(v.toFixed(casas))
}

export function calcularETo({
                                tmax,
                                tmin,
                                rh,            // umidade relativa média (%)
                                u2,            // vento médio (m/s)
                                Rs,            // radiação solar global (MJ/m²/dia)
                                altitude,      // altitude (m)
                                latitude,      // latitude (graus decimais)
                                dayOfYear      // opcional: dia do ano (1–365)
                            }: {
    tmax: number
    tmin: number
    rh: number
    u2: number
    Rs: number
    altitude: number
    latitude: number
    dayOfYear?: number
}): number {
    if ([tmax, tmin, rh, u2, Rs, altitude, latitude].some(v => isNaN(v))) return 0

    // --- 1. Temperatura média ---
    const Tmed = (tmax + tmin) / 2

    // --- 2. Dia do ano ---
    const hoje = new Date()
    const J = dayOfYear ?? Math.ceil(
        (hoje.getTime() - new Date(hoje.getFullYear(), 0, 0).getTime()) / 86400000
    )

    // --- 3. Latitude em radianos ---
    const φ = (Math.PI / 180) * latitude

    // --- 4. Distância relativa Terra–Sol e declinação solar ---
    const dr = 1 + 0.033 * Math.cos((2 * Math.PI / 365) * J)
    const δ = 0.409 * Math.sin(((2 * Math.PI / 365) * J) - 1.39)

    // --- 5. Ângulo horário do pôr do sol ---
    let temp = -Math.tan(φ) * Math.tan(δ)
    temp = Math.max(-1, Math.min(1, temp))
    const ωs = Math.acos(temp)

    // --- 6. Radiação extraterrestre (Ra) [MJ/m²/dia] ---
    const Gsc = 0.0820
    const Ra = (24 * 60 / Math.PI) * Gsc * dr *
        (ωs * Math.sin(φ) * Math.sin(δ) + Math.cos(φ) * Math.cos(δ) * Math.sin(ωs))

    // --- 7. Radiação de céu limpo (Rso) ---
    const Rso = (0.75 + (2e-5 * altitude)) * Ra

    // --- 8. Pressão atmosférica (kPa) ---
    const P = 101.3 * Math.pow((293 - 0.0065 * altitude) / 293, 5.26)

    // --- 9. Constante psicrométrica (kPa/°C) ---
    const gamma = 0.000665 * P

    // --- 10. Pressão de saturação do vapor ---
    const es_tmax = 0.6108 * Math.exp((17.27 * tmax) / (tmax + 237.3))
    const es_tmin = 0.6108 * Math.exp((17.27 * tmin) / (tmin + 237.3))
    const es = (es_tmax + es_tmin) / 2

    // --- 11. Pressão real de vapor ---
    const ea = (rh / 100) * es

    // --- 12. Inclinação da curva de pressão de vapor ---
    const delta = (4098 * (0.6108 * Math.exp((17.27 * Tmed) / (Tmed + 237.3)))) / Math.pow((Tmed + 237.3), 2)

    // --- 13. Radiação líquida de onda curta ---
    const albedo = 0.23
    const Rns = (1 - albedo) * Rs

    // --- 14. Radiação líquida de onda longa ---
    const sigma = 4.903e-9
    const Rnl = sigma * (((Math.pow(tmax + 273.16, 4) + Math.pow(tmin + 273.16, 4)) / 2)) *
        (0.34 - 0.14 * Math.sqrt(ea)) *
        (1.35 * (Rs / Rso) - 0.35)

    // --- 15. Radiação líquida total ---
    const Rn = Rns - Rnl

    // --- 16. Fluxo de calor no solo (G = 0 para base diária) ---
    const G = 0

    // --- 17. Fórmula Penman–Monteith FAO-56 ---
    const eto = (
        0.408 * delta * (Rn - G) +
        gamma * (900 / (Tmed + 273)) * u2 * (es - ea)
    ) / (delta + gamma * (1 + 0.34 * u2))

    // --- 18. ETo final (mm/dia) ---
    return Math.max(0, Number(eto.toFixed(2)))
}
