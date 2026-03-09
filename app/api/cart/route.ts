import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { NextResponse, type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")

    const { data: { user } } = await supabase.auth.getUser()
    const serviceClient = createServiceRoleClient()

    let query = serviceClient
      .from("cart_items")
      .select("*, product:products(*)")

    if (user) {
      query = query.eq("customer_id", user.id)
    } else if (sessionId) {
      query = query.eq("session_id", sessionId)
    } else {
      return NextResponse.json([])
    }

    const { data, error } = await query.order("created_at", { ascending: true })

    if (error) throw error
    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Error fetching cart:", error)
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { product_id, quantity = 1, session_id } = body

    const { data: { user } } = await supabase.auth.getUser()
    const serviceClient = createServiceRoleClient()

    // Check if item already in cart
    let existingQuery = serviceClient
      .from("cart_items")
      .select("*")
      .eq("product_id", product_id)

    if (user) {
      existingQuery = existingQuery.eq("customer_id", user.id)
    } else if (session_id) {
      existingQuery = existingQuery.eq("session_id", session_id)
    }

    const { data: existing } = await existingQuery.maybeSingle()

    if (existing) {
      const { data, error } = await serviceClient
        .from("cart_items")
        .update({ quantity: existing.quantity + quantity, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
        .select("*, product:products(*)")
        .single()

      if (error) throw error
      return NextResponse.json(data)
    }

    const payload: Record<string, unknown> = { product_id, quantity }
    if (user) {
      payload.customer_id = user.id
    } else if (session_id) {
      payload.session_id = session_id
    }

    const { data, error } = await serviceClient
      .from("cart_items")
      .insert([payload])
      .select("*, product:products(*)")
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error adding to cart:", error)
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const serviceClient = createServiceRoleClient()

    let query = serviceClient.from("cart_items").delete()

    if (user) {
      query = query.eq("customer_id", user.id)
    } else if (sessionId) {
      query = query.eq("session_id", sessionId)
    }

    await query
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error clearing cart:", error)
    return NextResponse.json({ error: "Failed to clear cart" }, { status: 500 })
  }
}
