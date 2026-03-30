import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendLeadNotification({
  to,
  advertiserName,
  leadName,
  leadCompany,
  leadEmail,
  leadPhone,
  articleTitle,
}: {
  to: string
  advertiserName: string
  leadName: string
  leadCompany: string
  leadEmail: string
  leadPhone: string
  articleTitle: string
}) {
  return resend.emails.send({
    from: "Indústria News <noreply@industrianews.com>",
    to,
    subject: `[LEAD] Novo interessado — ${leadCompany || leadName}`,
    html: `
      <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="color: #8E9ED6; font-size: 18px; font-weight: bold; letter-spacing: -0.5px;">INDÚSTRIA</span>
          <span style="color: #1A1A1A; font-size: 22px; font-weight: 900; letter-spacing: -0.5px;"> NEWS</span>
        </div>
        <div style="background: #f8f8f6; border-radius: 12px; padding: 24px; margin-bottom: 16px;">
          <h2 style="color: #1A1A1A; font-size: 18px; margin: 0 0 16px;">Novo Lead Qualificado!</h2>
          <p style="color: #666; font-size: 14px; margin: 0 0 16px;">
            Olá ${advertiserName}, alguém demonstrou interesse no seu anúncio.
          </p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #999; font-size: 12px; text-transform: uppercase;">Nome</td><td style="padding: 8px 0; color: #1A1A1A; font-weight: 500;">${leadName || "—"}</td></tr>
            <tr><td style="padding: 8px 0; color: #999; font-size: 12px; text-transform: uppercase;">Empresa</td><td style="padding: 8px 0; color: #1A1A1A; font-weight: 500;">${leadCompany || "—"}</td></tr>
            <tr><td style="padding: 8px 0; color: #999; font-size: 12px; text-transform: uppercase;">E-mail</td><td style="padding: 8px 0; color: #1A1A1A; font-weight: 500;">${leadEmail}</td></tr>
            <tr><td style="padding: 8px 0; color: #999; font-size: 12px; text-transform: uppercase;">Telefone</td><td style="padding: 8px 0; color: #1A1A1A; font-weight: 500;">${leadPhone || "—"}</td></tr>
            <tr><td style="padding: 8px 0; color: #999; font-size: 12px; text-transform: uppercase;">Artigo</td><td style="padding: 8px 0; color: #1A1A1A; font-weight: 500;">${articleTitle || "—"}</td></tr>
          </table>
          ${leadPhone ? `<a href="https://wa.me/${leadPhone.replace(/\\D/g, "")}" style="display: inline-block; margin-top: 16px; padding: 10px 20px; background: #25D366; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">Chamar no WhatsApp</a>` : ""}
        </div>
        <p style="color: #999; font-size: 11px; text-align: center;">
          Indústria News — Portal de Notícias e Inteligência Industrial
        </p>
      </div>
    `,
  })
}

export async function sendDailyDigest({
  to,
  advertiserName,
  leadsCount,
  clicksCount,
  period,
}: {
  to: string
  advertiserName: string
  leadsCount: number
  clicksCount: number
  period: string
}) {
  return resend.emails.send({
    from: "Indústria News <noreply@industrianews.com>",
    to,
    subject: `[Resumo] ${leadsCount} leads capturados — ${period}`,
    html: `
      <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="color: #8E9ED6; font-size: 18px; font-weight: bold;">INDÚSTRIA</span>
          <span style="color: #1A1A1A; font-size: 22px; font-weight: 900;"> NEWS</span>
        </div>
        <div style="background: #f8f8f6; border-radius: 12px; padding: 24px;">
          <h2 style="color: #1A1A1A; font-size: 18px; margin: 0 0 8px;">Resumo de Performance</h2>
          <p style="color: #666; font-size: 14px; margin: 0 0 24px;">${advertiserName} — ${period}</p>
          <div style="display: flex; gap: 16px;">
            <div style="flex: 1; background: white; border-radius: 8px; padding: 16px; text-align: center;">
              <div style="color: #8E9ED6; font-size: 32px; font-weight: 900;">${leadsCount}</div>
              <div style="color: #999; font-size: 12px; text-transform: uppercase;">Leads</div>
            </div>
            <div style="flex: 1; background: white; border-radius: 8px; padding: 16px; text-align: center;">
              <div style="color: #1A1A1A; font-size: 32px; font-weight: 900;">${clicksCount}</div>
              <div style="color: #999; font-size: 12px; text-transform: uppercase;">Cliques</div>
            </div>
          </div>
          <a href="https://industrianews.com/dashboard" style="display: block; margin-top: 24px; padding: 12px; background: #8E9ED6; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; text-align: center;">Ver Dashboard Completo</a>
        </div>
      </div>
    `,
  })
}
