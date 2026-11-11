"use client"

import { useEffect, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Check, SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { Category } from "@/lib/types"

interface FilterProps {
  categories: Category[]
  colors: string[]
  materials: string[]
}

const FILTER_KEYS = ["category", "search", "minPrice", "maxPrice", "color", "material", "brand", "on_sale", "new", "bestseller", "in_stock"]

function useFilterNav() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()

  const push = (mutate: (p: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString())
    mutate(params)
    params.delete("page")
    const qs = params.toString()
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false }))
  }

  const set = (key: string, value: string | null) =>
    push((p) => {
      if (value) p.set(key, value)
      else p.delete(key)
    })

  return { searchParams, push, set, pending }
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b py-5 first:pt-0 last:border-0">
      <h4 className="mb-3 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">{title}</h4>
      {children}
    </div>
  )
}

export function ShopFilters({ categories, colors, materials }: FilterProps) {
  const { searchParams, push, set } = useFilterNav()
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "")
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "")

  useEffect(() => {
    setMinPrice(searchParams.get("minPrice") ?? "")
    setMaxPrice(searchParams.get("maxPrice") ?? "")
  }, [searchParams])

  const activeCategory = searchParams.get("category") ?? ""
  const activeColor = searchParams.get("color") ?? ""
  const activeMaterial = searchParams.get("material") ?? ""
  const roots = categories.filter((c) => !c.parent_id)

  const applyPrice = (e: React.FormEvent) => {
    e.preventDefault()
    push((p) => {
      const min = Number(minPrice)
      const max = Number(maxPrice)
      if (minPrice && min >= 0) p.set("minPrice", String(min))
      else p.delete("minPrice")
      if (maxPrice && max > 0) p.set("maxPrice", String(max))
      else p.delete("maxPrice")
    })
  }

  const toggles: { key: string; label: string }[] = [
    { key: "in_stock", label: "Vetëm në stok" },
    { key: "on_sale", label: "Në zbritje" },
    { key: "new", label: "Të reja" },
  ]

  return (
    <div>
      {roots.length > 0 && (
        <FilterGroup title="Kategoria">
          <ul className="space-y-0.5">
            <li>
              <CategoryButton active={!activeCategory} onClick={() => set("category", null)}>
                Të gjitha
              </CategoryButton>
            </li>
            {roots.map((cat) => {
              const children = categories.filter((c) => c.parent_id === cat.id)
              const open = activeCategory === cat.slug || children.some((c) => c.slug === activeCategory)
              return (
                <li key={cat.id}>
                  <CategoryButton active={activeCategory === cat.slug} onClick={() => set("category", cat.slug)}>
                    {cat.name}
                  </CategoryButton>
                  {open && children.length > 0 && (
                    <ul className="mt-0.5 mb-1 ml-3 space-y-0.5 border-l pl-2">
                      {children.map((sub) => (
                        <li key={sub.id}>
                          <CategoryButton small active={activeCategory === sub.slug} onClick={() => set("category", sub.slug)}>
                            {sub.name}
                          </CategoryButton>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        </FilterGroup>
      )}

      <FilterGroup title="Çmimi (€)">
        <form onSubmit={applyPrice} className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="h-10"
              aria-label="Çmimi minimal"
            />
            <span className="text-muted-foreground">–</span>
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="h-10"
              aria-label="Çmimi maksimal"
            />
          </div>
          <Button type="submit" variant="outline" size="sm" className="w-full">
            Apliko
          </Button>
        </form>
      </FilterGroup>

      {colors.length > 0 && (
        <FilterGroup title="Ngjyra">
          <ChipList items={colors} active={activeColor} onPick={(v) => set("color", v === activeColor ? null : v)} />
        </FilterGroup>
      )}

      {materials.length > 0 && (
        <FilterGroup title="Materiali">
          <ChipList items={materials} active={activeMaterial} onPick={(v) => set("material", v === activeMaterial ? null : v)} />
        </FilterGroup>
      )}

      <FilterGroup title="Disponueshmëria">
        <div className="space-y-3.5">
          {toggles.map((t) => (
            <label key={t.key} className="flex cursor-pointer items-center justify-between gap-3 text-sm">
              {t.label}
              <Switch
                checked={searchParams.get(t.key) === "true"}
                onCheckedChange={(on) => set(t.key, on ? "true" : null)}
              />
            </label>
          ))}
        </div>
      </FilterGroup>
    </div>
  )
}

function CategoryButton({
  active,
  small,
  onClick,
  children,
}: {
  active: boolean
  small?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      className={cn(
        "flex w-full items-center justify-between rounded-lg px-2.5 text-left transition-colors",
        small ? "py-1.5 text-[13px]" : "py-2 text-sm",
        active ? "bg-ink font-medium text-ink-foreground" : "text-foreground/80 hover:bg-muted hover:text-foreground",
      )}
    >
      {children}
      {active && <Check className="size-3.5" />}
    </button>
  )
}

function ChipList({ items, active, onPick }: { items: string[]; active: string; onPick: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onPick(item)}
          aria-pressed={active === item}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs capitalize transition-colors",
            active === item ? "border-ink bg-ink text-ink-foreground" : "bg-card hover:border-foreground/30",
          )}
        >
          {item}
        </button>
      ))}
    </div>
  )
}

/** Toolbar above the grid: mobile filter trigger, active filter chips, sorting. */
export function ShopToolbar({ total, ...props }: FilterProps & { total: number }) {
  const { searchParams, push, set, pending } = useFilterNav()
  const [open, setOpen] = useState(false)

  const categoryName = (slug: string) => props.categories.find((c) => c.slug === slug)?.name ?? slug
  const chips: { key: string; label: string }[] = []
  for (const key of FILTER_KEYS) {
    const value = searchParams.get(key)
    if (!value) continue
    if (key === "category") chips.push({ key, label: categoryName(value) })
    else if (key === "search") chips.push({ key, label: `“${value}”` })
    else if (key === "minPrice") chips.push({ key, label: `Nga ${value} €` })
    else if (key === "maxPrice") chips.push({ key, label: `Deri ${value} €` })
    else if (key === "on_sale") chips.push({ key, label: "Në zbritje" })
    else if (key === "new") chips.push({ key, label: "Të reja" })
    else if (key === "bestseller") chips.push({ key, label: "Më të shiturat" })
    else if (key === "in_stock") chips.push({ key, label: "Në stok" })
    else chips.push({ key, label: value })
  }

  return (
    <div className={cn("space-y-4 transition-opacity", pending && "opacity-60")}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" className="lg:hidden" onClick={() => setOpen(true)}>
            <SlidersHorizontal /> Filtro
            {chips.length > 0 && (
              <span className="grid size-5 place-items-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {chips.length}
              </span>
            )}
          </Button>
          <p className="hidden text-sm text-muted-foreground sm:block">
            <span className="font-medium text-foreground tabular-nums">{total}</span> produkte
          </p>
        </div>
        <Select
          value={searchParams.get("sort") ?? "newest"}
          onValueChange={(v) => set("sort", v === "newest" ? null : v)}
        >
          <SelectTrigger className="w-[190px]" aria-label="Rendit sipas">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="newest">Më të rejat</SelectItem>
            <SelectItem value="price_asc">Çmimi: nga më i ulëti</SelectItem>
            <SelectItem value="price_desc">Çmimi: nga më i larti</SelectItem>
            <SelectItem value="name_asc">Emri: A–Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => set(chip.key, null)}
              className="inline-flex items-center gap-1.5 rounded-full bg-card py-1.5 pr-2.5 pl-3.5 text-xs font-medium capitalize ring-1 ring-border transition-colors hover:ring-foreground/30"
            >
              {chip.label}
              <X className="size-3.5 text-muted-foreground" />
            </button>
          ))}
          <button
            type="button"
            onClick={() => push((p) => FILTER_KEYS.forEach((k) => p.delete(k)))}
            className="px-2 text-xs font-medium text-primary hover:underline"
          >
            Pastro të gjitha
          </button>
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="gap-0 p-0">
          <SheetHeader className="border-b p-5">
            <SheetTitle>Filtrat</SheetTitle>
            <SheetDescription className="sr-only">Filtro produktet</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-5">
            <ShopFilters {...props} />
          </div>
          <SheetFooter className="border-t">
            <Button size="lg" className="w-full" onClick={() => setOpen(false)}>
              Shfaq {total} produkte
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
