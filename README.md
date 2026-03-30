# Industria News - Portal de Noticias e Inteligencia Industrial

Plataforma SaaS para o setor industrial brasileiro: portal de noticias + revista digital + rastreamento de leads + BI setorial para anunciantes.

**Live:** https://industrianews.com

## Stack

- **Framework:** Next.js 16 (App Router, Server Components)
- **UI:** Tailwind CSS v4 + shadcn/ui
- **Banco:** Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Email:** Resend
- **WhatsApp:** Z-API
- **IA:** Anthropic Claude Haiku 4.5 (curadoria de noticias)
- **Deploy:** Vercel

## Funcionalidades

### Portal Publico
- Home com noticias em destaque + secoes por categoria
- 17 categorias industriais
- Gate de conteudo (captura leads: nome, empresa, cargo, email, whatsapp)
- Rastreamento duplo (cookie 1 ano + token de email)
- Revista digital com paginacao (48 paginas)
- Banner LGPD + Politica de Privacidade
- SEO completo (sitemap.xml, robots.txt, Open Graph)
- Importacao automatica de noticias via RSS (7 fontes, diario)
- Curadoria IA: reescreve titulos para SEO + classifica por categoria

### Dashboard do Anunciante
- Metricas: impressoes, cliques, leads, CTR, leads quentes (24h)
- Graficos de performance (ultimos 7 dias)
- Tabela de leads com botao WhatsApp direto
- Exportacao CSV de leads
- Lead Score automatico (0-100)
- Lista de campanhas e relatorios

### Painel Admin
- CRUD de artigos (criar, editar, excluir, categorizar)
- CRUD de categorias (criar, editar, excluir)
- Gestao de anunciantes (Bronze/Prata/Ouro)
- Gestao de contratos
- Configuracoes do sistema

### Notificacoes Automaticas
- WhatsApp (Z-API): lead novo notifica anunciante Plano Ouro em tempo real
- Email (Resend): lead notification + daily digest templates

## Setup Local

```bash
# Instalar dependencias
npm install

# Configurar variaveis de ambiente
cp .env.local.example .env.local
# Preencher com suas credenciais

# Rodar dev server
npm run dev
```

## Variaveis de Ambiente

| Variavel | Descricao |
|----------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key do Supabase |
| `RESEND_API_KEY` | API key do Resend (email) |
| `CRON_SECRET` | Secret para proteger endpoint do cron RSS |
| `ANTHROPIC_API_KEY` | API key da Anthropic (Claude IA) |
| `ZAPI_INSTANCE_ID` | Instance ID da Z-API (WhatsApp) |
| `ZAPI_INSTANCE_TOKEN` | Instance Token da Z-API |

## Estrutura do Projeto

```
src/
  app/
    (portal)/          # Paginas publicas (home, categorias, artigos, revista)
    admin/             # Painel administrativo
    dashboard/         # Dashboard do anunciante
    login/             # Autenticacao
    api/               # API routes (tracking, gate, cron, export)
  components/
    articles/          # Cards, grid, featured, image fallback
    dashboard/         # Nav, graficos
    gate/              # Content gate (captura leads)
    layout/            # Header, footer, category nav
    lgpd/              # Cookie banner
    magazine/          # Viewer paginado
    tracking/          # Tracker provider
  lib/
    supabase/          # Clients (browser, server, admin)
    email.ts           # Templates Resend
    whatsapp.ts        # Integracao Z-API
    rss-engine.ts      # Importacao RSS + curadoria IA
    tracking.ts        # Utilitarios de tracking
    types.ts           # Tipos compartilhados
```

## Banco de Dados (Supabase)

12 tabelas com RLS:
- `profiles` - Usuarios (admin, comercial, anunciante, leitor)
- `categories` - 17 setores industriais
- `articles` - Noticias do portal
- `readers` - Leads capturados
- `advertisers` - Anunciantes
- `campaigns` - Campanhas de anuncio
- `tracking_events` - Eventos de rastreamento
- `contracts` - Contratos comerciais
- `reports` - Relatorios PDF
- `lead_notifications` - Fila de notificacoes
- `magazine_editions` - Edicoes da revista
- `magazine_pages` - Paginas da revista

## Credenciais de Teste

| Tipo | Email | Senha |
|------|-------|-------|
| Admin | admin@industrianews.com | admin2026! |
| Anunciante | demo@embraer.com | demo2026! |

## Empresa

**Revista Segmentada e Publicidade LTDA**
Av. Paulista, 1636, Sala 1105 - Sao Paulo, SP
