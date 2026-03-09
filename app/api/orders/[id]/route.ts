import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const ALLOWED_STATUS = new Set([
  "pending", "confirmed", "processing", "shipped", "delivered", "cancelled",
  "in_progress", "completed",
])

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: order, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", id)
      .single()

    if (error || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check if admin or order belongs to customer
    const { data: adminCheck } = await supabase.from("admin_users").select("id").eq("id", user.id).single()
    if (!adminCheck && order.customer_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admins can update order status
    const { data: adminCheck } = await supabase.from("admin_users").select("id").eq("id", user.id).single()
    if (!adminCheck) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const { status } = body ?? {}

    if (!status || typeof status !== "string" || !ALLOWED_STATUS.has(status)) {
      return NextResponse.json({ error: "Invalid status value." }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Failed to update order status:", error)
      return NextResponse.json({ error: "Failed to update order status." }, { status: 500 })
    }

    return NextResponse.json({ order: data })
  } catch (error) {
    console.error("Unexpected status update error:", error)
    return NextResponse.json({ error: "Unexpected error updating order." }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: adminCheck } = await supabase.from("admin_users").select("id").eq("id", user.id).single()
    if (!adminCheck) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Delete order items first, then order
    await supabase.from("order_items").delete().eq("order_id", id)
    const { error } = await supabase.from("orders").delete().eq("id", id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting order:", error)
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 })
  }
}
