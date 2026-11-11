import { NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { resolveCartOwner } from "@/lib/cart-owner"
import { cartUpdateSchema, isUuid, parseJson } from "@/lib/validation"
import { SHOP } from "@/lib/shop-config"

type Params = { params: Promise<{ id: string }> }

/**
 * Loads a cart line only if it belongs to the caller (signed-in user or guest
 * session). Anything else is reported as "not found".
 */
async function findOwnedItem(request: Request, id: string) {
  if (!isUuid(id)) return null
  const { owner } = await resolveCartOwner(request)
  if (!owner) return null

  const service = createServiceRoleClient()
  const { data } = await service
    .from("cart_items")
    .select("*, product:products(id, stock, is_active)")
    .eq("id", id)
    .eq(owner.column, owner.value)
    .maybeSingle()

  return data ? { item: data, service } : null
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params
  const parsed = await parseJson(request, cartUpdateSchema)
  if ("error" in parsed) return parsed.error

  try {
    const owned = await findOwnedItem(request, id)
    if (!owned) return NextResponse.json({ error: "Cart item not found" }, { status: 404 })

    const stock = Number(owned.item.product?.stock ?? 0)
    const quantity = Math.min(parsed.data.quantity, Math.max(stock, 1), SHOP.maxQuantityPerItem)

    const { data, error } = await owned.service
      .from("cart_items")
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*, product:products(*)")
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error("[cart] update failed:", error)
    return NextResponse.json({ error: "Failed to update cart item" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params
  try {
    const owned = await findOwnedItem(request, id)
    if (!owned) return NextResponse.json({ error: "Cart item not found" }, { status: 404 })

    const { error } = await owned.service.from("cart_items").delete().eq("id", id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[cart] remove failed:", error)
    return NextResponse.json({ error: "Failed to remove item" }, { status: 500 })
  }
}
