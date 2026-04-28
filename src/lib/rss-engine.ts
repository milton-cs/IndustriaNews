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

type AiCurateResult =
  | { kind: "ok"; seoTitle: string; categorySlug: string }
  | { kind: "irrelevant" }
  | { kind: "error" }

// Keywords for fallback relevance check when AI is unavailable
const IRRELEVANT_KEYWORDS = [
  "futebol", "novela", "celebridade", "celebridades", "BBB", "Big Brother",
  "fofoca", "famosos", "instagram da", "instagram do", "horoscopo", "horóscopo",
  "globoplay", "netflix", "amazon prime", "campeonato brasileiro", "libertadores",
  "copa do brasil", "supercopa", "final do brasileirão", "olimpiadas", "olimpíadas",
  "cantor ", "cantora ", "ator ", "atriz ", "casamento de", "morte de",
  "homicídio", "assassinato", "estuprador", "ostomizadas",
]

const RELEVANT_KEYWORDS = [
  "indústria", "industrial", "manufatura", "fabrica", "fábrica", "fabricação",
  "mineração", "mineradora", "siderurgia", "metalurgia", "petróleo", "gás",
  "energia", "renovável", "solar", "eólica", "hidrelétrica", "infraestrutura",
  "construção civil", "obra", "logística", "transporte de cargas", "porto",
  "ferrovia", "rodovia", "agronegócio", "commodities", "exportação",
  "importação", "química", "petroquímica", "automotiv", "embraer", "aeroespacial",
  "defesa", "tecnologia industrial", "automação", "robótica", "indústria 4.0",
  "ESG", "sustentabilidade industrial", "saneamento", "celulose", "papel",
  "têxtil", "confecção", "alimentos", "bebidas industrializadas", "farmacêutica",
  "máquinas", "equipamentos industriais", "FIESP", "CNI", "BNDES",
  "investimento industrial", "PIB industrial", "produção industrial",
]

// Maps keywords to category slugs for fallback categorization
const CATEGORY_KEYWORDS: { slug: string; keywords: string[] }[] = [
  { slug: "automotivo", keywords: ["automotiv", "carro", "veículo", "veiculo", "embraer", "fiat", "volkswagen", "toyota", "honda"] },
  { slug: "mineracao", keywords: ["mineração", "mineracao", "mineradora", "minério", "minerio", "vale s.a.", "ibram"] },
  { slug: "petroleo-e-gas", keywords: ["petróleo", "petroleo", "gás natural", "gas natural", "petrobras", "petroquím", "petroquim", "refinaria"] },
  { slug: "energia-eletrica", keywords: ["energia elétrica", "energia eletrica", "eletrobras", "eólica", "eolica", "solar", "hidrelétrica", "hidreletrica"] },
  { slug: "metalurgia-e-siderurgia", keywords: ["siderurgia", "metalurgia", "aço", "ferro", "csn", "usiminas", "gerdau"] },
  { slug: "alimentos-e-bebidas", keywords: ["alimento", "bebida", "ambev", "jbs", "brf", "minerva", "marfrig"] },
  { slug: "farmaceutica-e-cosmeticos", keywords: ["farmacêutica", "farmaceutica", "medicamento", "vacina", "interfarma", "cosmético", "cosmetico"] },
  { slug: "papel-e-celulose", keywords: ["celulose", "papel", "tissue", "suzano", "klabin"] },
  { slug: "textil-e-confeccao", keywords: ["têxtil", "textil", "confecção", "confeccao", "moda industrial"] },
  { slug: "quimica-e-petroquimica", keywords: ["química", "quimica", "petroquímica", "petroquimica", "abiquim", "braskem"] },
  { slug: "maquinas-e-equipamentos", keywords: ["máquinas", "maquinas", "equipamento industrial", "weg"] },
  { slug: "infraestrutura", keywords: ["infraestrutura", "rodovia", "ferrovia", "porto", "saneamento básico"] },
  { slug: "edificacoes", keywords: ["edificação", "edificacao", "construção civil", "construcao civil", "obra civil"] },
  { slug: "industria-4-0", keywords: ["indústria 4.0", "industria 4.0", "automação", "automacao", "robótica", "robotica", "iot industrial", "ia industrial"] },
  { slug: "esg-e-sustentabilidade", keywords: ["esg", "sustentabilidade", "carbono", "emissões", "emissoes", "amazônia industrial"] },
  { slug: "saneamento-e-residuos", keywords: ["saneamento", "resíduo", "residuo", "tratamento de água", "tratamento de agua"] },
  { slug: "defesa-e-aeroespacial", keywords: ["defesa", "aeroespacial", "embraer", "satélite", "satelite"] },
]

function keywordRelevanceCheck(title: string, excerpt: string): "relevant" | "irrelevant" | "unknown" {
  const text = (title + " " + excerpt).toLowerCase()
  for (const kw of IRRELEVANT_KEYWORDS) {
    if (text.includes(kw.toLowerCase())) return "irrelevant"
  }
  for (const kw of RELEVANT_KEYWORDS) {
    if (text.includes(kw.toLowerCase())) return "relevant"
  }
  return "unknown"
}

function keywordCategorize(title: string, excerpt: string): string | null {
  const text = (title + " " + excerpt).toLowerCase()
  for (const cat of CATEGORY_KEYWORDS) {
    for (const kw of cat.keywords) {
      if (text.includes(kw.toLowerCase())) return cat.slug
    }
  }
  return null
}

