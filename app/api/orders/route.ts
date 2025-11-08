import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      furnitureId,
      furnitureTitle,
      furniturePrice,
      customerName,
      customerEmail,
      customerPhone,
      customerMessage,
      sendViaEmail = false,
      sendViaWhatsApp = false,
    } = body ?? {}

    if (!furnitureId || !furnitureTitle || typeof furniturePrice !== "number") {
      return NextResponse.json({ error: "Missing furniture information." }, { status: 400 })
    }

    if (!customerName) {
      return NextResponse.json({ error: "Customer name is required." }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          furniture_id: furnitureId,
          furniture_title: furnitureTitle,
          furniture_price: furniturePrice,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          customer_message: customerMessage,
          send_via_email: sendViaEmail,
          send_via_whatsapp: sendViaWhatsApp,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("[orders] Failed to insert order:", error)
      return NextResponse.json({ error: "Unable to save your order request. Please try again." }, { status: 500 })
    }

    return NextResponse.json({ order: data }, { status: 201 })
  } catch (error) {
    console.error("[orders] Unexpected error:", error)
    return NextResponse.json({ error: "Unexpected error creating order request." }, { status: 500 })
  }
}
