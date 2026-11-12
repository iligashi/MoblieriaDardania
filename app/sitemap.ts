import type { MetadataRoute } from "next"
import { createClient } from "@supabase/supabase-js"
import { SITE_URL } from "@/lib/site"

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const pages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/shop`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/ndihme`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ]

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return pages

  try {
    const supabase = createClient(url, key, { auth: { persistSession: false } })
    const [{ data: products }, { data: categories }] = await Promise.all([
      supabase.from("products").select("id, slug, updated_at").eq("is_active", true).limit(5000),
      supabase.from("categories").select("slug").eq("is_active", true),
    ])

    for (const c of categories || []) {
      pages.push({ url: `${SITE_URL}/shop?category=${c.slug}`, changeFrequency: "weekly", priority: 0.7 })
    }
    for (const p of products || []) {
      pages.push({
        url: `${SITE_URL}/products/${p.slug || p.id}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : now,
        changeFrequency: "weekly",
        priority: 0.8,
      })
    }
  } catch (error) {
    console.error("[sitemap] failed:", error)
  }
  return pages
}
