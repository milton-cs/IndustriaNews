import Parser from "rss-parser"
import { createAdminClient } from "@/lib/supabase/admin"

const parser = new Parser()

const RSS_SOURCES = [
  { url: "https://noticias.portaldaindustria.com.br/rss", name: "Portal da Indústria" },
  { url: "https://industriasa.com.br/feed/", name: "Indústria SA" },
  { url: "https://gironews.com/feed/", name: "Giro News" },
  { url: "https://clickpetroleoegas.com.br/feed/", name: "Click Petróleo e Gás" },
  { url: "https://tissueonline.com.br/feed/", name: "Tissue Online" },
  { url: "https://revistamineracao.com.br/feed/", name: "Revista Mineração" },
  { url: "https://www.fiesp.com.br/feed/", name: "FIESP" },
]

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .substring(0, 200)
}

export async function fetchAndStoreArticles(): Promise<{ imported: number; errors: number }> {
  const supabase = createAdminClient()
  let imported = 0
  let errors = 0

  for (const source of RSS_SOURCES) {
    try {
      const feed = await parser.parseURL(source.url)

      for (const item of feed.items.slice(0, 10)) {
        if (!item.title || !item.link) continue

        const slug = slugify(item.title) + "-" + Date.now().toString(36)
        const content = item.contentSnippet || item.content || item.title
        const excerpt = (item.contentSnippet || "").substring(0, 200)

        const { error } = await supabase.from("articles").insert({
          title: item.title,
          slug,
          content,
          excerpt,
          cover_image_url: item.enclosure?.url || null,
          source_url: item.link,
          source_name: source.name,
          is_ai_curated: false,
          status: "published",
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        })

        if (error) {
          if (error.code === "23505") continue
          errors++
        } else {
          imported++
        }
      }
    } catch {
      errors++
    }
  }

  return { imported, errors }
}
