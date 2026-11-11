"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Copy, Loader2, Mail, MapPin, MessageSquareText, Phone, Search, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { FilterTabs, Thumb, relativeDate } from "@/components/admin/admin-ui"
import { StatusPill } from "@/components/account/account-ui"
import { ORDER_FLOW, PAYMENT_LABELS, statusMeta } from "@/lib/order-status"
import { formatPrice } from "@/lib/shop-config"
import type { Address, Order } from "@/lib/types"

type Tab = "all" | "pending" | "active" | "done" | "cancelled"
const ACTIVE = ["confirmed", "processing", "shipped", "in_progress"]
const DONE = ["delivered", "completed"]

const matchesTab = (o: Order, tab: Tab) =>
  tab === "all" ||
  (tab === "pending" && o.status === "pending") ||
  (tab === "active" && ACTIVE.includes(o.status)) ||
  (tab === "done" && DONE.includes(o.status)) ||
  (tab === "cancelled" && o.status === "cancelled")

const amount = (o: Order) => Number(o.total ?? o.furniture_price ?? 0)

/** Normalises local Kosovo numbers (049…) to international format for wa.me. */
function customerWhatsApp(phone: string) {
  let digits = phone.replace(/\D/g, "")
  if (digits.startsWith("00")) digits = digits.slice(2)
  else if (digits.startsWith("0")) digits = `383${digits.slice(1)}`
  return `https://wa.me/${digits}`
}

