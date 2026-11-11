import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { isAdminUser } from "@/lib/auth/admin"
import { checkoutSchema, parseJson } from "@/lib/validation"
import { round2, shippingFor, unitPrice } from "@/lib/shop-config"
import { rateLimit } from "@/lib/rate-limit"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const service = createServiceRoleClient()
    const admin = await isAdminUser(user.id)

    let query = service.from("orders").select("*, order_items(*)")
    if (!admin) query = query.eq("customer_id", user.id)

    const { data, error } = await query.order("created_at", { ascending: false }).limit(admin ? 500 : 100)
    if (error) throw error

    const orders = (data || []).map((order) => ({ ...order, items: order.order_items || [] }))
    return NextResponse.json(orders)
  } catch (error) {
    console.error("[orders] list failed:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

async function nextOrderNumber(service: ReturnType<typeof createServiceRoleClient>): Promise<string> {
  // Preferred: an atomic sequence in the database (scripts/008_security_hardening.sql).
  const { data, error } = await service.rpc("next_order_number")
  if (!error && typeof data === "string" && data) return data

  // Fallback while the migration has not been applied yet: date + random suffix,
  // which cannot collide the way the old "count + 1" number did.
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "")
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase()
  return `ORD-${today}-${suffix}`
}

type Service = ReturnType<typeof createServiceRoleClient>
type Reservation = { product_id: string; quantity: number }

/** Gives reserved stock back (order failed after stock was taken). Best effort, logged on failure. */
async function releaseStock(service: Service, reserved: Reservation[]) {
  for (const r of reserved) {
    const { error } = await service.rpc("restore_stock", { p_product_id: r.product_id, p_quantity: r.quantity })
    if (!error) continue
    // restore_stock not installed yet (scripts/009): read-modify-write fallback.
    const { data } = await service.from("products").select("stock").eq("id", r.product_id).maybeSingle()
    if (data) {
      const { error: fallbackError } = await service
        .from("products")
        .update({ stock: Number(data.stock) + r.quantity })
        .eq("id", r.product_id)
      if (fallbackError) console.error("[orders] could not release stock:", r.product_id, fallbackError.message)
    }
  }
}

function outOfStock(title: string, stock: number) {
  return stock > 0 ? `“${title}” ka vetëm ${stock} copë në stok.` : `“${title}” nuk është më në stok.`
}

export async function POST(request: Request) {
  const limited = await rateLimit(request, "checkout")
  if (limited) return limited

  const parsed = await parseJson(request, checkoutSchema)
  if ("error" in parsed) return parsed.error
  const input = parsed.data

  // A bot filled the hidden honeypot field.
  if (input.website) {
    return NextResponse.json({ error: "Porosia nuk u pranua." }, { status: 400 })
  }

  const service = createServiceRoleClient()
  const reserved: Reservation[] = []

  try {
    // Merge duplicate lines so a product cannot be ordered twice to dodge stock checks.
    const quantities = new Map<string, number>()
    for (const item of input.items) {
      quantities.set(item.product_id, (quantities.get(item.product_id) || 0) + item.quantity)
    }
    const productIds = [...quantities.keys()]

    // Load the real products. Prices always come from the database, never from the client.
    const { data: products, error: productsError } = await service
      .from("products")
      .select("id, title, price, discount_price, stock, images, is_active")
      .in("id", productIds)

    if (productsError) throw productsError

    const byId = new Map((products || []).map((p) => [p.id as string, p]))
    const lines = []
    for (const [productId, quantity] of quantities) {
      const product = byId.get(productId)
      if (!product || product.is_active === false) {
        return NextResponse.json(
          { error: "Një nga produktet nuk është më në dispozicion. Ju lutem rifreskoni shportën." },
          { status: 409 },
        )
      }
      if (Number(product.stock) < quantity) {
        return NextResponse.json({ error: outOfStock(product.title as string, Number(product.stock)) }, { status: 409 })
      }
      const price = unitPrice({ price: Number(product.price), discount_price: product.discount_price })
      lines.push({
        product_id: productId,
        product_title: product.title as string,
        product_image: (product.images as string[] | null)?.[0] ?? null,
        price,
        quantity,
        subtotal: round2(price * quantity),
      })
    }

    // Reserve stock first. decrement_stock is atomic and refuses to go below zero,
    // so two shoppers buying the last item at the same moment can't both succeed.
    for (const line of lines) {
      const { error } = await service.rpc("decrement_stock", { p_product_id: line.product_id, p_quantity: line.quantity })
      if (error) {
        await releaseStock(service, reserved)
        reserved.length = 0
        const { data: fresh } = await service.from("products").select("stock").eq("id", line.product_id).maybeSingle()
        return NextResponse.json({ error: outOfStock(line.product_title, Number(fresh?.stock ?? 0)) }, { status: 409 })
      }
      reserved.push({ product_id: line.product_id, quantity: line.quantity })
    }

    const subtotal = round2(lines.reduce((sum, l) => sum + l.subtotal, 0))
    const shippingCost = shippingFor(subtotal)
    const total = round2(subtotal + shippingCost)

    // Attach the order to the signed-in customer (admins placing test orders stay anonymous).
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const customerId = user && !(await isAdminUser(user.id)) ? user.id : null

    const orderNumber = await nextOrderNumber(service)
    const shipping = input.shipping_address
    const billing = input.billing_address ?? shipping

    const { data: order, error: orderError } = await service
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_id: customerId,
        customer_name: input.customer_name,
        customer_email: input.customer_email,
        customer_phone: input.customer_phone,
        billing_address: billing,
        shipping_address: shipping,
        subtotal,
        shipping_cost: shippingCost,
        total,
        payment_method: input.payment_method,
        notes: input.notes,
        send_via_whatsapp: false,
        status: "pending",
        // Legacy columns kept for older dashboard rows.
        furniture_id: null,
        furniture_title: lines.length > 1 ? `${lines[0].product_title} +${lines.length - 1}` : lines[0].product_title,
        furniture_price: total,
      })
      .select()
      .single()

    if (orderError) throw orderError

    const { error: itemsError } = await service
      .from("order_items")
      .insert(lines.map((line) => ({ ...line, order_id: order.id })))

    if (itemsError) {
      // Never leave an order without its items: roll the order back.
      await service.from("orders").delete().eq("id", order.id)
      throw itemsError
    }
    reserved.length = 0 // the order now owns the reserved stock

    // Clear the server-side cart that produced this order.
    if (customerId) {
      await service.from("cart_items").delete().eq("customer_id", customerId)
    }

    return NextResponse.json(
      { order: { id: order.id, order_number: order.order_number, total: order.total } },
      { status: 201 },
    )
  } catch (error) {
    if (reserved.length) await releaseStock(service, reserved)
    console.error("[orders] create failed:", error)
    return NextResponse.json({ error: "Gabim në krijimin e porosisë. Ju lutem provoni përsëri." }, { status: 500 })
  }
}
