import { fetchAndStoreArticles } from "@/lib/rss-engine"
import { NextRequest, NextResponse } from "next/server"

export const maxDuration = 300

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== "Bearer " + process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const result = await fetchAndStoreArticles()

  return NextResponse.json({
    ok: true,
    imported: result.imported,
    errors: result.errors,
    timestamp: new Date().toISOString(),
  })
}
