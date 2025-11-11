import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const ALLOWED_STATUS = new Set(["pending", "in_progress", "completed"])

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { status } = body ?? {}

    if (!status || typeof status !== "string" || !ALLOWED_STATUS.has(status)) {
      return NextResponse.json({ error: "Invalid status value." }, { status: 400 })
    }

    const { data: existingOrder, error: fetchError } = await supabase
      .from("orders")
      .select("id, status, furniture_id")
      .eq("id", id)
      .single()

    if (fetchError) {
      console.error("[orders] Failed to load order:", fetchError)
      return NextResponse.json({ error: "Order not found." }, { status: 404 })
    }

    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[orders] Failed to update status:", error)
      return NextResponse.json({ error: "Failed to update order status." }, { status: 500 })
    }

    if (status === "completed" && existingOrder.status !== "completed") {
      const { data: furniture, error: furnitureError } = await supabase
        .from("furniture")
        .select("stock")
        .eq("id", existingOrder.furniture_id)
        .single()

      if (furnitureError) {
        console.error("[orders] Failed to fetch furniture stock:", furnitureError)
      } else if (typeof furniture?.stock === "number") {
        const updatedStock = Math.max(furniture.stock - 1, 0)

        const { error: stockUpdateError } = await supabase
          .from("furniture")
          .update({ stock: updatedStock })
          .eq("id", existingOrder.furniture_id)

        if (stockUpdateError) {
          console.error("[orders] Failed to decrement furniture stock:", stockUpdateError)
        }
      }
    }

    return NextResponse.json({ order: data })
  } catch (error) {
    console.error("[orders] Unexpected status update error:", error)
    return NextResponse.json({ error: "Unexpected error updating order." }, { status: 500 })
  }
}
