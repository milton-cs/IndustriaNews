import Parser from "rss-parser"
import Anthropic from "@anthropic-ai/sdk"
import { createAdminClient } from "@/lib/supabase/admin"

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null

const CATEGORIES_MAP: Record<string, string> = {
  "alimentos-e-bebidas": "Alimentos e Bebidas",
  "automotivo": "Automotivo",
  "textil-e-confeccao": "Têxtil e Confecção",
  "quimica-e-petroquimica": "Química e Petroquímica",
  "metalurgia-e-siderurgia": "Metalurgia e Siderurgia",
  "maquinas-e-equipamentos": "Máquinas e Equipamentos",
  "papel-e-celulose": "Papel e Celulose",
  "farmaceutica-e-cosmeticos": "Farmacêutica e Cosméticos",
  "mineracao": "Mineração",
  "petroleo-e-gas": "Petróleo e Gás",
  "edificacoes": "Edificações",
  "infraestrutura": "Infraestrutura",
  "energia-eletrica": "Energia Elétrica",
  "saneamento-e-residuos": "Saneamento e Resíduos",
  "industria-4-0": "Indústria 4.0",
  "esg-e-sustentabilidade": "ESG e Sustentabilidade",
  "defesa-e-aeroespacial": "Defesa e Aeroespacial",
}

async function aiCurate(title: string, excerpt: string): Promise<{ seoTitle: string; categorySlug: string } | null> {
  if (!anthropic) return null
  try {
    const categorySlugs = Object.keys(CATEGORIES_MAP).join(", ")
    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      messages: [{
        role: "user",
        content: `Você é um editor do portal Indústria News. Dado este artigo:

Título: ${title}
Resumo: ${excerpt.substring(0, 300)}

Faça:
1. Reescreva o título para SEO (máximo 80 caracteres, direto, informativo, em português do Brasil)
2. Classifique em UMA destas categorias: ${categorySlugs}

Responda EXATAMENTE neste formato JSON:
{"seoTitle": "título reescrito", "categorySlug": "slug-da-categoria"}`
      }],
    })
    const text = msg.content[0].type === "text" ? msg.content[0].text : ""
    const jsonMatch = text.match(/\{[^}]+\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      if (parsed.seoTitle && parsed.categorySlug) return parsed
    }
    return null
  } catch {
    return null
  }
}

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
  // Fontes originais
  { url: "https://noticias.portaldaindustria.com.br/rss", name: "Portal da Indústria" },
  { url: "https://industriasa.com.br/feed/", name: "Indústria SA" },
  { url: "https://gironews.com/feed/", name: "Giro News" },
  { url: "https://clickpetroleoegas.com.br/feed/", name: "Click Petróleo e Gás" },
  { url: "https://tissueonline.com.br/feed/", name: "Tissue Online" },
  { url: "https://revistamineracao.com.br/feed/", name: "Revista Mineração" },
  { url: "https://www.fiesp.com.br/feed/", name: "FIESP" },
  // Grandes portais
  { url: "https://valor.globo.com/tudo-sobre/setor/industria-setor-industrial/rss", name: "Valor Econômico" },
  { url: "https://www.cnnbrasil.com.br/tudo-sobre/industria/feed/", name: "CNN Brasil" },
  { url: "https://exame.com/noticias-sobre/industria/feed/", name: "Exame" },
  { url: "https://veja.abril.com.br/noticias-sobre/industria/feed/", name: "Veja" },
  // Confederações e Associações
  { url: "https://cni.portaldaindustria.com.br/rss", name: "CNI" },
  { url: "https://www.abinee.org.br/noticias/todas/feed/", name: "ABINEE" },
  { url: "https://abia.org.br/noticias/feed/", name: "ABIA" },
  { url: "https://abiquim.org.br/comunicacao/noticias/feed/", name: "ABIQUIM" },
  { url: "https://www.interfarma.org.br/noticias/feed/", name: "Interfarma" },
  { url: "https://www.abit.org.br/noticias/feed/", name: "ABIT" },
  { url: "https://www.abicalcados.com.br/conteudo/noticias/feed/", name: "Abicalçados" },
  { url: "https://www.acobrasil.org.br/site/noticias/feed/", name: "Aço Brasil" },
  { url: "https://ibram.org.br/noticias/feed/", name: "IBRAM" },
]

// Fallback images by keyword (Unsplash, free, high-quality)
const FALLBACK_IMAGES: Record<string, string> = {
  mineração: 'https://images.unsplash.com/photo-1578496479914-7ef3b0193be3?w=800&q=80',
  mineracao: 'https://images.unsplash.com/photo-1578496479914-7ef3b0193be3?w=800&q=80',
  automotivo: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=800&q=80',
  metalurgia: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80',
  siderurgia: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80',
  energia: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80',
  solar: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80',
  eólica: 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=800&q=80',
  indústria: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80',
  automação: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80',
  robótica: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80',
  farmacêutico: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&q=80',
  petróleo: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800&q=80',
  construção: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
  logística: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
  alimentos: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
  têxtil: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&q=80',
  química: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&q=80',
  papel: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=800&q=80',
  sustentabilidade: 'https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=800&q=80',
  esg: 'https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=800&q=80',
  defesa: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800&q=80',
  aeroespacial: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800&q=80',
}
const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80'

function getFallbackImage(title: string): string {
  const lower = title.toLowerCase()
  for (const [keyword, url] of Object.entries(FALLBACK_IMAGES)) {
    if (lower.includes(keyword)) return url
  }
  return DEFAULT_FALLBACK
}

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

        // Try RSS image first, then og:image, then keyword-based fallback
        let imageUrl = extractImageUrl(item)
        if (!imageUrl && item.link) {
          imageUrl = await fetchOgImage(item.link)
        }
        if (!imageUrl) {
          imageUrl = getFallbackImage(item.title || '')
        }
        // Always ensure HTTPS
        if (imageUrl && imageUrl.startsWith('http://')) {
          imageUrl = imageUrl.replace('http://', 'https://')
        }

        // AI curation: rewrite title for SEO + classify category
        const aiResult = await aiCurate(item.title, excerpt)
        let categoryId: string | null = null
        let seoTitle: string | null = null

        if (aiResult) {
          seoTitle = aiResult.seoTitle
          // Look up category ID by slug
          const { data: cat } = await supabase
            .from("categories")
            .select("id")
            .eq("slug", aiResult.categorySlug)
            .single()
          if (cat) categoryId = cat.id
        }

        const { error } = await supabase.from("articles").insert({
          title: seoTitle || item.title,
          seo_title: seoTitle,
          slug,
          content,
          excerpt,
          cover_image_url: imageUrl,
          category_id: categoryId,
          source_url: item.link,
          source_name: source.name,
          is_ai_curated: !!aiResult,
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
