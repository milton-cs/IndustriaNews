import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const offset = parseInt(searchParams.get("offset") || "0")
  const limit = parseInt(searchParams.get("limit") || "12")
  const category = searchParams.get("category")

  const supabase = await createClient()

  let query = supabase
    .from("articles")
    .select("title, slug, excerpt, cover_image_url, published_at, source_name, categories(name, slug)")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (category) {
    const { data: cat } = await supabase.from("categories").select("id").eq("slug", category).single()
    if (cat) query = query.eq("category_id", cat.id)
  }

  const { data } = await query
  return NextResponse.json(data || [])
}
