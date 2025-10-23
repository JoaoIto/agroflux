import { NextResponse } from "next/server"
import axios from "axios"

const ESP32_BASE_URL = process.env.ESP32_BASE_URL || "http://172.16.107.174"

export async function GET() {
  try {
    const response = await axios.get(`${ESP32_BASE_URL}/api/solo`, {
      timeout: 5000,
    })
    return NextResponse.json(response.data)
  } catch (error) {
    console.error("[v0] Error fetching ESP32 soil data:", error)
    return NextResponse.json({ error: "Failed to fetch soil data" }, { status: 500 })
  }
}
