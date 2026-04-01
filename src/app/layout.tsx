import type { Metadata } from "next"
import "@fontsource-variable/inter-tight"
import "@fontsource/lora/400.css"
import "@fontsource/lora/700.css"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "Indústria News — Portal de Notícias Industriais",
    template: "%s | Indústria News",
  },
  description: "O portal de notícias e inteligência para o setor industrial brasileiro.",
  metadataBase: new URL("https://industrianews.com"),
  verification: {
    google: "ChwtM5eVhSUTmGGshJF09329Lc1gm8icezuucELUVWw",
  },
  openGraph: {
    siteName: "Indústria News",
    locale: "pt_BR",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
