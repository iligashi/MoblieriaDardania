import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/auth/admin"
import { categoryUpdateSchema, isUuid, parseJson, slugify } from "@/lib/validation"

type Params = { params: Promise<{ id: string }> }

export async function PUT(request: Request, { params }: Params) {
  const auth = await requireAdminApi()
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  if (!isUuid(id)) return NextResponse.json({ error: "Category not found" }, { status: 404 })

  const parsed = await parseJson(request, categoryUpdateSchema)
  if ("error" in parsed) return parsed.error

  const update: Record<string, unknown> = { ...parsed.data }
  if (typeof parsed.data.slug === "string") update.slug = slugify(parsed.data.slug)
  if (update.parent_id === id) {
    return NextResponse.json({ error: "Kategoria nuk mund te jete prind i vetes" }, { status: 400 })
  }

  try {
    const { data, error } = await auth.db.from("categories").update(update).eq("id", id).select().single()
    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Ekziston nje kategori me kete slug" }, { status: 409 })
      }
      throw error
    }
    return NextResponse.json(data)
  } catch (error) {
    console.error("[categories] update failed:", error)
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireAdminApi()
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  if (!isUuid(id)) return NextResponse.json({ error: "Category not found" }, { status: 404 })

  try {
    const { error } = await auth.db.from("categories").delete().eq("id", id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[categories] delete failed:", error)
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
  }
}
