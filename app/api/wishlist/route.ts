import { NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { parseJson, UUID_RE } from "@/lib/validation"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json([])

    const service = createServiceRoleClient()
    const { data, error } = await service
      .from("wishlist_items")
      .select("*, product:products(*)")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false })

    if (error) throw error
    return NextResponse.json((data || []).filter((i) => i.product && i.product.is_active !== false))
  } catch (error) {
    console.error("[wishlist] fetch failed:", error)
    return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: 500 })
  }
}

const addSchema = z.object({ product_id: z.string().regex(UUID_RE) })

export async function POST(request: Request) {
  const parsed = await parseJson(request, addSchema)
  if ("error" in parsed) return parsed.error

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Duhet te jeni te kyqur per te perdorur listen e deshirave" }, { status: 401 })
    }

    const service = createServiceRoleClient()
    const { data, error } = await service
      .from("wishlist_items")
      .upsert(
        { customer_id: user.id, product_id: parsed.data.product_id },
        { onConflict: "customer_id,product_id", ignoreDuplicates: false },
      )
      .select("*, product:products(*)")
      .single()

    if (error) {
      // 23503: the customer row is missing (e.g. account created before the fix) or product was deleted.
      if (error.code === "23503") {
        return NextResponse.json({ error: "Produkti nuk mund te shtohet" }, { status: 409 })
      }
      throw error
    }
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("[wishlist] add failed:", error)
    return NextResponse.json({ error: "Failed to add to wishlist" }, { status: 500 })
  }
}