export function OrdersTable({ initialOrders }: { initialOrders: Order[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState(initialOrders)
  const [query, setQuery] = useState("")
  const [tab, setTab] = useState<Tab>((searchParams.get("status") as Tab) === "pending" ? "pending" : "all")
  const [openId, setOpenId] = useState<string | null>(searchParams.get("open"))

  useEffect(() => setOrders(initialOrders), [initialOrders])

  const counts = useMemo(() => {
    const c = { all: orders.length, pending: 0, active: 0, done: 0, cancelled: 0 }
    for (const o of orders) for (const t of ["pending", "active", "done", "cancelled"] as const) if (matchesTab(o, t)) c[t]++
    return c
  }, [orders])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return orders.filter((o) => {
      if (!matchesTab(o, tab)) return false
      if (!q) return true
      return [o.order_number, o.customer_name, o.customer_phone, o.customer_email, o.furniture_title]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    })
  }, [orders, tab, query])

  const open = orders.find((o) => o.id === openId) ?? null

  const setOpen = (id: string | null) => {
    setOpenId(id)
    const params = new URLSearchParams(searchParams.toString())
    if (id) params.set("open", id)
    else params.delete("open")
    router.replace(`${pathname}${params.size ? `?${params}` : ""}`, { scroll: false })
  }

  const updateStatus = async (order: Order, status: string) => {
    const prev = order.status
    setOrders((list) => list.map((o) => (o.id === order.id ? { ...o, status: status as Order["status"] } : o)))
    const res = await fetch(`/api/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (!res.ok) {
      setOrders((list) => list.map((o) => (o.id === order.id ? { ...o, status: prev } : o)))
      toast.error("Statusi nuk u ndryshua")
      return
    }
    toast.success(`Statusi: ${statusMeta(status).label}`)
    router.refresh()
  }

  const deleteOrder = async (order: Order) => {
    const res = await fetch(`/api/orders/${order.id}`, { method: "DELETE" })
    if (!res.ok) {
      toast.error("Porosia nuk u fshi")
      return
    }
    setOrders((list) => list.filter((o) => o.id !== order.id))
    setOpen(null)
    toast.success("Porosia u fshi")
    router.refresh()
  }

  return (
    <>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FilterTabs
          value={tab}
          onChange={setTab}
          options={[
            { value: "all", label: "Të gjitha", count: counts.all },
            { value: "pending", label: "Në pritje", count: counts.pending },
            { value: "active", label: "Në proces", count: counts.active },
            { value: "done", label: "Të përfunduara", count: counts.done },
            { value: "cancelled", label: "Të anuluara", count: counts.cancelled },
          ]}
        />
        <div className="relative lg:w-80">
          <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Kërko numër, klient, telefon…"
            className="pl-10"
            aria-label="Kërko porositë"
          />
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-3xl border bg-card">
        {filtered.length === 0 ? (
          <p className="px-6 py-16 text-center text-sm text-muted-foreground">Asnjë porosi nuk përputhet me filtrat.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground max-md:hidden">
              <tr>
                <th className="px-5 py-3 font-medium">Porosia</th>
                <th className="px-5 py-3 font-medium">Klienti</th>
                <th className="px-5 py-3 font-medium">Artikujt</th>
                <th className="px-5 py-3 font-medium">Statusi</th>
                <th className="px-5 py-3 text-right font-medium">Totali</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((o) => {
                const items = o.items ?? []
                return (
                  <tr
                    key={o.id}
                    onClick={() => setOpen(o.id)}
                    className="cursor-pointer transition-colors hover:bg-muted/50 max-md:grid max-md:grid-cols-[1fr_auto] max-md:gap-1 max-md:px-4 max-md:py-3.5"
                  >
                    <td className="md:px-5 md:py-3.5">
                      <button type="button" className="text-left font-mono text-[13px] font-semibold" onClick={() => setOpen(o.id)}>
                        {o.order_number || o.id.slice(0, 8)}
                      </button>
                      <p className="text-xs text-muted-foreground">{relativeDate(o.created_at)}</p>
                    </td>
                    <td className="md:px-5 md:py-3.5 max-md:row-start-2">
                      <p className="font-medium">{o.customer_name || "—"}</p>
                      <p className="text-xs text-muted-foreground">{o.customer_phone}</p>
                    </td>
                    <td className="px-5 py-3.5 max-md:hidden">
                      <div className="flex -space-x-2">
                        {items.slice(0, 3).map((i) => (
                          <Thumb key={i.id} src={i.product_image} className="size-9 ring-2 ring-card" />
                        ))}
                        {items.length > 3 && (
                          <span className="grid size-9 place-items-center rounded-xl bg-muted text-xs ring-2 ring-card">
                            +{items.length - 3}
                          </span>
                        )}
                        {items.length === 0 && <span className="text-xs text-muted-foreground">{o.furniture_title}</span>}
                      </div>
                    </td>
                    <td className="md:px-5 md:py-3.5 max-md:row-start-1 max-md:text-right">
                      <StatusPill status={o.status} />
                    </td>
                    <td className="text-right font-semibold tabular-nums md:px-5 md:py-3.5 max-md:row-start-2">
                      {formatPrice(amount(o))}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <OrderSheet order={open} onClose={() => setOpen(null)} onStatus={updateStatus} onDelete={deleteOrder} />
    </>
  )
}

function AddressBlock({ address }: { address: Address | null }) {
  if (!address) return <p className="text-sm text-muted-foreground">—</p>
  return (
    <p className="text-sm leading-relaxed">
      {[address.first_name, address.last_name].filter(Boolean).join(" ")}
      <br />
      {address.street}
      <br />
      {[address.postal_code, address.city].filter(Boolean).join(" ")}
      {address.country ? `, ${address.country}` : ""}
    </p>
  )
}

function OrderSheet({
  order,
  onClose,
  onStatus,
  onDelete,
}: {
  order: Order | null
  onClose: () => void
  onStatus: (o: Order, s: string) => Promise<void>
  onDelete: (o: Order) => Promise<void>
}) {
  const [busy, setBusy] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success("U kopjua"))
  }

  return (
    <Sheet open={!!order} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="gap-0 p-0 sm:max-w-[520px]">
        {order && (
          <>
            <SheetHeader className="border-b p-6">
              <div className="flex items-center gap-3">
                <SheetTitle className="font-mono text-lg">{order.order_number || order.id.slice(0, 8)}</SheetTitle>
                <button
                  type="button"
                  onClick={() => copy(order.order_number || order.id)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Kopjo numrin"
                >
                  <Copy className="size-3.5" />
                </button>
              </div>
              <SheetDescription>
                {new Date(order.created_at).toLocaleString("sq-AL", { dateStyle: "long", timeStyle: "short" })}
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              <div className="flex items-center gap-3">
                <Select
                  value={order.status}
                  onValueChange={async (v) => {
                    setBusy(true)
                    await onStatus(order, v)
                    setBusy(false)
                  }}
                  disabled={busy}
                >
                  <SelectTrigger className="flex-1" aria-label="Statusi i porosisë">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[...new Set([...ORDER_FLOW, order.status])].map((s) => (
                      <SelectItem key={s} value={s}>
                        {statusMeta(s).label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {busy && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
              </div>

              <section>
                <h3 className="eyebrow mb-3">Klienti</h3>
                <div className="space-y-2 rounded-2xl border p-4 text-sm">
                  <p className="font-medium">{order.customer_name || "—"}</p>
                  {order.customer_phone && (
                    <div className="flex items-center justify-between gap-2">
                      <a href={`tel:${order.customer_phone}`} className="flex items-center gap-2 hover:text-primary">
                        <Phone className="size-4 text-muted-foreground" /> {order.customer_phone}
                      </a>
                      <a
                        href={customerWhatsApp(order.customer_phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-[#1a9e4b] hover:underline"
                      >
                        WhatsApp
                      </a>
                    </div>
                  )}
                  {order.customer_email && (
                    <a href={`mailto:${order.customer_email}`} className="flex items-center gap-2 hover:text-primary">
                      <Mail className="size-4 text-muted-foreground" /> {order.customer_email}
                    </a>
                  )}
                </div>
              </section>

              <section className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="eyebrow mb-3 flex items-center gap-1.5">
                    <MapPin className="size-3" /> Dërgesa
                  </h3>
                  <AddressBlock address={order.shipping_address} />
                </div>
                <div>
                  <h3 className="eyebrow mb-3">Pagesa</h3>
                  <p className="text-sm">{PAYMENT_LABELS[order.payment_method] ?? order.payment_method ?? "—"}</p>
                </div>
              </section>

              {(order.notes || order.customer_message) && (
                <section>
                  <h3 className="eyebrow mb-3 flex items-center gap-1.5">
                    <MessageSquareText className="size-3" /> Shënime
                  </h3>
                  <p className="rounded-2xl bg-muted/60 p-4 text-sm whitespace-pre-line">{order.notes || order.customer_message}</p>
                </section>
              )}

              <section>
                <h3 className="eyebrow mb-3">Artikujt</h3>
                <ul className="divide-y rounded-2xl border">
                  {(order.items ?? []).map((i) => (
                    <li key={i.id} className="flex items-center gap-3 p-3">
                      <Thumb src={i.product_image} />
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-1 text-sm">{i.product_title}</span>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {i.quantity} × {formatPrice(i.price)}
                        </span>
                      </span>
                      <span className="text-sm font-medium tabular-nums">{formatPrice(i.subtotal)}</span>
                    </li>
                  ))}
                  {(order.items ?? []).length === 0 && (
                    <li className="p-3 text-sm">{order.furniture_title || "—"}</li>
                  )}
                </ul>
                <dl className="mt-4 space-y-2 text-sm">
                  {order.subtotal != null && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Nëntotali</dt>
                      <dd className="tabular-nums">{formatPrice(order.subtotal)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Transporti</dt>
                    <dd className="tabular-nums">{order.shipping_cost ? formatPrice(order.shipping_cost) : "Falas"}</dd>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-base font-semibold">
                    <dt>Totali</dt>
                    <dd className="tabular-nums">{formatPrice(amount(order))}</dd>
                  </div>
                </dl>
              </section>
            </div>

            <SheetFooter className="flex-row border-t">
              <Button variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setConfirmDelete(true)}>
                <Trash2 /> Fshi
              </Button>
              <Button variant="outline" className="ml-auto" onClick={onClose}>
                Mbyll
              </Button>
            </SheetFooter>

            <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Të fshihet porosia?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Porosia {order.order_number} dhe artikujt e saj do të fshihen përgjithmonë. Ky veprim nuk kthehet.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Anulo</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-white hover:bg-destructive/90"
                    onClick={() => onDelete(order)}
                  >
                    Fshi porosinë
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
