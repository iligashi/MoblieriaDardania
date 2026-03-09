"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/components/providers/cart-provider"
import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, ShoppingCart, Lock } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const FREE_SHIPPING_THRESHOLD = 50

export function CheckoutClient() {
  const router = useRouter()
  const { items, subtotal, clearCart } = useCart()
  const { customer, isLoggedIn } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [form, setForm] = useState({
    first_name: customer?.first_name || "",
    last_name: customer?.last_name || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
    street: "",
    city: "",
    postal_code: "",
    country: "Kosove",
    notes: "",
    payment_method: "cash_on_delivery",
  })

  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 3
  const total = subtotal + shippingCost

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingCart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Shporta eshte bosh</h1>
        <p className="text-muted-foreground mb-6">Shtoni produkte ne shporte para se te beni porosine.</p>
        <Button asChild>
          <Link href="/shop">Kthehu ne dyqan</Link>
        </Button>
      </div>
    )
  }

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.first_name.trim() || !form.last_name.trim() || !form.phone.trim() || !form.street.trim() || !form.city.trim()) {
      toast.error("Ju lutem plotesoni te gjitha fushat e detyrueshme")
      return
    }

    setIsSubmitting(true)

    try {
      const orderItems = items.map((item) => ({
        product_id: item.product_id,
        product_title: item.product?.title || "",
        product_image: item.product?.images?.[0] || null,
        price: item.product?.discount_price ?? item.product?.price ?? 0,
        quantity: item.quantity,
      }))

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: orderItems,
          customer_name: `${form.first_name} ${form.last_name}`,
          customer_email: form.email || null,
          customer_phone: form.phone,
          billing_address: {
            first_name: form.first_name,
            last_name: form.last_name,
            street: form.street,
            city: form.city,
            postal_code: form.postal_code,
            country: form.country,
            phone: form.phone,
          },
          shipping_address: {
            first_name: form.first_name,
            last_name: form.last_name,
            street: form.street,
            city: form.city,
            postal_code: form.postal_code,
            country: form.country,
            phone: form.phone,
          },
          subtotal,
          shipping_cost: shippingCost,
          total,
          payment_method: form.payment_method,
          notes: form.notes || null,
          send_via_whatsapp: true,
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => null)
        throw new Error(err?.error || "Porosia deshtoi")
      }

      const data = await response.json()
      await clearCart()

      toast.success("Porosia u krye me sukses!")
      router.push(`/checkout/success?order=${data.order?.order_number || data.order?.id || ""}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Dicka shkoi gabim")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-[#f8f9fa] min-h-screen">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-[1fr_400px] gap-6">
            {/* Billing Form */}
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="bg-white rounded-xl border border-border/50 p-5">
                <h2 className="text-lg font-bold mb-4">Informatat e kontaktit</h2>
                <div className="grid gap-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Emri *</label>
                      <Input
                        value={form.first_name}
                        onChange={(e) => updateField("first_name", e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Mbiemri *</label>
                      <Input
                        value={form.last_name}
                        onChange={(e) => updateField("last_name", e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Telefoni *</label>
                      <Input
                        value={form.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        placeholder="+383 4X XXX XXX"
                        required
                        className="h-11"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Email</label>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-xl border border-border/50 p-5">
                <h2 className="text-lg font-bold mb-4">Adresa e dergeses</h2>
                <div className="grid gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Rruga / Adresa *</label>
                    <Input
                      value={form.street}
                      onChange={(e) => updateField("street", e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Qyteti *</label>
                      <Input
                        value={form.city}
                        onChange={(e) => updateField("city", e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Kodi Postar</label>
                      <Input
                        value={form.postal_code}
                        onChange={(e) => updateField("postal_code", e.target.value)}
                        className="h-11"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Shteti</label>
                      <Input value={form.country} onChange={(e) => updateField("country", e.target.value)} className="h-11" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl border border-border/50 p-5">
                <h2 className="text-lg font-bold mb-4">Menyra e pageses</h2>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/30 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="cash_on_delivery"
                      checked={form.payment_method === "cash_on_delivery"}
                      onChange={(e) => updateField("payment_method", e.target.value)}
                      className="accent-primary"
                    />
                    <span className="text-sm font-medium">Pagesa me para ne dore (Cash on Delivery)</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/30 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="bank_transfer"
                      checked={form.payment_method === "bank_transfer"}
                      onChange={(e) => updateField("payment_method", e.target.value)}
                      className="accent-primary"
                    />
                    <span className="text-sm font-medium">Transfer bankar</span>
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white rounded-xl border border-border/50 p-5">
                <h2 className="text-lg font-bold mb-4">Shenime per porosine</h2>
                <Textarea
                  value={form.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  placeholder="Shenime shtese per dergesen ose porosine..."
                  rows={3}
                />
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-white rounded-xl border border-border/50 p-5 sticky top-24">
                <h2 className="text-lg font-bold mb-4">Porosia juaj</h2>

                <div className="space-y-3 mb-4">
                  {items.map((item) => {
                    const product = item.product
                    if (!product) return null
                    const price = product.discount_price ?? product.price
                    return (
                      <div key={item.id} className="flex gap-3">
                        <div className="h-14 w-14 rounded-lg bg-[#f8f9fa] overflow-hidden shrink-0">
                          <img
                            src={product.images?.[0] || "/placeholder.svg"}
                            alt={product.title}
                            className="h-full w-full object-contain p-1"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{product.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity} x {price.toFixed(2)} &euro;
                          </p>
                        </div>
                        <span className="text-sm font-bold shrink-0">
                          {(price * item.quantity).toFixed(2)} &euro;
                        </span>
                      </div>
                    )
                  })}
                </div>

                <div className="border-t border-border pt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nentotali</span>
                    <span>{subtotal.toFixed(2)} &euro;</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transporti</span>
                    <span>{shippingCost === 0 ? <span className="text-green-600">Falas</span> : `${shippingCost.toFixed(2)} €`}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold border-t border-border pt-2">
                    <span>Totali</span>
                    <span>{total.toFixed(2)} &euro;</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full mt-5 h-12 font-bold text-sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Duke procesuar...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      PERFUNDO POROSINE
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-3">
                  Duke perfunduar porosine, ju pranoni kushtet e sherbimit.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
