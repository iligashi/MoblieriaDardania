"use client"

import type { Product } from "@/lib/types"
import { MessageCircle } from "lucide-react"

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER

export function WhatsAppButton({ product }: { product: Product }) {
  const handleClick = () => {
    if (!whatsappNumber) return
    const price = product.discount_price ?? product.price
    const message = [
      `Pershendetje, jam i/e interesuar per "${product.title}"`,
      `Cmimi: ${price.toFixed(2)} EUR`,
      product.sku ? `SKU: ${product.sku}` : null,
    ].filter(Boolean).join("\n")

    const cleanNumber = whatsappNumber.replace(/[^+\d]/g, "")
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`, "_blank")
  }

  if (!whatsappNumber) return null

  return (
    <button
      onClick={handleClick}
      className="w-full h-11 rounded-lg border-2 border-[#25d366] text-[#25d366] font-bold text-sm hover:bg-[#25d366] hover:text-white transition-all flex items-center justify-center gap-2"
    >
      <MessageCircle className="h-4 w-4" />
      Porosit ne WhatsApp
    </button>
  )
}
