import { NextResponse } from "next/server"
import axios from "axios"

const ESP32_BASE_URL = process.env.ESP32_BASE_URL || "http://172.16.107.174"

export async function POST(request: Request) {
  try {
    const { mode } = await request.json()

    if (!mode || !["automatico", "manual"].includes(mode)) {
      return NextResponse.json({ error: "Invalid mode" }, { status: 400 })
    }

    const response = await axios.post(
      `${ESP32_BASE_URL}/api/modo/${mode}`,
      {},
      {
        timeout: 5000,
      },
    )
    return NextResponse.json(response.data)
  } catch (error) {
    console.error("[v0] Error setting ESP32 mode:", error)
    return NextResponse.json({ error: "Failed to set mode" }, { status: 500 })
  }
}
