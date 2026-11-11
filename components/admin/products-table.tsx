"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowDownUp, Copy, ExternalLink, MoreHorizontal, Pencil, Search, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { FilterTabs, Thumb } from "@/components/admin/admin-ui"
import { SHOP, formatPrice, unitPrice } from "@/lib/shop-config"
import { categoryKeys, productInCategory } from "@/lib/catalog"
import { cn } from "@/lib/utils"
import type { Category, Product } from "@/lib/types"

type Tab = "all" | "active" | "inactive" | "low" | "sale"
type Sort = "newest" | "title" | "price_desc" | "stock_asc"
const PAGE = 25

export function ProductsTable({
  initialProducts,
  categories,
  initialCategory = "all",
}: {
  initialProducts: Product[]
  categories: Category[]
  initialCategory?: string
}) {
  const router = useRouter()
  const [products, setProducts] = useState(initialProducts)
  const [tab, setTab] = useState<Tab>("all")
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState(initialCategory)
  const [sort, setSort] = useState<Sort>("newest")
  const [limit, setLimit] = useState(PAGE)
  const [toDelete, setToDelete] = useState<Product | null>(null)

  useEffect(() => setProducts(initialProducts), [initialProducts])
  useEffect(() => setLimit(PAGE), [tab, query, category, sort])

  const allKeys = useMemo(
    () => ({ ids: new Set(categories.map((c) => c.id)), slugs: new Set(categories.map((c) => c.slug)) }),
    [categories],
  )
  const catName = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories])

  const inTab = (p: Product, t: Tab) =>
    t === "all" ||
    (t === "active" && p.is_active) ||
    (t === "inactive" && !p.is_active) ||
    (t === "low" && p.stock <= SHOP.lowStockThreshold) ||
    (t === "sale" && unitPrice(p) < p.price)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = products.filter((p) => {
      if (!inTab(p, tab)) return false
      if (category === "none") {
        if (productInCategory(p, allKeys)) return false
      } else if (category !== "all") {
        const selected = categories.find((c) => c.id === category)
        if (selected && !productInCategory(p, categoryKeys(selected, categories))) return false
      }
      if (!q) return true
      return [p.title, p.sku, p.brand].some((v) => v?.toLowerCase().includes(q))
    })
    return list.sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title, "sq")
      if (sort === "price_desc") return unitPrice(b) - unitPrice(a)
      if (sort === "stock_asc") return a.stock - b.stock
      return b.created_at.localeCompare(a.created_at)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, tab, query, category, sort, categories])

  const counts = useMemo(() => {
    const c: Record<Tab, number> = { all: 0, active: 0, inactive: 0, low: 0, sale: 0 }
    for (const p of products) for (const t of Object.keys(c) as Tab[]) if (inTab(p, t)) c[t]++
    return c
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products])

  const patch = async (p: Product, changes: Partial<Pick<Product, "is_active" | "is_featured">>) => {
    setProducts((list) => list.map((x) => (x.id === p.id ? { ...x, ...changes } : x)))
    const res = await fetch(`/api/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(changes),
    })
    if (!res.ok) {
      setProducts((list) => list.map((x) => (x.id === p.id ? p : x)))
      toast.error("Ndryshimi nuk u ruajt")
    }
  }

  const remove = async (p: Product) => {
    const res = await fetch(`/api/products/${p.id}`, { method: "DELETE" })
    if (!res.ok) {
      toast.error("Produkti nuk u fshi")
      return
    }
    setProducts((list) => list.filter((x) => x.id !== p.id))
    toast.success("Produkti u fshi")
    router.refresh()
  }

  const roots = categories.filter((c) => !c.parent_id)

  return (
    <>
      <div className="flex flex-col gap-3">
        <FilterTabs
          value={tab}
          onChange={setTab}
          options={[
            { value: "all", label: "Të gjitha", count: counts.all },
            { value: "active", label: "Aktive", count: counts.active },
            { value: "inactive", label: "Joaktive", count: counts.inactive },
            { value: "low", label: "Stok i ulët", count: counts.low },
            { value: "sale", label: "Në zbritje", count: counts.sale },
          ]}
        />
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Kërko sipas titullit, SKU ose markës…"
              className="pl-10"
              aria-label="Kërko produktet"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="sm:w-56" aria-label="Kategoria">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Të gjitha kategoritë</SelectItem>
              <SelectItem value="none">Pa kategori</SelectItem>
              {roots.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
            <SelectTrigger className="sm:w-48" aria-label="Rendit">
              <ArrowDownUp className="size-4 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="newest">Më të rejat</SelectItem>
              <SelectItem value="title">Emri A–Z</SelectItem>
              <SelectItem value="price_desc">Çmimi më i lartë</SelectItem>
              <SelectItem value="stock_asc">Stoku më i ulët</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-3xl border bg-card">
        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-muted-foreground">Asnjë produkt nuk përputhet me filtrat.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground max-md:hidden">
              <tr>
                <th className="px-5 py-3 font-medium">Produkti</th>
                <th className="px-5 py-3 font-medium">Kategoria</th>
                <th className="px-5 py-3 text-right font-medium">Çmimi</th>
                <th className="px-5 py-3 text-right font-medium">Stoku</th>
                <th className="px-5 py-3 text-center font-medium">Aktiv</th>
                <th className="w-12 px-3 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.slice(0, limit).map((p) => {
                const price = unitPrice(p)
                return (
                  <tr key={p.id} className={cn("transition-colors hover:bg-muted/40", !p.is_active && "opacity-60")}>
                    <td className="px-4 py-3 md:px-5">
                      <Link href={`/admin/products/${p.id}/edit`} className="flex items-center gap-3">
                        <Thumb src={p.images?.[0]} />
                        <span className="min-w-0">
                          <span className="line-clamp-1 font-medium hover:text-primary">{p.title}</span>
                          <span className="flex flex-wrap gap-x-2 text-xs text-muted-foreground">
                            {p.sku && <span className="font-mono">{p.sku}</span>}
                            {p.is_featured && <span className="text-primary">I veçuar</span>}
                            <span className="md:hidden">
                              {formatPrice(price)} · {p.stock} copë
                            </span>
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground max-md:hidden">
                      {(p.category_id && catName.get(p.category_id)) || p.category || "—"}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums max-md:hidden">
                      <span className={price < p.price ? "font-medium text-primary" : ""}>{formatPrice(price)}</span>
                      {price < p.price && <span className="block text-xs text-muted-foreground line-through">{formatPrice(p.price)}</span>}
                    </td>
                    <td className="px-5 py-3 text-right max-md:hidden">
                      <span
                        className={cn(
                          "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium tabular-nums",
                          p.stock === 0
                            ? "bg-destructive/10 text-destructive"
                            : p.stock <= SHOP.lowStockThreshold
                              ? "bg-warning-soft text-warning-strong"
                              : "bg-muted",
                        )}
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center max-md:hidden">
                      <Switch
                        checked={p.is_active}
                        onCheckedChange={(v) => patch(p, { is_active: v })}
                        aria-label={`${p.title} aktiv`}
                      />
                    </td>
                    <td className="px-3 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                          aria-label="Veprime"
                        >
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/products/${p.id}/edit`}>
                              <Pencil /> Ndrysho
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a href={`/products/${p.slug || p.id}`} target="_blank" rel="noopener noreferrer">
                              <ExternalLink /> Shiko në dyqan
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => patch(p, { is_active: !p.is_active })} className="md:hidden">
                            {p.is_active ? "Çaktivizo" : "Aktivizo"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => patch(p, { is_featured: !p.is_featured })}>
                            {p.is_featured ? "Hiq nga ballina" : "Vendos në ballinë"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => navigator.clipboard.writeText(p.id).then(() => toast.success("ID u kopjua"))}
                          >
                            <Copy /> Kopjo ID
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive [&_svg]:text-destructive" onSelect={() => setToDelete(p)}>
                            <Trash2 /> Fshi
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
        {filtered.length > limit && (
          <div className="border-t p-3 text-center">
            <button
              type="button"
              onClick={() => setLimit((l) => l + PAGE)}
              className="rounded-full px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Shfaq më shumë ({filtered.length - limit})
            </button>
          </div>
        )}
      </div>

      <AlertDialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Të fshihet produkti?</AlertDialogTitle>
            <AlertDialogDescription>
              “{toDelete?.title}” do të hiqet përgjithmonë. Porositë ekzistuese nuk preken. Për ta fshehur përkohësisht,
              përdorni çelësin “Aktiv”.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulo</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => toDelete && remove(toDelete)}
            >
              Fshi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
