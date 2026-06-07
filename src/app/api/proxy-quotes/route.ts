import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.PROXY_BACKEND_URL || 'http://47.236.104.44:8000'

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/quotes/random`, {
      cache: 'no-store',
    })
    if (!res.ok) throw new Error(`Backend error: ${res.status}`)
    const data = await res.json()
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}