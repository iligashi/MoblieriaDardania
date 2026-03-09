import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { NextResponse } from "next/server"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { quantity } = await request.json()
    const serviceClient = createServiceRoleClient()

    const { data, error } = await serviceClient
      .from("cart_items")
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*, product:products(*)")
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating cart item:", error)
    return NextResponse.json({ error: "Failed to update cart item" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const serviceClient = createServiceRoleClient()

    const { error } = await serviceClient.from("cart_items").delete().eq("id", id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing cart item:", error)
    return NextResponse.json({ error: "Failed to remove item" }, { status: 500 })
  }
}
