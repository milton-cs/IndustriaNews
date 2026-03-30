import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export async function CategoryNav() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from("categories")
    .select("name, slug")
    .order("sort_order")

  return (
    <nav className="border-b border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-1 py-2 overflow-x-auto scrollbar-none -mx-4 px-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {categories?.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categoria/${cat.slug}`}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-headline uppercase tracking-wide text-gray-500 hover:bg-brand-lavanda/10 hover:text-brand-lavanda transition-colors whitespace-nowrap"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
