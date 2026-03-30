"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const advertiserLinks = [
  { href: "/dashboard", label: "Visão Geral" },
  { href: "/dashboard/leads", label: "Leads" },
  { href: "/dashboard/relatorios", label: "Relatórios" },
  { href: "/dashboard/campanhas", label: "Campanhas" },
]

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/artigos", label: "Artigos" },
  { href: "/admin/anunciantes", label: "Anunciantes" },
  { href: "/admin/contratos", label: "Contratos" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/configuracoes", label: "Configurações" },
]

export function DashboardNav({ role }: { role: string }) {
  const pathname = usePathname()
  const links = role === "admin" || role === "comercial" ? adminLinks : advertiserLinks

  return (
    <nav className="w-56 border-r border-white/10 min-h-[calc(100vh-65px)] p-4">
      <ul className="space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`block px-3 py-2 rounded-lg text-sm font-headline uppercase tracking-wide transition-colors ${
                  isActive
                    ? "bg-brand-lavanda/20 text-brand-lavanda"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
