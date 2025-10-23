import { NextResponse } from "next/server"
import axios from "axios"

const ESP32_BASE_URL = process.env.ESP32_BASE_URL || "http://172.16.107.174"

export async function GET() {
  try {
    const response = await axios.get(`${ESP32_BASE_URL}/api/bomba`, {
      timeout: 5000,
    })
    return NextResponse.json(response.data)
  } catch (error) {
    console.error("[v0] Error fetching ESP32 pump status:", error)
    return NextResponse.json({ error: "Failed to fetch pump status" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { action } = await request.json()

    if (!action || !["ligar", "desligar"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const response = await axios.post(
      `${ESP32_BASE_URL}/api/bomba/${action}`,
      {},
      {
        timeout: 5000,
      },
    )
    return NextResponse.json(response.data)
  } catch (error) {
    console.error("[v0] Error controlling ESP32 pump:", error)
    return NextResponse.json({ error: "Failed to control pump" }, { status: 500 })
  }
}
