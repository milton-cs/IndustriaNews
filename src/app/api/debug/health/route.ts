import { RSS_SOURCES } from "@/lib/rss-engine"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json({
    deployedAt: new Date().toISOString(),
    rssSources: RSS_SOURCES.map((s) => s.name),
    rssCount: RSS_SOURCES.length,
    version: "diag-2026-04-28",
  })
}
