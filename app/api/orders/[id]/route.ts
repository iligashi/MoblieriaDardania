import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { isAdminUser, requireAdminApi } from "@/lib/auth/admin"
import { isUuid, orderStatusSchema, parseJson } from "@/lib/validation"

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params
  if (!isUuid(id)) return NextResponse.json({ error: "Order not found" }, { status: 404 })

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const service = createServiceRoleClient()
    const { data: order } = await service.from("orders").select("*, order_items(*)").eq("id", id).maybeSingle()

    // Same 404 for "missing" and "not yours" so order ids cannot be probed.
    if (!order || (order.customer_id !== user.id && !(await isAdminUser(user.id)))) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ ...order, items: order.order_items || [] })
  } catch (error) {
    console.error("[orders] fetch failed:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireAdminApi()
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  if (!isUuid(id)) return NextResponse.json({ error: "Order not found" }, { status: 404 })

  const parsed = await parseJson(request, orderStatusSchema)
  if ("error" in parsed) return parsed.error

  try {
    const service = createServiceRoleClient()
    const { data, error } = await service
      .from("orders")
      .update({ status: parsed.data.status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ order: data })
  } catch (error) {
    console.error("[orders] status update failed:", error)
    return NextResponse.json({ error: "Failed to update order status." }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireAdminApi()
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  if (!isUuid(id)) return NextResponse.json({ error: "Order not found" }, { status: 404 })

  try {
    const service = createServiceRoleClient()
    // order_items has ON DELETE CASCADE, but delete explicitly for older schemas.
    await service.from("order_items").delete().eq("order_id", id)
    const { error } = await service.from("orders").delete().eq("id", id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[orders] delete failed:", error)
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 })
  }
}
