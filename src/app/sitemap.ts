import { createAdminClient } from "@/lib/supabase/admin"
import type { MetadataRoute } from "next"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAdminClient()
  const baseUrl = "https://industrianews.com"

  const { data: articles } = await supabase
    .from("articles")
    .select("slug, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })

  const { data: categories } = await supabase
    .from("categories")
    .select("slug")

  const articleUrls = (articles || []).map((a: any) => ({
    url: `${baseUrl}/noticia/${a.slug}`,
    lastModified: a.published_at ? new Date(a.published_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  const categoryUrls = (categories || []).map((c: any) => ({
    url: `${baseUrl}/categoria/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }))

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "hourly", priority: 1 },
    { url: `${baseUrl}/revista`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    ...categoryUrls,
    ...articleUrls,
  ]
}