async function aiCurate(title: string, excerpt: string): Promise<AiCurateResult> {
  if (!anthropic) return { kind: "error" }
  try {
    const categorySlugs = Object.keys(CATEGORIES_MAP).join(", ")
    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      messages: [{
        role: "user",
        content: `Você é um editor do portal Indústria News, focado EXCLUSIVAMENTE no setor industrial brasileiro.

Dado este artigo:
Título: ${title}
Resumo: ${excerpt.substring(0, 300)}

Faça:
1. Avalie se o artigo é relevante para o setor industrial (manufatura, commodities, energia, infraestrutura, mineração, agronegócio industrial, tecnologia industrial, logística, negócios B2B, economia industrial). Se NÃO for relevante (ex: esportes, política partidária, entretenimento, saúde pessoal, literatura, celebridades), responda APENAS: {"relevant": false}
2. Se for relevante, reescreva o título para SEO (máximo 80 caracteres, direto, informativo, em português do Brasil)
3. Classifique em UMA destas categorias: ${categorySlugs}

Responda EXATAMENTE neste formato JSON:
Se relevante: {"relevant": true, "seoTitle": "título reescrito", "categorySlug": "slug-da-categoria"}
Se irrelevante: {"relevant": false}`
      }],
    })
    const text = msg.content[0].type === "text" ? msg.content[0].text : ""
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      if (parsed.relevant === false) return { kind: "irrelevant" }
      if (parsed.seoTitle && parsed.categorySlug) {
        return { kind: "ok", seoTitle: parsed.seoTitle, categorySlug: parsed.categorySlug }
      }
    }
    return { kind: "error" }
  } catch {
    return { kind: "error" }
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
  if (lower.includes('fb_marca')) return false
  if (lower.includes('placeholder')) return false
  if (lower.includes('og-image-default')) return false
  if (lower.includes('default-share')) return false
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

async function fetchFullArticleContent(articleUrl: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 7000)
    const res = await fetch(articleUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; IndustriaNewsBot/1.0; +https://industrianews.com)' }
    })
    clearTimeout(timeout)
    if (!res.ok) return null
    const html = await res.text()

    // Strip script/style/nav/aside/footer blocks before extraction
    const cleaned = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
      .replace(/<aside[\s\S]*?<\/aside>/gi, ' ')
      .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
      .replace(/<header[\s\S]*?<\/header>/gi, ' ')

    // Try semantic article containers in order of preference
    const patterns: RegExp[] = [
      /<article[^>]*>([\s\S]*?)<\/article>/i,
      /<div[^>]*itemprop=["']articleBody["'][^>]*>([\s\S]*?)<\/div>\s*<\/(?:section|main|article)/i,
      /<div[^>]*class=["'][^"']*(?:article-body|article__body|post-content|entry-content|content-text|materia-corpo|noticia-corpo|content-body)[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*<\/(?:section|main|article|div)/i,
      /<main[^>]*>([\s\S]*?)<\/main>/i,
    ]

    for (const pattern of patterns) {
      const match = cleaned.match(pattern)
      if (match && match[1]) {
        const text = stripHtml(match[1])
        if (text.length > 500) return text.substring(0, 10000)
      }
    }
    return null
  } catch {
    return null
  }
}

export const RSS_SOURCES = [
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
  // Novas fontes
  { url: "https://agenciasebrae.com.br/siga-nosso-feed-rss/", name: "Agência Sebrae" },
  { url: "https://agenciadenoticias.bndes.gov.br/industria", name: "BNDES" },
  { url: "https://amanha.com.br/categoria/500-maiores-do-sul?format=feed&type=rss", name: "Amanhã - 500 Maiores do Sul" },
  { url: "https://amanha.com.br/categoria/industria?format=feed&type=rss", name: "Amanhã - Indústria" },
  { url: "https://amanha.com.br/categoria/negocios-do-sul1?format=feed&type=rss", name: "Amanhã - Negócios do Sul" },
  { url: "https://agenciabrasil.ebc.com.br/rss/economia/feed.xml", name: "Agência Brasil - Economia" },
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
        let content = stripHtml(rawContent)

        // Fallback: if RSS only gave a short snippet, fetch full article from source URL
        if (content.length < 500 && item.link) {
          const fullContent = await fetchFullArticleContent(item.link)
          if (fullContent && fullContent.length > content.length) {
            content = fullContent
          }
        }

        // Skip articles with no real body (feeds that only provide title repeated as content)
        if (content.length < 300) continue

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

        // AI curation: filter relevance + rewrite title for SEO + classify category
        const aiResult = await aiCurate(item.title, excerpt)

        // If AI confirmed irrelevant → skip
        if (aiResult.kind === "irrelevant") continue

        // If AI errored (no credits, timeout, etc.) → fallback to keyword-based filter
        if (aiResult.kind === "error") {
          const relevance = keywordRelevanceCheck(item.title, excerpt)
          if (relevance === "irrelevant") continue
          // If "unknown" or "relevant" — let it through (better to have than not)
        }

        let categoryId: string | null = null
        let seoTitle: string | null = null
        let categorySlug: string | null = null

        if (aiResult.kind === "ok") {
          seoTitle = aiResult.seoTitle
          categorySlug = aiResult.categorySlug
        } else {
          // AI failed → categorize via keywords as fallback
          categorySlug = keywordCategorize(item.title, excerpt)
        }

        // Look up category ID by slug (works for both AI and keyword fallback)
        if (categorySlug) {
          const { data: cat } = await supabase
            .from("categories")
            .select("id")
            .eq("slug", categorySlug)
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
          is_ai_curated: aiResult.kind === "ok",
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
