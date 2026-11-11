import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isUuid } from "@/lib/validation"

/** Resolves a guest's locally stored wishlist (product ids) into active products. */
export async function GET(request: NextRequest) {
  try {
    const ids = (request.nextUrl.searchParams.get("ids") || "")
      .split(",")
      .filter(isUuid)
      .slice(0, 100)

    if (ids.length === 0) return NextResponse.json([])

    const supabase = await createClient()
    const { data, error } = await supabase.from("products").select("*").eq("is_active", true).in("id", ids)

    if (error) throw error
    return NextResponse.json(data || [])
  } catch (error) {
    console.error("[wishlist] local lookup failed:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
