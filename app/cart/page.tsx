import type { Metadata } from "next"
import { CartPageClient } from "@/components/cart-page-client"

export const metadata: Metadata = { title: "Shporta" }

export default function CartPage() {
  return <CartPageClient />
}
