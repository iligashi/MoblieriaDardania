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

    return NextResponse.json({ order: data })
  } catch (error) {
    console.error("[orders] Unexpected status update error:", error)
    return NextResponse.json({ error: "Unexpected error updating order." }, { status: 500 })
  }
}

