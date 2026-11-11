/**
 * Single source of truth for store-wide business rules and contact details.
 * Used by both the client (display) and the server (order pricing), so the
 * numbers a customer sees are exactly the numbers the server charges.
 */
export const SHOP = {
  name: "Flux Dekor",
  currency: "EUR",
  freeShippingThreshold: 50,
  shippingCost: 3,
  maxQuantityPerItem: 99,
  lowStockThreshold: 5,
  contact: {
    phone: "+383 49 514 788",
    phoneHref: "tel:+38349514788",
    whatsapp: "38349514788",
    email: "info@fluxdekor.com",
    instagram: "https://www.instagram.com/dardaniamobileri",
    hours: "10:00 – 22:00",
    location: "Kosovë",
  },
} as const

export function shippingFor(subtotal: number): number {
  if (subtotal <= 0) return 0
  return subtotal >= SHOP.freeShippingThreshold ? 0 : SHOP.shippingCost
}

/** Price a customer actually pays for one unit (discount only when it is lower). */
export function unitPrice(product: { price: number; discount_price: number | null }): number {
  const price = Number(product.price)
  const discount = product.discount_price == null ? null : Number(product.discount_price)
  return discount != null && discount > 0 && discount < price ? discount : price
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100
}

const priceFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
})

export function formatPrice(value: number | string | null | undefined): string {
  const n = Number(value ?? 0)
  return priceFormatter.format(Number.isFinite(n) ? n : 0)
}

export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${SHOP.contact.whatsapp}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}
