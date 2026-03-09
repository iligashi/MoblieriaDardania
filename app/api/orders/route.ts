import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service-role"

export async function GET() {
  try {
    const supabase = await createClient()
    const supabaseAdmin = createServiceRoleClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if admin
    const { data: adminData } = await supabaseAdmin.from("admin_users").select("id").eq("id", user.id).single()

    let query = supabaseAdmin.from("orders").select("*, order_items(*)")

    if (!adminData) {
      // Customer can only see own orders
      query = query.eq("customer_id", user.id)
    }

    const { data, error } = await query.order("created_at", { ascending: false })
    if (error) throw error

    // Map order_items to items for frontend compatibility
    const orders = (data || []).map((order: Record<string, unknown>) => ({
      ...order,
      items: order.order_items || [],
    }))

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabaseAdmin = createServiceRoleClient()

    // Support both legacy single-item and new multi-item orders
    const isLegacy = body.furnitureId && !body.items

    if (isLegacy) {
      // Legacy single-item order request (backwards compat)
      const { data, error } = await supabaseAdmin
        .from("orders")
        .insert([{
          furniture_id: body.furnitureId,
          furniture_title: body.furnitureTitle,
          furniture_price: body.furniturePrice,
          customer_name: body.customerName,
          customer_email: body.customerEmail,
          customer_phone: body.customerPhone,
          customer_message: body.customerMessage,
          send_via_email: body.sendViaEmail || false,
          send_via_whatsapp: body.sendViaWhatsApp || false,
        }])
        .select()
        .single()

      if (error) throw error
      return NextResponse.json({ order: data }, { status: 201 })
    }

    // Multi-item checkout order
    const {
      items,
      customer_name,
      customer_email,
      customer_phone,
      billing_address,
      shipping_address,
      subtotal,
      shipping_cost,
      total,
      payment_method,
      notes,
      send_via_whatsapp,
    } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Shporta eshte bosh" }, { status: 400 })
    }

    if (!customer_name || !customer_phone) {
      return NextResponse.json({ error: "Emri dhe telefoni jane te detyrueshme" }, { status: 400 })
    }

    // Generate order number
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "")
    const { count } = await supabaseAdmin
      .from("orders")
      .select("*", { count: "exact", head: true })
      .gte("created_at", new Date().toISOString().slice(0, 10))

    const seq = String((count || 0) + 1).padStart(3, "0")
    const orderNumber = `ORD-${today}-${seq}`

    // Check customer auth
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    let customerId = null

    if (user) {
      const { data: adminCheck } = await supabase.from("admin_users").select("id").eq("id", user.id).single()
      if (!adminCheck) {
        customerId = user.id
      }
    }

    // Create order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert([{
        order_number: orderNumber,
        customer_id: customerId,
        customer_name,
        customer_email,
        customer_phone,
        billing_address,
        shipping_address,
        subtotal,
        shipping_cost: shipping_cost || 0,
        total,
        payment_method: payment_method || "cash_on_delivery",
        notes,
        send_via_whatsapp: send_via_whatsapp || false,
        status: "pending",
      }])
      .select()
      .single()

    if (orderError) throw orderError

    // Create order items and decrement stock
    const orderItems = items.map((item: { product_id: string; product_title: string; product_image: string | null; price: number; quantity: number }) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_title: item.product_title,
      product_image: item.product_image,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
    }))

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItems)

    if (itemsError) {
      console.error("Error creating order items:", itemsError)
    }

    // Decrement stock for each product
    for (const item of items) {
      await supabaseAdmin.rpc("decrement_stock", {
        p_product_id: item.product_id,
        p_quantity: item.quantity,
      }).catch(() => {
        // Fallback: manual decrement if RPC doesn't exist
        supabaseAdmin
          .from("products")
          .select("stock")
          .eq("id", item.product_id)
          .single()
          .then(({ data: product }) => {
            if (product) {
              supabaseAdmin
                .from("products")
                .update({ stock: Math.max(0, product.stock - item.quantity) })
                .eq("id", item.product_id)
            }
          })
      })
    }

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error("Order creation error:", error)
    return NextResponse.json({ error: "Gabim ne krijimin e porosise" }, { status: 500 })
  }
}
