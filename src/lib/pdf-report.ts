export function generateReportHtml({
  advertiserName, period, impressions, clicks, leads, ctr, leadsList,
}: {
  advertiserName: string; period: string; impressions: number; clicks: number
  leads: number; ctr: string
  leadsList: { name: string; company: string; position: string; email: string; phone: string }[]
}): string {
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>Relatório — ${advertiserName}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Helvetica Neue',Arial,sans-serif;color:#1A1A1A;background:#fff}
.page{max-width:800px;margin:0 auto;padding:40px}
.header{text-align:center;border-bottom:3px solid #8E9ED6;padding-bottom:24px;margin-bottom:32px}
.logo{color:#8E9ED6;font-size:14px;font-weight:700;letter-spacing:2px;text-transform:uppercase}
.logo span{color:#1A1A1A;font-size:18px;font-weight:900}
.title{font-size:24px;font-weight:900;text-transform:uppercase;margin-top:16px;letter-spacing:-0.5px}
.subtitle{color:#666;font-size:14px;margin-top:8px}
.period{color:#8E9ED6;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-top:4px}
.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:32px}
.metric{background:#F8F8F6;border-radius:12px;padding:20px;text-align:center}
.metric-value{font-size:32px;font-weight:900}
.metric-label{font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;margin-top:4px}
.highlight .metric-value{color:#8E9ED6}
h2{font-size:16px;font-weight:900;text-transform:uppercase;letter-spacing:.5px;margin-bottom:16px}
table{width:100%;border-collapse:collapse;margin-bottom:32px}
th{background:#1E1E2E;color:#fff;padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.5px}
td{padding:10px 12px;border-bottom:1px solid #eee;font-size:13px}
tr:nth-child(even){background:#FAFAF8}
.footer{text-align:center;margin-top:40px;padding-top:24px;border-top:1px solid #eee;color:#999;font-size:11px}
@media print{.page{padding:20px}}
</style></head><body><div class="page">
<div class="header">
<div class="logo">INDÚSTRIA <span>NEWS</span></div>
<div class="title">Relatório de Inteligência e Performance</div>
<div class="subtitle">Preparado exclusivamente para: <strong>${advertiserName}</strong></div>
<div class="period">${period}</div>
</div>
<div class="metrics">
<div class="metric"><div class="metric-value">${impressions.toLocaleString("pt-BR")}</div><div class="metric-label">Impressões</div></div>
<div class="metric highlight"><div class="metric-value">${clicks.toLocaleString("pt-BR")}</div><div class="metric-label">Cliques</div></div>
<div class="metric highlight"><div class="metric-value">${leads}</div><div class="metric-label">Leads</div></div>
<div class="metric"><div class="metric-value">${ctr}</div><div class="metric-label">CTR</div></div>
</div>
<h2>Leads Qualificados do Período</h2>
<table><thead><tr><th>Nome</th><th>Empresa</th><th>Cargo</th><th>E-mail</th><th>Telefone</th></tr></thead>
<tbody>${leadsList.map(l => `<tr><td>${l.name || "—"}</td><td>${l.company || "—"}</td><td>${l.position || "—"}</td><td>${l.email || "—"}</td><td>${l.phone || "—"}</td></tr>`).join("")}
${leadsList.length === 0 ? '<tr><td colspan="5" style="text-align:center;color:#999">Nenhum lead no período</td></tr>' : ""}</tbody></table>
<div class="footer"><p>Indústria News — industrianews.com</p><p>Relatório gerado automaticamente</p></div>
</div></body></html>`
}
