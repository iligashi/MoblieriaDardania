import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAdminApi } from "@/lib/auth/admin"
import { parseJson, productSchema, sanitizeSearch, sanitizeSlug, slugify, isUuid } from "@/lib/validation"
import { toProductRow } from "@/lib/products"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const sp = request.nextUrl.searchParams

    const page = Math.max(1, Math.floor(Number(sp.get("page")) || 1))
    const limit = Math.min(Math.max(1, Math.floor(Number(sp.get("limit")) || 16)), 64)
    const search = sanitizeSearch(sp.get("search"))
    const category = sanitizeSlug(sp.get("category"))
    const categoryId = sp.get("category_id")
    const minPrice = Number(sp.get("minPrice"))
    const maxPrice = Number(sp.get("maxPrice"))
    const sort = sp.get("sort") || "newest"

    let query = supabase.from("products").select("*", { count: "exact" }).eq("is_active", true)

    if (search) {
      query = query.or(`title.ilike.*${search}*,description.ilike.*${search}*,brand.ilike.*${search}*`)
    }
    if (category) query = query.eq("category", category)
    if (isUuid(categoryId)) query = query.eq("category_id", categoryId)
    // Explicit id list (recently viewed, quick lookups). Invalid ids are dropped.
    const ids = (sp.get("ids") ?? "").split(",").filter(isUuid).slice(0, 24)
    if (sp.has("ids")) {
      if (ids.length === 0) return NextResponse.json({ data: [], total: 0, page: 1, totalPages: 0, limit })
      query = query.in("id", ids)
    }
    if (Number.isFinite(minPrice) && sp.get("minPrice")) query = query.gte("price", minPrice)
    if (Number.isFinite(maxPrice) && sp.get("maxPrice")) query = query.lte("price", maxPrice)
    for (const key of ["color", "material", "brand"] as const) {
      const value = sp.get(key)
      if (value) query = query.eq(key, value.slice(0, 80))
    }
    if (sp.get("featured") === "true") query = query.eq("is_featured", true)
    if (sp.get("bestseller") === "true") query = query.eq("is_bestseller", true)
    if (sp.get("new") === "true") query = query.eq("is_new", true)
    if (sp.get("on_sale") === "true") query = query.not("discount_price", "is", null)
    if (sp.get("in_stock") === "true") query = query.gt("stock", 0)

    switch (sort) {
      case "price_asc":
        query = query.order("price", { ascending: true })
        break
      case "price_desc":
        query = query.order("price", { ascending: false })
        break
      case "name_asc":
        query = query.order("title", { ascending: true })
        break
      case "oldest":
        query = query.order("created_at", { ascending: true })
        break
      default:
        query = query.order("created_at", { ascending: false })
    }

    const from = (page - 1) * limit
    const { data, error, count } = await query.range(from, from + limit - 1)
    if (error) throw error

    return NextResponse.json({
      data: data || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
      limit,
    })
  } catch (error) {
    console.error("[products] list failed:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminApi()
  if (auth instanceof NextResponse) return auth

  const parsed = await parseJson(request, productSchema)
  if ("error" in parsed) return parsed.error

  try {
    const row = toProductRow(parsed.data)
    row.slug = `${slugify(parsed.data.slug || parsed.data.title) || "produkt"}-${Date.now().toString(36)}`

    const { data, error } = await auth.db.from("products").insert(row).select().single()
    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("[products] create failed:", error)
    return NextResponse.json({ error: "Deshtoi krijimi i produktit" }, { status: 500 })
  }
}
