"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import type { CartItem, Product } from "@/lib/types"
import { unitPrice } from "@/lib/shop-config"
import { useAuth } from "@/components/providers/auth-provider"

interface CartContextType {
  items: CartItem[]
  isLoading: boolean
  itemCount: number
  subtotal: number
  isOpen: boolean
  setOpen: (open: boolean) => void
  addItem: (product: Product, quantity?: number, options?: { openDrawer?: boolean }) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  refresh: () => Promise<void>
}

const CartContext = createContext<CartContextType | null>(null)

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}

const SESSION_KEY = "cart_session_id"

/** Anonymous cart id. Stored per browser; the server only trusts it for guest carts. */
function getSessionId(): string {
  if (typeof window === "undefined") return ""
  try {
    let id = localStorage.getItem(SESSION_KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(SESSION_KEY, id)
    }
    return id
  } catch {
    return ""
  }
}

async function cartFetch(input: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers)
  const session = getSessionId()
  if (session) headers.set("x-cart-session", session)
  if (init.body) headers.set("Content-Type", "application/json")
  const res = await fetch(input, { ...init, headers })
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.error || "Diçka shkoi keq. Provoni përsëri.")
  }
  return res
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setOpen] = useState(false)
  const { isLoggedIn, isLoading: authLoading } = useAuth()
  const itemsRef = useRef<CartItem[]>([])
  itemsRef.current = items

  const refresh = useCallback(async () => {
    try {
      const res = await cartFetch("/api/cart")
      const data = await res.json()
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Failed to fetch cart:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Re-fetch when the auth state settles or changes (signing in merges the guest cart).
  useEffect(() => {
    if (authLoading) return
    refresh()
  }, [authLoading, isLoggedIn, refresh])

  const removeItem = useCallback(async (itemId: string) => {
    const previous = itemsRef.current
    setItems((prev) => prev.filter((i) => i.id !== itemId))
    try {
      await cartFetch(`/api/cart/${itemId}`, { method: "DELETE" })
    } catch (err) {
      setItems(previous)
      throw err
    }
  }, [])

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (quantity < 1) return removeItem(itemId)
      const previous = itemsRef.current
      setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, quantity } : i)))
      try {
        const res = await cartFetch(`/api/cart/${itemId}`, {
          method: "PUT",
          body: JSON.stringify({ quantity }),
        })
        const updated: CartItem = await res.json()
        setItems((prev) => prev.map((i) => (i.id === itemId ? updated : i)))
      } catch (err) {
        setItems(previous)
        throw err
      }
    },
    [removeItem],
  )

  const addItem = useCallback(
    async (product: Product, quantity = 1, options: { openDrawer?: boolean } = { openDrawer: true }) => {
      const res = await cartFetch("/api/cart", {
        method: "POST",
        body: JSON.stringify({ product_id: product.id, quantity }),
      })
      const saved: CartItem = await res.json()
      setItems((prev) => {
        const exists = prev.some((i) => i.id === saved.id)
        return exists ? prev.map((i) => (i.id === saved.id ? saved : i)) : [...prev, saved]
      })
      if (options.openDrawer !== false) setOpen(true)
    },
    [],
  )

  const clearCart = useCallback(async () => {
    setItems([])
    try {
      await cartFetch("/api/cart", { method: "DELETE" })
    } catch (err) {
      console.error("Failed to clear cart:", err)
    }
  }, [])

  const value = useMemo<CartContextType>(() => {
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
    const subtotal = items.reduce((sum, i) => (i.product ? sum + unitPrice(i.product) * i.quantity : sum), 0)
    return {
      items,
      isLoading,
      itemCount,
      subtotal: Math.round(subtotal * 100) / 100,
      isOpen,
      setOpen,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      refresh,
    }
  }, [items, isLoading, isOpen, addItem, removeItem, updateQuantity, clearCart, refresh])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
