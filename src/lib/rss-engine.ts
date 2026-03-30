import Parser from "rss-parser"
import { createAdminClient } from "@/lib/supabase/admin"

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media:content', { keepArray: true }],
      ['content:encoded', 'content:encoded'],
    ],
  },
})

function extractImageUrl(item: any): string | null {
  // 1. enclosure
  if (item.enclosure?.url) return item.enclosure.url

  // 2. media:content
  const media = item['media:content']
  if (media) {
    if (Array.isArray(media) && media[0]?.$?.url) return media[0].$.url
    if (media.$?.url) return media.$.url
  }

  // 3. Extract <img> from content
  const html = item['content:encoded'] || item.content || ''
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/)
  if (imgMatch?.[1]) return imgMatch[1]

  return null
}

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

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
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
        // Prefer full content (content:encoded > content > contentSnippet)
        const rawContent = item["content:encoded"] || item.content || item.contentSnippet || item.title
        const content = stripHtml(rawContent)
        const excerpt = (item.contentSnippet || content).substring(0, 250)

        const { error } = await supabase.from("articles").insert({
          title: item.title,
          slug,
          content,
          excerpt,
          cover_image_url: extractImageUrl(item),
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
