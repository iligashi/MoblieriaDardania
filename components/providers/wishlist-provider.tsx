"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import type { WishlistItem, Product } from "@/lib/types"

interface WishlistContextType {
  items: WishlistItem[]
  isLoading: boolean
  itemCount: number
  addItem: (productId: string) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  isInWishlist: (productId: string) => boolean
  toggleItem: (productId: string) => Promise<void>
}

const WishlistContext = createContext<WishlistContextType | null>(null)

const LOCAL_STORAGE_KEY = "wishlist_items"

function getLocalWishlist(): string[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function setLocalWishlist(productIds: string[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(productIds))
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider")
  return ctx
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { isLoggedIn, isLoading: authLoading } = useAuth()

  const fetchWishlist = useCallback(async () => {
    try {
      if (isLoggedIn) {
        const res = await fetch("/api/wishlist")
        if (res.ok) {
          const data = await res.json()
          setItems(data)
        }
      } else {
        const localIds = getLocalWishlist()
        if (localIds.length === 0) {
          setItems([])
          return
        }
        const res = await fetch(`/api/wishlist/local?ids=${localIds.join(",")}`)
        if (res.ok) {
          const products: Product[] = await res.json()
          const wishlistItems: WishlistItem[] = products.map((p) => ({
            id: `local_${p.id}`,
            customer_id: "",
            product_id: p.id,
            created_at: new Date().toISOString(),
            product: p,
          }))
          setItems(wishlistItems)
        }
      }
    } catch (err) {
      console.error("Failed to fetch wishlist:", err)
    } finally {
      setIsLoading(false)
    }
  }, [isLoggedIn])

  // Sync local wishlist to DB when user logs in
  useEffect(() => {
    if (authLoading) return

    if (isLoggedIn) {
      const localIds = getLocalWishlist()
      if (localIds.length > 0) {
        Promise.all(
          localIds.map((id) =>
            fetch("/api/wishlist", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ product_id: id }),
            })
          )
        ).then(() => {
          localStorage.removeItem(LOCAL_STORAGE_KEY)
          fetchWishlist()
        })
      } else {
        fetchWishlist()
      }
    } else {
      fetchWishlist()
    }
  }, [isLoggedIn, authLoading, fetchWishlist])

  const addItem = async (productId: string) => {
    if (isLoggedIn) {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId }),
      })
      if (res.ok) {
        await fetchWishlist()
      }
    } else {
      const localIds = getLocalWishlist()
      if (!localIds.includes(productId)) {
        localIds.push(productId)
        setLocalWishlist(localIds)
        await fetchWishlist()
      }
    }
  }

  const removeItem = async (productId: string) => {
    if (isLoggedIn) {
      const item = items.find((i) => i.product_id === productId)
      if (!item) return
      const res = await fetch(`/api/wishlist/${item.id}`, { method: "DELETE" })
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.product_id !== productId))
      }
    } else {
      const localIds = getLocalWishlist().filter((id) => id !== productId)
      setLocalWishlist(localIds)
      setItems((prev) => prev.filter((i) => i.product_id !== productId))
    }
  }

  const isInWishlist = (productId: string) => items.some((i) => i.product_id === productId)

  const toggleItem = async (productId: string) => {
    if (isInWishlist(productId)) {
      await removeItem(productId)
    } else {
      await addItem(productId)
    }
  }

  return (
    <WishlistContext.Provider
      value={{ items, isLoading, itemCount: items.length, addItem, removeItem, isInWishlist, toggleItem }}
    >
      {children}
    </WishlistContext.Provider>
  )
}
