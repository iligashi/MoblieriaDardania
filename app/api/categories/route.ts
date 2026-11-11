import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAdminApi } from "@/lib/auth/admin"
import { categorySchema, parseJson, slugify } from "@/lib/validation"
import type { Category } from "@/lib/types"

function buildTree(categories: Category[]) {
  return categories
    .filter((c) => !c.parent_id)
    .map((root) => ({ ...root, children: categories.filter((c) => c.parent_id === root.id) }))
}

/**
 * Public: active categories as a tree.
 * `?all=true` (admins only): every category, including inactive ones.
 */
export async function GET(request: NextRequest) {
  try {
    const wantsAll = request.nextUrl.searchParams.get("all") === "true"

    if (wantsAll) {
      const auth = await requireAdminApi()
      if (auth instanceof NextResponse) return auth
      const { data, error } = await auth.db.from("categories").select("*").order("display_order")
      if (error) throw error
      return NextResponse.json(buildTree((data || []) as Category[]))
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
    if (error) throw error

    return NextResponse.json(buildTree((data || []) as Category[]), {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    })
  } catch (error) {
    console.error("[categories] list failed:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminApi()
  if (auth instanceof NextResponse) return auth

  const parsed = await parseJson(request, categorySchema)
  if ("error" in parsed) return parsed.error

  try {
    const input = parsed.data
    const slug = slugify(input.slug || input.name)
    if (!slug) return NextResponse.json({ error: "Slug nuk eshte valid" }, { status: 400 })

    const { data, error } = await auth.db
      .from("categories")
      .insert({ ...input, slug })
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Ekziston nje kategori me kete slug" }, { status: 409 })
      }
      throw error
    }
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("[categories] create failed:", error)
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}
