import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json([])

    // Use service role to bypass RLS
    const supabaseAdmin = createServiceRoleClient()
    const { data, error } = await supabaseAdmin
      .from("wishlist_items")
      .select("*, product:products(*)")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false })

    if (error) throw error
    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Error fetching wishlist:", error)
    return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Duhet te jeni te kyqur per te perdorur listen e deshirave" }, { status: 401 })
    }

    const { product_id } = await request.json()

    // Use service role to bypass RLS
    const supabaseAdmin = createServiceRoleClient()

    // Check if already in wishlist
    const { data: existing } = await supabaseAdmin
      .from("wishlist_items")
      .select("id")
      .eq("customer_id", user.id)
      .eq("product_id", product_id)
      .single()

    if (existing) {
      return NextResponse.json({ message: "Already in wishlist" }, { status: 200 })
    }

    const { data, error } = await supabaseAdmin
      .from("wishlist_items")
      .insert([{ customer_id: user.id, product_id }])
      .select("*, product:products(*)")
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error adding to wishlist:", error)
    return NextResponse.json({ error: "Failed to add to wishlist" }, { status: 500 })
  }
}
