export interface WeatherData {
  temperature: number
  humidity: number
  windSpeed: number
  precipitation: number
  weatherCode: number
  soilMoisture: number
}

export interface WeatherForecast {
  date: string
  temperatureMax: number
  temperatureMin: number
  precipitation: number
  humidity: number
}

export async function getWeatherData(lat: number, lng: number): Promise<WeatherData> {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,soil_moisture_0_to_1cm&timezone=America/Sao_Paulo`,
    )

    if (!response.ok) {
      throw new Error("Failed to fetch weather data")
    }

    const data = await response.json()
    const current = data.current

    return {
      temperature: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      precipitation: current.precipitation,
      weatherCode: current.weather_code,
      soilMoisture: current.soil_moisture_0_to_1cm * 100, // Convert to percentage
    }
  } catch (error) {
    console.error("[v0] Error fetching weather data:", error)
    // Return mock data as fallback
    return {
      temperature: 25,
      humidity: 65,
      windSpeed: 12,
      precipitation: 0,
      weatherCode: 0,
      soilMoisture: 45,
    }
  }
}

export async function getWeatherForecast(lat: number, lng: number, days = 7): Promise<WeatherForecast[]> {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_mean&timezone=America/Sao_Paulo&forecast_days=${days}`,
    )

    if (!response.ok) {
      throw new Error("Failed to fetch weather forecast")
    }

    const data = await response.json()
    const daily = data.daily

    return daily.time.map((date: string, index: number) => ({
      date,
      temperatureMax: daily.temperature_2m_max[index],
      temperatureMin: daily.temperature_2m_min[index],
      precipitation: daily.precipitation_sum[index],
      humidity: daily.relative_humidity_2m_mean[index],
    }))
  } catch (error) {
    console.error("[v0] Error fetching weather forecast:", error)
    // Return mock data as fallback
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      temperatureMax: 28 + Math.random() * 5,
      temperatureMin: 18 + Math.random() * 5,
      precipitation: Math.random() * 10,
      humidity: 60 + Math.random() * 20,
    }))
  }
}

export function getWeatherDescription(code: number): string {
  const weatherCodes: { [key: number]: string } = {
    0: "Céu limpo",
    1: "Principalmente limpo",
    2: "Parcialmente nublado",
    3: "Nublado",
    45: "Neblina",
    48: "Neblina com geada",
    51: "Garoa leve",
    53: "Garoa moderada",
    55: "Garoa forte",
    61: "Chuva leve",
    63: "Chuva moderada",
    65: "Chuva forte",
    71: "Neve leve",
    73: "Neve moderada",
    75: "Neve forte",
    77: "Granizo",
    80: "Pancadas de chuva leves",
    81: "Pancadas de chuva moderadas",
    82: "Pancadas de chuva fortes",
    85: "Pancadas de neve leves",
    86: "Pancadas de neve fortes",
    95: "Tempestade",
    96: "Tempestade com granizo leve",
    99: "Tempestade com granizo forte",
  }

  return weatherCodes[code] || "Desconhecido"
}
