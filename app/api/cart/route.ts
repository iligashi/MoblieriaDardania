import { NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { resolveCartOwner } from "@/lib/cart-owner"
import { cartAddSchema, parseJson } from "@/lib/validation"
import { SHOP } from "@/lib/shop-config"
import { rateLimit } from "@/lib/rate-limit"

const CART_SELECT = "*, product:products(*)"

/**
 * When a guest signs in, move their guest cart onto the account so nothing
 * they added before logging in is lost. Quantities are merged per product.
 */
async function mergeGuestCart(service: ReturnType<typeof createServiceRoleClient>, userId: string, sessionId: string) {
  const { data: guestItems } = await service.from("cart_items").select("*").eq("session_id", sessionId).is("customer_id", null)
  if (!guestItems?.length) return

  const { data: userItems } = await service.from("cart_items").select("*").eq("customer_id", userId)
  const byProduct = new Map((userItems || []).map((i) => [i.product_id, i]))

  for (const item of guestItems) {
    const existing = byProduct.get(item.product_id)
    if (existing) {
      await service
        .from("cart_items")
        .update({
          quantity: Math.min(SHOP.maxQuantityPerItem, existing.quantity + item.quantity),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
      await service.from("cart_items").delete().eq("id", item.id)
    } else {
      await service.from("cart_items").update({ customer_id: userId, session_id: null }).eq("id", item.id)
    }
  }
}

export async function GET(request: Request) {
  try {
    const { owner, guestSession } = await resolveCartOwner(request)
    if (!owner) return NextResponse.json([])

    const service = createServiceRoleClient()
    if (owner.column === "customer_id" && guestSession) {
      await mergeGuestCart(service, owner.value, guestSession)
    }

    const { data, error } = await service
      .from("cart_items")
      .select(CART_SELECT)
      .eq(owner.column, owner.value)
      .order("created_at", { ascending: true })

    if (error) throw error

    // Drop lines whose product was deleted or deactivated.
    const items = (data || []).filter((i) => i.product && i.product.is_active !== false)
    return NextResponse.json(items)
  } catch (error) {
    console.error("[cart] fetch failed:", error)
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const limited = await rateLimit(request, "cart")
  if (limited) return limited

  const parsed = await parseJson(request, cartAddSchema)
  if ("error" in parsed) return parsed.error
  const { product_id, quantity } = parsed.data

  try {
    const { owner } = await resolveCartOwner(request, parsed.data.session_id)
    if (!owner) return NextResponse.json({ error: "Missing cart session" }, { status: 400 })

    const service = createServiceRoleClient()

    const { data: product } = await service
      .from("products")
      .select("id, stock, is_active")
      .eq("id", product_id)
      .maybeSingle()

    if (!product || product.is_active === false) {
      return NextResponse.json({ error: "Produkti nuk u gjet" }, { status: 404 })
    }
    if (product.stock <= 0) {
      return NextResponse.json({ error: "Produkti nuk eshte ne stok" }, { status: 409 })
    }

    const { data: existing } = await service
      .from("cart_items")
      .select("*")
      .eq(owner.column, owner.value)
      .eq("product_id", product_id)
      .maybeSingle()

    const limit = Math.min(product.stock, SHOP.maxQuantityPerItem)

    if (existing) {
      const { data, error } = await service
        .from("cart_items")
        .update({ quantity: Math.min(limit, existing.quantity + quantity), updated_at: new Date().toISOString() })
        .eq("id", existing.id)
        .select(CART_SELECT)
        .single()
      if (error) throw error
      return NextResponse.json(data)
    }

    const { data, error } = await service
      .from("cart_items")
      .insert({ product_id, quantity: Math.min(limit, quantity), [owner.column]: owner.value })
      .select(CART_SELECT)
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("[cart] add failed:", error)
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { owner } = await resolveCartOwner(request)
    // Without an owner there is nothing to clear. Never run an unfiltered delete.
    if (!owner) return NextResponse.json({ error: "Missing cart session" }, { status: 400 })

    const service = createServiceRoleClient()
    const { error } = await service.from("cart_items").delete().eq(owner.column, owner.value)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[cart] clear failed:", error)
    return NextResponse.json({ error: "Failed to clear cart" }, { status: 500 })
  }
}
