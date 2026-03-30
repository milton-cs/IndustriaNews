const ZAPI_URL = `https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE_ID}/token/${process.env.ZAPI_INSTANCE_TOKEN}`

export async function sendWhatsAppMessage(phone: string, message: string): Promise<boolean> {
  if (!process.env.ZAPI_INSTANCE_ID || !process.env.ZAPI_INSTANCE_TOKEN) {
    console.warn("Z-API not configured, skipping WhatsApp notification")
    return false
  }

  // Normalize phone: remove non-digits, ensure country code
  let normalized = phone.replace(/\D/g, "")
  if (normalized.startsWith("0")) normalized = "55" + normalized.substring(1)
  if (!normalized.startsWith("55")) normalized = "55" + normalized

  try {
    const res = await fetch(`${ZAPI_URL}/send-text`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: normalized,
        message,
      }),
    })
    return res.ok
  } catch {
    console.error("Failed to send WhatsApp message")
    return false
  }
}

export function formatLeadNotification({
  leadName,
  leadCompany,
  leadEmail,
  leadPhone,
  articleTitle,
}: {
  leadName: string
  leadCompany: string
  leadEmail: string
  leadPhone: string
  articleTitle: string
}): string {
  return `🔔 *Novo Lead Qualificado!*

*Nome:* ${leadName || "—"}
*Empresa:* ${leadCompany || "—"}
*E-mail:* ${leadEmail}
*Telefone:* ${leadPhone || "—"}
*Interesse:* ${articleTitle || "Portal Indústria News"}

_Lead capturado agora pelo portal industrianews.com_`
}

export function formatDailyDigest({
  advertiserName,
  leadsCount,
  clicksCount,
  period,
}: {
  advertiserName: string
  leadsCount: number
  clicksCount: number
  period: string
}): string {
  return `📊 *Resumo de Performance — ${period}*

Olá ${advertiserName},

*${leadsCount}* leads capturados
*${clicksCount}* cliques em anúncios

Acesse seu dashboard: https://industrianews.com/dashboard

_Indústria News — Inteligência Industrial_`
}

export function formatHotLeadAlert({
  companyName,
  clickCount,
  sector,
}: {
  companyName: string
  clickCount: number
  sector: string
}): string {
  return `🔥 *Alerta de Engajamento Alto!*

A empresa *${companyName}* gerou *${clickCount} interações* no setor de *${sector}* na última hora.

Ótima oportunidade de upselling!

_Indústria News — Sistema de Inteligência_`
}
