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

function isValidArticleImage(url: string): boolean {
  if (!url) return false
  const lower = url.toLowerCase()
  // Reject banners, GIFs, tiny images, ad images
  if (lower.endsWith('.gif')) return false
  if (lower.includes('banner')) return false
  if (lower.includes('anuncio')) return false
  if (lower.includes('sponsor')) return false
  if (lower.includes('ad-')) return false
  if (lower.includes('logo')) return false
  if (lower.includes('icon')) return false
  if (lower.includes('pixel')) return false
  if (lower.includes('tracking')) return false
  // Reject tiny dimension patterns (e.g. 700x110, 300x50)
  const dimMatch = lower.match(/(\d+)x(\d+)/)
  if (dimMatch) {
    const w = parseInt(dimMatch[1])
    const h = parseInt(dimMatch[2])
    if (h < 200 || w / h > 4) return false // too short or too wide = banner
  }
  return true
}

function extractImageUrl(item: any): string | null {
  const candidates: string[] = []

  // 1. All <img> from content:encoded (most reliable for article images)
  const html = item['content:encoded'] || item.content || ''
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*/gi
  let match
  while ((match = imgRegex.exec(html)) !== null) {
    candidates.push(match[1])
  }

  // 2. media:content
  const media = item['media:content']
  if (media) {
    if (Array.isArray(media)) {
      media.forEach((m: any) => { if (m.$?.url) candidates.push(m.$.url) })
    } else if (media.$?.url) {
      candidates.push(media.$.url)
    }
  }

  // 3. enclosure (often just the first image, sometimes a banner)
  if (item.enclosure?.url) candidates.push(item.enclosure.url)

  // Return first valid image (not a banner/gif/tiny)
  for (const url of candidates) {
    if (isValidArticleImage(url)) return url
  }

  return null
}

async function fetchOgImage(articleUrl: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(articleUrl, { signal: controller.signal, headers: { 'User-Agent': 'IndustriaNewsBot/1.0' } })
    clearTimeout(timeout)
    const html = await res.text()
    // Try og:image
    const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/)
    if (ogMatch?.[1] && isValidArticleImage(ogMatch[1])) return ogMatch[1]
    // Try twitter:image
    const twMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/)
    if (twMatch?.[1] && isValidArticleImage(twMatch[1])) return twMatch[1]
    return null
  } catch {
    return null
  }
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

        // Try RSS image first, then fetch og:image from article page
        let imageUrl = extractImageUrl(item)
        if (!imageUrl && item.link) {
          imageUrl = await fetchOgImage(item.link)
        }

        const { error } = await supabase.from("articles").insert({
          title: item.title,
          slug,
          content,
          excerpt,
          cover_image_url: imageUrl,
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
