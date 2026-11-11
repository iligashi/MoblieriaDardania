import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { isUuid } from "@/lib/validation"

type Params = { params: Promise<{ id: string }> }

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params
  if (!isUuid(id)) return NextResponse.json({ error: "Not found" }, { status: 404 })

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Scoped to the caller: a customer can only remove their own wishlist rows.
    const { error } = await createServiceRoleClient()
      .from("wishlist_items")
      .delete()
      .eq("id", id)
      .eq("customer_id", user.id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[wishlist] remove failed:", error)
    return NextResponse.json({ error: "Failed to remove from wishlist" }, { status: 500 })
  }
}
