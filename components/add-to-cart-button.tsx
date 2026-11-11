"use client"

import { useState } from "react"
import { Check, Heart, Loader2, ShoppingBag } from "lucide-react"
import { toast } from "sonner"
import { useCart } from "@/components/providers/cart-provider"
import { useWishlist } from "@/components/providers/wishlist-provider"
import { Button } from "@/components/ui/button"
import { QuantityStepper } from "@/components/cart-ui"
import { SHOP } from "@/lib/shop-config"
import { cn } from "@/lib/utils"
import type { Product } from "@/lib/types"

export function AddToCartButton({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1)
  const [state, setState] = useState<"idle" | "adding" | "added">("idle")
  const { addItem } = useCart()
  const { isInWishlist, toggleItem } = useWishlist()
  const wishlisted = isInWishlist(product.id)
  const max = Math.min(product.stock, SHOP.maxQuantityPerItem)
  const outOfStock = product.stock <= 0

  const handleAdd = async () => {
    if (outOfStock || state === "adding") return
    setState("adding")
    try {
      await addItem(product, quantity)
      setState("added")
      setQuantity(1)
      setTimeout(() => setState("idle"), 1800)
    } catch (err) {
      setState("idle")
      toast.error(err instanceof Error ? err.message : "Diçka shkoi gabim")
    }
  }

  const handleWishlist = async () => {
    try {
      await toggleItem(product.id)
      toast.success(wishlisted ? "U hoq nga lista e dëshirave" : "U shtua në listën e dëshirave")
    } catch {
      toast.error("Nuk u ruajt. Provoni përsëri.")
    }
  }

  return (
    <div className="flex gap-2.5">
      {!outOfStock && <QuantityStepper size="lg" value={quantity} max={max} onChange={setQuantity} />}
      <Button size="lg" className="h-12 flex-1" onClick={handleAdd} disabled={outOfStock || state === "adding"}>
        {state === "adding" ? (
          <Loader2 className="animate-spin" />
        ) : state === "added" ? (
          <Check />
        ) : (
          <ShoppingBag />
        )}
        {outOfStock ? "Jo në stok" : state === "added" ? "U shtua" : "Shto në shportë"}
      </Button>
      <Button
        size="icon-lg"
        variant="outline"
        className="size-12"
        onClick={handleWishlist}
        aria-pressed={wishlisted}
        aria-label={wishlisted ? "Hiq nga lista e dëshirave" : "Shto në listën e dëshirave"}
      >
        <Heart className={cn(wishlisted && "fill-primary text-primary")} />
      </Button>
    </div>
  )
}
