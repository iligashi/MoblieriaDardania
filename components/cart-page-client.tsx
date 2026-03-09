"use client"

import { useCart } from "@/components/providers/cart-provider"
import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const FREE_SHIPPING_THRESHOLD = 50

export function CartPageClient() {
  const { items, isLoading, subtotal, updateQuantity, removeItem } = useCart()

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-24 bg-muted rounded" />
          <div className="h-24 bg-muted rounded" />
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingCart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Shporta eshte bosh</h1>
        <p className="text-muted-foreground mb-6">Nuk ka produkte ne shporten tuaj.</p>
        <Button asChild>
          <Link href="/shop">Kthehu ne dyqan</Link>
        </Button>
      </div>
    )
  }

  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 3
  const total = subtotal + shippingCost
  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal

  return (
    <div className="bg-[#f8f9fa] min-h-screen">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Shporta</h1>

        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          {/* Cart Items */}
          <div className="space-y-3">
            {items.map((item) => {
              const product = item.product
              if (!product) return null
              const price = product.discount_price ?? product.price
              const hasDiscount = product.discount_price && product.discount_price < product.price

              return (
                <div key={item.id} className="bg-white rounded-xl border border-border/50 p-4 flex gap-4">
                  {/* Image */}
                  <Link href={`/products/${product.slug || product.id}`} className="shrink-0">
                    <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-lg bg-[#f8f9fa] overflow-hidden">
                      <img
                        src={product.images?.[0] || "/placeholder.svg"}
                        alt={product.title}
                        className="h-full w-full object-contain p-2"
                      />
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${product.slug || product.id}`}
                      className="text-sm sm:text-base font-semibold hover:text-primary transition-colors line-clamp-2"
                    >
                      {product.title}
                    </Link>

                    {product.category && (
                      <p className="text-xs text-muted-foreground mt-1 capitalize">{product.category}</p>
                    )}

                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-base font-bold">{price.toFixed(2)} &euro;</span>
                      {hasDiscount && (
                        <span className="text-xs text-muted-foreground line-through">
                          {product.price.toFixed(2)} &euro;
                        </span>
                      )}
                    </div>

                    {/* Quantity + Remove */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-border rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-8 w-8 flex items-center justify-center hover:bg-muted transition-colors rounded-l-lg"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="h-8 w-10 flex items-center justify-center text-sm font-medium border-x border-border">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-8 w-8 flex items-center justify-center hover:bg-muted transition-colors rounded-r-lg"
                          disabled={item.quantity >= product.stock}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold">
                          {(price * item.quantity).toFixed(2)} &euro;
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-xl border border-border/50 p-5 sticky top-24">
              <h2 className="text-lg font-bold mb-4">Permbledhja e porosise</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nentotali</span>
                  <span className="font-medium">{subtotal.toFixed(2)} &euro;</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transporti</span>
                  <span className="font-medium">
                    {shippingCost === 0 ? (
                      <span className="text-green-600">Falas</span>
                    ) : (
                      `${shippingCost.toFixed(2)} €`
                    )}
                  </span>
                </div>

                {remainingForFreeShipping > 0 && (
                  <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
                    Shto edhe {remainingForFreeShipping.toFixed(2)} EUR per transport falas!
                  </div>
                )}

                <div className="border-t border-border pt-3 flex justify-between text-base font-bold">
                  <span>Totali</span>
                  <span>{total.toFixed(2)} &euro;</span>
                </div>
              </div>

              <Button asChild className="w-full mt-5 h-11 font-bold">
                <Link href="/checkout">
                  Vazhdo me porosine
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>

              <Link
                href="/shop"
                className="block text-center text-sm text-primary hover:underline mt-3"
              >
                Vazhdo blerjen
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
