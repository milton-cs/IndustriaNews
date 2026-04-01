import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { CategoryNav } from "@/components/layout/category-nav"
import { TrackerProvider } from "@/components/tracking/tracker-provider"
import { CookieBanner } from "@/components/lgpd/cookie-banner"
import { WhatsAppButton } from "@/components/layout/whatsapp-button"

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TrackerProvider>
      <Header />
      <CategoryNav />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <CookieBanner />
      <WhatsAppButton />
    </TrackerProvider>
  )
}
