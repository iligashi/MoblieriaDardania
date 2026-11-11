import { cache } from "react"
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

/* ------------------------------------------------------------------ */
/* Appearance                                                          */
/* ------------------------------------------------------------------ */

const HEX = /^#[0-9a-f]{6}$/i

/** Fallback accent colours, used when a category has no colour of its own. */
export const CATEGORY_FALLBACK_COLORS = ["#b45309", "#4d7c0f", "#be123c", "#0f766e", "#6d28d9", "#1d4ed8"]

/** The category's accent colour (a validated hex), falling back to a stable palette colour. */
export function categoryColor(category: Pick<Category, "image" | "display_order">, index = category.display_order ?? 0) {
  const value = category.image?.trim() ?? ""
  if (HEX.test(value)) return value
  return CATEGORY_FALLBACK_COLORS[Math.abs(index) % CATEGORY_FALLBACK_COLORS.length]
}

/** The category's photo URL, if `image` holds one rather than a colour. */
export function categoryPhoto(category: Pick<Category, "image">) {
  const value = category.image?.trim() ?? ""
  return /^https?:\/\//i.test(value) ? value : null
}

/* ------------------------------------------------------------------ */
/* Matching products to categories                                     */
/* ------------------------------------------------------------------ */

type ProductRef = { category_id?: string | null; category?: string | null; images?: string[] | null }

/** IDs and slugs that count as "in" a category: the category itself plus its sub-categories. */
export function categoryKeys(category: Category, categories: Category[]) {
  const family = [category, ...categories.filter((c) => c.parent_id === category.id)]
  return { ids: new Set(family.map((c) => c.id)), slugs: new Set(family.map((c) => c.slug)) }
}

export function productInCategory(p: ProductRef, keys: { ids: Set<string>; slugs: Set<string> }) {
  // `category` is the legacy free-text column; older products only have that.
  return (!!p.category_id && keys.ids.has(p.category_id)) || (!!p.category && keys.slugs.has(p.category))
}

export type CategorySummary = Omit<Category, "children"> & {
  productCount: number
  covers: string[]
  color: string
  photo: string | null
  children: CategorySummary[]
}

/** Top-level categories with their sub-categories, product counts and cover images. */
export function summarizeCategories(categories: Category[], products: ProductRef[]): CategorySummary[] {
  const byOrder = (a: Category, b: Category) => a.display_order - b.display_order
  const summarize = (cat: Category, index: number, inheritedColor?: string): CategorySummary => {
    const keys = categoryKeys(cat, categories)
    const matching = products.filter((p) => productInCategory(p, keys))
    const color = HEX.test(cat.image?.trim() ?? "") ? cat.image!.trim() : (inheritedColor ?? categoryColor(cat, index))
    return {
      ...cat,
      productCount: matching.length,
      covers: matching.map((p) => p.images?.[0]).filter((src): src is string => !!src).slice(0, 3),
      color,
      photo: categoryPhoto(cat),
      children: [],
    }
  }

  return categories
    .filter((c) => !c.parent_id)
    .sort(byOrder)
    .map((root, i) => {
      const summary = summarize(root, i)
      summary.children = categories
        .filter((c) => c.parent_id === root.id)
        .sort(byOrder)
        .map((child, j) => summarize(child, j, summary.color))
      return summary
    })
}

/** Products that don't belong to any category (by id or legacy slug). */
export function uncategorizedCount(categories: Category[], products: ProductRef[]) {
  const keys = { ids: new Set(categories.map((c) => c.id)), slugs: new Set(categories.map((c) => c.slug)) }
  return products.filter((p) => !productInCategory(p, keys)).length
}

/* ------------------------------------------------------------------ */
/* Queries                                                             */
/* ------------------------------------------------------------------ */

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
  const family = category ? [category, ...categories.filter((c) => c.parent_id === category.id)] : []
  const ids = family.map((c) => c.id).filter(isUuid)
  const slugs = [...new Set([slug, ...family.map((c) => sanitizeSlug(c.slug))].filter(Boolean))]
  const clauses = [slugs.length > 1 ? `category.in.(${slugs.join(",")})` : `category.eq.${slug}`]
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

/** Active categories plus a storefront summary (counts and covers). Cached per request. */
export const getCategoryOverview = cache(async (supabase: SupabaseClient) => {
  const [categories, products] = await Promise.all([
    getActiveCategories(supabase),
    supabase
      .from("products")
      .select("category, category_id, images")
      .eq("is_active", true)
      .order("is_featured", { ascending: false })
      .order("updated_at", { ascending: false })
      .limit(2000),
  ])
  const list = products.data ?? []
  return { categories, roots: summarizeCategories(categories, list), productTotal: list.length }
})
