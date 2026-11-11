"use client"

import Link from "next/link"
import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useCart } from "@/components/providers/cart-provider"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { FreeShippingProgress, QuantityStepper } from "@/components/cart-ui"
import { SHOP, formatPrice, unitPrice } from "@/lib/shop-config"

export function CartDrawer() {
  const { items, isOpen, setOpen, itemCount, subtotal, updateQuantity, removeItem } = useCart()

  const run = (promise: Promise<void>) => promise.catch((e: Error) => toast.error(e.message))

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent side="right" className="gap-0 p-0 sm:max-w-[440px]">
        <SheetHeader className="border-b p-5">
          <SheetTitle className="flex items-center gap-2">
            Shporta
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground tabular-nums">
              {itemCount}
            </span>
          </SheetTitle>
          <SheetDescription className="sr-only">Produktet në shportën tuaj</SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="grid size-16 place-items-center rounded-full bg-muted">
              <ShoppingBag className="size-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-display text-2xl">Shporta është bosh</p>
              <p className="mt-1 text-sm text-muted-foreground">Zbuloni produktet tona dhe shtoni të preferuarat.</p>
            </div>
            <Button asChild onClick={() => setOpen(false)}>
              <Link href="/shop">
                Fillo blerjen <ArrowRight />
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="px-5 pt-4">
              <FreeShippingProgress subtotal={subtotal} />
            </div>

            <ul className="flex-1 divide-y overflow-y-auto px-5">
              {items.map((item) => {
                const product = item.product
                if (!product) return null
                const price = unitPrice(product)
                const href = `/products/${product.slug || product.id}`
                return (
                  <li key={item.id} className="flex gap-4 py-4">
                    <Link
                      href={href}
                      onClick={() => setOpen(false)}
                      className="size-20 shrink-0 overflow-hidden rounded-xl bg-muted"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={product.images?.[0] || "/placeholder.svg"} alt={product.title} className="size-full object-cover" />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={href}
                          onClick={() => setOpen(false)}
                          className="line-clamp-2 text-sm font-medium hover:text-primary"
                        >
                          {product.title}
                        </Link>
                        <button
                          type="button"
                          onClick={() => run(removeItem(item.id))}
                          className="-mt-1 -mr-1 grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Hiq ${product.title}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{formatPrice(price)} / copë</p>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <QuantityStepper
                          size="sm"
                          value={item.quantity}
                          max={Math.min(product.stock, SHOP.maxQuantityPerItem)}
                          onChange={(q) => run(updateQuantity(item.id, q))}
                        />
                        <span className="text-sm font-semibold tabular-nums">{formatPrice(price * item.quantity)}</span>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>

            <SheetFooter className="border-t bg-card">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Nëntotali</span>
                <span className="text-lg font-semibold tabular-nums">{formatPrice(subtotal)}</span>
              </div>
              <p className="-mt-1 text-xs text-muted-foreground">Transporti llogaritet në arkë.</p>
              <Button asChild size="lg" className="mt-2 w-full" onClick={() => setOpen(false)}>
                <Link href="/checkout">
                  Vazhdo te pagesa <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="ghost" className="w-full" onClick={() => setOpen(false)}>
                <Link href="/cart">Shiko shportën</Link>
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
