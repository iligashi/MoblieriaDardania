import type { SupabaseClient } from "@supabase/supabase-js"
import type { Category } from "@/lib/types"
import { isUuid, sanitizeSlug } from "@/lib/validation"

export function buildCategoryTree(categories: Category[]): Category[] {
  const roots = categories.filter((c) => !c.parent_id)
  return roots.map((root) => ({
    ...root,
    children: categories.filter((c) => c.parent_id === root.id),
  }))
}

/**
 * Turns a `?category=` slug into a safe PostgREST `or` filter.
 * Matches the category itself, all of its sub-categories and the legacy
 * free-text `products.category` column. Only UUIDs and sanitised slugs are
 * ever interpolated, so the filter can't be broken out of.
 */
export function categoryFilter(slugParam: string | undefined, categories: Category[]) {
  const slug = sanitizeSlug(slugParam)
  if (!slug) return null
  const category = categories.find((c) => c.slug === slug) ?? null
  const ids = category
    ? [category.id, ...categories.filter((c) => c.parent_id === category.id).map((c) => c.id)].filter(isUuid)
    : []
  const clauses = [`category.eq.${slug}`]
  if (ids.length) clauses.unshift(`category_id.in.(${ids.join(",")})`)
  return { slug, category, filter: clauses.join(",") }
}

export async function getActiveCategories(supabase: SupabaseClient): Promise<Category[]> {
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })
  return (data as Category[]) ?? []
}
