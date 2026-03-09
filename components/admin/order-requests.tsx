"use client"

import { useMemo, useState, useTransition } from "react"
import type { Order } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatDistanceToNow } from "date-fns"
import {
  Inbox, Loader2, ChevronDown, ChevronUp, Phone, Mail, MapPin,
  Trash2, Search, X,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const STATUS_OPTIONS: { value: Order["status"]; label: string; color: string; dot: string }[] = [
  { value: "pending", label: "Ne pritje", color: "bg-yellow-100 text-yellow-800", dot: "bg-yellow-500" },
  { value: "confirmed", label: "Konfirmuar", color: "bg-blue-100 text-blue-800", dot: "bg-blue-500" },
  { value: "processing", label: "Duke u procesuar", color: "bg-indigo-100 text-indigo-800", dot: "bg-indigo-500" },
  { value: "shipped", label: "Derguar", color: "bg-purple-100 text-purple-800", dot: "bg-purple-500" },
  { value: "delivered", label: "Dorezuar", color: "bg-green-100 text-green-800", dot: "bg-green-500" },
  { value: "cancelled", label: "Anulluar", color: "bg-red-100 text-red-800", dot: "bg-red-500" },
]

const TABS = [
  { value: "all", label: "Te gjitha" },
  { value: "pending", label: "Ne pritje" },
  { value: "confirmed", label: "Konfirmuar" },
  { value: "processing", label: "Procesim" },
  { value: "shipped", label: "Derguar" },
  { value: "delivered", label: "Dorezuar" },
  { value: "cancelled", label: "Anulluar" },
]

interface OrderRequestsProps {
  orders: Order[]
}

export function OrderRequests({ orders }: OrderRequestsProps) {
  const router = useRouter()
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState("all")
  const [search, setSearch] = useState("")

  const formattedOrders = useMemo(() => {
    return orders.map((order) => ({
      ...order,
      items: (order as any).order_items || order.items || [],
      createdAgo: formatDistanceToNow(new Date(order.created_at), { addSuffix: true }),
    }))
  }, [orders])

  const filteredOrders = useMemo(() => {
    let result = formattedOrders
    if (activeTab !== "all") {
      result = result.filter((o) => o.status === activeTab)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((o) =>
        (o.customer_name || "").toLowerCase().includes(q) ||
        (o.order_number || "").toLowerCase().includes(q) ||
        (o.customer_phone || "").includes(q) ||
        (o.customer_email || "").toLowerCase().includes(q)
      )
    }
    return result
  }, [formattedOrders, activeTab, search])

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length }
    for (const o of orders) {
      counts[o.status] = (counts[o.status] || 0) + 1
    }
    return counts
  }, [orders])

  const handleStatusChange = async (orderId: string, status: Order["status"]) => {
    setPendingOrderId(orderId)
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || "Deshtoi ndryshimi i statusit")
      }
      toast.success("Statusi u ndryshua!")
      startTransition(() => router.refresh())
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nuk mund te ndryshohej statusi")
    } finally {
      setPendingOrderId(null)
    }
  }

  const handleDelete = async (orderId: string) => {
    if (!confirm("Jeni te sigurt qe doni te fshini kete porosi?")) return
    setDeletingId(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success("Porosia u fshi")
      if (expandedOrder === orderId) setExpandedOrder(null)
      startTransition(() => router.refresh())
    } catch {
      toast.error("Deshtoi fshirja e porosise")
    } finally {
      setDeletingId(null)
    }
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 bg-muted/30 py-12 text-center text-muted-foreground">
        <Inbox className="h-10 w-10 text-muted-foreground/70" />
        <div>
          <p className="font-medium text-foreground">Nuk ka porosi ende</p>
          <p className="text-sm text-muted-foreground/80">Kur klientet bejne porosi, ato do te shfaqen ketu.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Filters */}
      <div className="mb-4 space-y-3">
        {/* Status tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
          {TABS.map((tab) => {
            const count = statusCounts[tab.value] || 0
            if (tab.value !== "all" && count === 0) return null
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.value
                    ? "bg-primary text-white"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {tab.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.value ? "bg-white/20" : "bg-background"
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Kerko me emer, nr. porosise, telefon..."
            className="pl-9 h-9 text-sm"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Results info */}
      {(activeTab !== "all" || search) && (
        <p className="text-xs text-muted-foreground mb-3">
          {filteredOrders.length} porosi te gjetura
        </p>
      )}

      {/* Orders */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          Nuk u gjet asnje porosi.
        </div>
      ) : (
        <div className="space-y-2">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrder === order.id
            const statusOption = STATUS_OPTIONS.find((s) => s.value === order.status) || STATUS_OPTIONS[0]
            const itemCount = order.items?.length || 0
            const isDeleting = deletingId === order.id

            return (
              <div
                key={order.id}
                className={`rounded-xl border overflow-hidden transition-shadow ${
                  isExpanded ? "shadow-md border-primary/20" : "border-border/60 hover:border-border"
                }`}
              >
                {/* Header */}
                <div
                  className="p-3 sm:p-4 flex items-center gap-3 cursor-pointer hover:bg-muted/20 transition-colors bg-white"
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                >
                  <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${statusOption.dot}`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm">
                        {order.order_number || `#${order.id.slice(0, 8)}`}
                      </span>
                      <Badge className={`text-[10px] ${statusOption.color} border-0 px-1.5 py-0`}>
                        {statusOption.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span className="font-medium text-foreground/70">{order.customer_name || "Pa emer"}</span>
                      <span>·</span>
                      <span>{order.createdAgo}</span>
                      {itemCount > 0 && <><span>·</span><span>{itemCount} produkte</span></>}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm">
                      {order.total ? `${Number(order.total).toFixed(2)} €` : order.furniture_price ? `${Number(order.furniture_price).toFixed(2)} €` : "—"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {order.payment_method === "cash_on_delivery" ? "Para ne dore" : order.payment_method === "bank_transfer" ? "Transfer bankar" : ""}
                    </p>
                  </div>

                  {isExpanded ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t bg-[#fafafa] p-4 space-y-4">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Customer */}
                      <div>
                        <h4 className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider mb-2">Klienti</h4>
                        <div className="bg-white rounded-lg p-3 border border-border/30 space-y-1.5">
                          <p className="text-sm font-medium">{order.customer_name || "Pa emer"}</p>
                          {order.customer_phone && (
                            <a href={`tel:${order.customer_phone}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary">
                              <Phone className="h-3 w-3" /> {order.customer_phone}
                            </a>
                          )}
                          {order.customer_email && (
                            <a href={`mailto:${order.customer_email}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary">
                              <Mail className="h-3 w-3" /> {order.customer_email}
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Address */}
                      {order.shipping_address && (
                        <div>
                          <h4 className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider mb-2">Adresa</h4>
                          <div className="bg-white rounded-lg p-3 border border-border/30">
                            <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                              <div>
                                <p>{(order.shipping_address as any).street}</p>
                                <p>{(order.shipping_address as any).city}{(order.shipping_address as any).postal_code ? `, ${(order.shipping_address as any).postal_code}` : ""}</p>
                                <p>{(order.shipping_address as any).country}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Summary */}
                      <div>
                        <h4 className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider mb-2">Permbledhje</h4>
                        <div className="bg-white rounded-lg p-3 border border-border/30 space-y-1 text-xs">
                          {order.subtotal && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Nentotali</span>
                              <span>{Number(order.subtotal).toFixed(2)} €</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Transporti</span>
                            <span>{order.shipping_cost === 0 ? "Falas" : `${Number(order.shipping_cost || 0).toFixed(2)} €`}</span>
                          </div>
                          {order.total && (
                            <div className="flex justify-between font-bold border-t border-border/30 pt-1 text-sm">
                              <span>Totali</span>
                              <span>{Number(order.total).toFixed(2)} €</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    {order.items && order.items.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider mb-2">Produktet ({order.items.length})</h4>
                        <div className="bg-white rounded-lg border border-border/30 divide-y divide-border/20">
                          {order.items.map((item: any) => (
                            <div key={item.id} className="flex items-center gap-3 p-2.5">
                              <div className="h-10 w-10 rounded bg-[#f8f9fa] overflow-hidden shrink-0">
                                <img src={item.product_image || "/placeholder.svg"} alt={item.product_title} className="h-full w-full object-contain p-0.5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{item.product_title}</p>
                                <p className="text-xs text-muted-foreground">{item.quantity} x {Number(item.price).toFixed(2)} €</p>
                              </div>
                              <span className="text-sm font-bold shrink-0">{(Number(item.price) * item.quantity).toFixed(2)} €</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Legacy */}
                    {!order.items?.length && order.furniture_title && (
                      <div>
                        <h4 className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider mb-2">Produkti</h4>
                        <div className="bg-white rounded-lg p-3 border border-border/30">
                          <p className="text-sm font-medium">{order.furniture_title}</p>
                          <p className="text-xs text-muted-foreground">{Number(order.furniture_price).toFixed(2)} €</p>
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {(order.notes || order.customer_message) && (
                      <div>
                        <h4 className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider mb-2">Shenime</h4>
                        <p className="text-sm text-muted-foreground bg-white rounded-lg p-3 border border-border/30">
                          {order.notes || order.customer_message}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-3 border-t border-border/30 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">Status:</span>
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleStatusChange(order.id, value as Order["status"])}
                          disabled={pendingOrderId === order.id || isPending}
                        >
                          <SelectTrigger className="w-[170px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                <span className="flex items-center gap-2">
                                  <span className={`h-2 w-2 rounded-full ${option.dot}`} />
                                  {option.label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {pendingOrderId === order.id && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
                      </div>

                      <div className="flex items-center gap-2 ml-auto">
                        {order.customer_phone && (
                          <a
                            href={`https://wa.me/${order.customer_phone.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm" type="button" className="h-8 text-xs">
                              WhatsApp
                            </Button>
                          </a>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs text-destructive border-destructive/30 hover:bg-destructive hover:text-white"
                          onClick={(e) => { e.stopPropagation(); handleDelete(order.id) }}
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <><Trash2 className="h-3.5 w-3.5 mr-1" /> Fshi</>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
