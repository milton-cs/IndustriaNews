import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single()

  if (!profile || !["admin", "comercial"].includes(profile.role)) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-brand-grafite text-white">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="font-headline text-lg font-bold text-brand-lavanda">INDÚSTRIA</span>
          <span className="font-headline text-xl font-black">NEWS</span>
          <span className="text-xs text-gray-500 font-headline uppercase ml-2 bg-white/10 px-2 py-0.5 rounded">Admin</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{profile.full_name || user.email}</span>
          <Link href="/" className="text-xs text-gray-500 hover:text-white transition-colors font-headline uppercase">
            Ver Portal
          </Link>
        </div>
      </header>
      <div className="flex">
        <DashboardNav role="admin" />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
