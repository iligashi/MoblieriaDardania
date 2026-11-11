"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import type { Order } from "@/lib/types"

export function useMyOrders() {
  const { user, isLoading: authLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setLoading(false)
      return
    }
    const controller = new AbortController()
    setLoading(true)
    fetch("/api/orders", { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch((e) => {
        if (e?.name !== "AbortError") setError(true)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [user, authLoading])

  return { orders, loading: authLoading || loading, error }
}
