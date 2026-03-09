import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { NextResponse, type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ids = searchParams.get("ids")

    if (!ids) return NextResponse.json([])

    const productIds = ids.split(",").filter(Boolean)
    if (productIds.length === 0) return NextResponse.json([])

    const supabase = createServiceRoleClient()
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .in("id", productIds)

    if (error) throw error
    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Error fetching wishlist products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
