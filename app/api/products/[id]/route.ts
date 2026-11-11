import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAdminApi } from "@/lib/auth/admin"
import { isUuid, parseJson, productPatchSchema, productSchema, sanitizeSlug, slugify } from "@/lib/validation"
import { toProductRow } from "@/lib/products"

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params
  try {
    const supabase = await createClient()
    const base = supabase.from("products").select("*")
    const { data } = await (isUuid(id) ? base.eq("id", id) : base.eq("slug", sanitizeSlug(id))).maybeSingle()

    if (!data) return NextResponse.json({ error: "Product not found" }, { status: 404 })
    return NextResponse.json(data)
  } catch (error) {
    console.error("[products] fetch failed:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: Params) {
  const auth = await requireAdminApi()
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  if (!isUuid(id)) return NextResponse.json({ error: "Product not found" }, { status: 404 })

  const parsed = await parseJson(request, productSchema)
  if ("error" in parsed) return parsed.error

  try {
    const row = toProductRow(parsed.data)
    if (parsed.data.slug) row.slug = slugify(parsed.data.slug) || undefined
    row.updated_at = new Date().toISOString()

    const { data, error } = await auth.db.from("products").update(row).eq("id", id).select().single()
    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error("[products] update failed:", error)
    return NextResponse.json({ error: "Deshtoi ndryshimi i produktit" }, { status: 500 })
  }
}

/** Quick toggles from the product table (active / featured / stock ...). */
export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireAdminApi()
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  if (!isUuid(id)) return NextResponse.json({ error: "Product not found" }, { status: 404 })

  const parsed = await parseJson(request, productPatchSchema)
  if ("error" in parsed) return parsed.error

  try {
    const { data, error } = await auth.db
      .from("products")
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()
    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error("[products] patch failed:", error)
    return NextResponse.json({ error: "Deshtoi ndryshimi i produktit" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireAdminApi()
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  if (!isUuid(id)) return NextResponse.json({ error: "Product not found" }, { status: 404 })

  try {
    const { error } = await auth.db.from("products").delete().eq("id", id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[products] delete failed:", error)
    return NextResponse.json({ error: "Deshtoi fshirja e produktit" }, { status: 500 })
  }
}
