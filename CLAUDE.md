@AGENTS.md

# Industria News - Contexto do Projeto

Portal SaaS de noticias industriais com rastreamento de leads para anunciantes.

## Stack
- Next.js 16 (App Router) + Tailwind CSS v4 (config via CSS @theme inline)
- Supabase (PostgreSQL + Auth + RLS)
- Resend (email) + Z-API (WhatsApp) + Anthropic Claude Haiku (IA)
- Deploy: Vercel

## Arquitetura
- `(portal)/` = paginas publicas com header/footer
- `admin/` = painel admin (role admin/comercial)
- `dashboard/` = painel anunciante (role anunciante)
- `login/` = auth isolado (sem header/footer)
- `api/` = endpoints REST + cron

## Banco
12 tabelas com RLS. Admin usa `is_admin()` function SECURITY DEFINER para evitar recursao.
Lead score calculado via trigger `trg_update_lead_score` em tracking_events.

## Dominio
https://industrianews.com
