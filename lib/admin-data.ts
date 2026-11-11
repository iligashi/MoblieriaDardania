import type { SupabaseClient } from "@supabase/supabase-js"
import type { Category } from "@/lib/types"

/** Categories (including inactive ones) and option lists for admin forms. */
export async function loadCatalogOptions(db: SupabaseClient) {
  const [cats, settings] = await Promise.all([
    db.from("categories").select("*").order("display_order", { ascending: true }),
    db.from("settings").select("key, value"),
  ])
  const map: Record<string, string[]> = {}
  for (const row of settings.data ?? []) if (Array.isArray(row.value)) map[row.key] = row.value as string[]
  return {
    categories: (cats.data as Category[]) ?? [],
    materials: map.materials ?? [],
    colors: map.colors ?? [],
  }
}
