"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { ArrowUpRight, Loader2, Search, X } from "lucide-react"
import { formatPrice, unitPrice } from "@/lib/shop-config"
import { imageFit } from "@/lib/media"
import type { Category, Product } from "@/lib/types"

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: Category[]
}

export function SearchDialog({ open, onOpenChange, categories }: SearchDialogProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) {
      setQuery("")
      setResults([])
      setTotal(0)
    }
  }, [open])

  // Debounced live search.
  useEffect(() => {
    const term = query.trim()
    if (term.length < 2) {
      setResults([])
      setTotal(0)
      setLoading(false)
      return
    }
    setLoading(true)
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(term)}&limit=6`, { signal: controller.signal })
        const data = await res.json()
        setResults(Array.isArray(data?.data) ? data.data : [])
        setTotal(Number(data?.total) || 0)
      } catch {
        /* aborted or offline */
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 220)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const term = query.trim()
    if (!term) return
    onOpenChange(false)
    router.push(`/shop?search=${encodeURIComponent(term)}`)
  }

  const close = () => onOpenChange(false)

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          onOpenAutoFocus={(e) => {
            e.preventDefault()
            inputRef.current?.focus()
          }}
          className="fixed inset-0 z-50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-4 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-4 sm:inset-auto sm:top-[12vh] sm:left-1/2 sm:w-full sm:max-w-2xl sm:-translate-x-1/2 sm:p-3"
        >
          <DialogPrimitive.Title className="sr-only">Kërko produkte</DialogPrimitive.Title>
          <div className="flex h-full flex-col overflow-hidden bg-popover sm:h-auto sm:rounded-2xl sm:border sm:shadow-[var(--shadow-lift)]">
            <form onSubmit={submit} className="flex shrink-0 items-center gap-3 border-b px-4 sm:px-5">
              {loading ? (
                <Loader2 className="size-5 shrink-0 animate-spin text-muted-foreground" />
              ) : (
                <Search className="size-5 shrink-0 text-muted-foreground" />
              )}
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Kërko mobilje, dekor, vegla…"
                className="h-16 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/70"
                aria-label="Kërko produkte"
                autoComplete="off"
                enterKeyHint="search"
              />
              <button
                type="button"
                onClick={close}
                className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label="Mbyll kërkimin"
              >
                <X className="size-4" />
              </button>
            </form>

            <div className="flex-1 overflow-y-auto p-3 sm:max-h-[60vh] sm:flex-none">
              {query.trim().length < 2 ? (
                <div className="p-3">
                  <p className="eyebrow mb-3">Kategori të njohura</p>
                  <div className="flex flex-wrap gap-2">
                    {(categories.length ? categories : []).slice(0, 10).map((c) => (
                      <Link
                        key={c.id}
                        href={`/shop?category=${c.slug}`}
                        onClick={close}
                        className="rounded-full border bg-card px-3.5 py-1.5 text-sm transition-colors hover:border-foreground/30 hover:bg-accent"
                      >
                        {c.name}
                      </Link>
                    ))}
                    <Link
                      href="/shop?on_sale=true"
                      onClick={close}
                      className="rounded-full bg-sale/10 px-3.5 py-1.5 text-sm font-semibold text-sale hover:bg-sale/15"
                    >
                      Zbritje
                    </Link>
                  </div>
                </div>
              ) : results.length === 0 && !loading ? (
                <div className="px-3 py-10 text-center">
                  <p className="font-medium">Asnjë rezultat për “{query.trim()}”</p>
                  <p className="mt-1 text-sm text-muted-foreground">Provoni një fjalë tjetër ose shfletoni kategoritë.</p>
                </div>
              ) : (
                <ul className="grid gap-1">
                  {results.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/products/${p.slug || p.id}`}
                        onClick={close}
                        className="flex items-center gap-4 rounded-xl p-2 transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
                      >
                        <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-sand/60">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.images?.[0] || "/placeholder.svg"}
                            alt=""
                            data-fit={imageFit(p.images?.[0])}
                            className="product-shot !p-1"
                            loading="lazy"
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">{p.title}</span>
                          <span className="block text-xs text-muted-foreground capitalize">{p.brand || p.category}</span>
                        </span>
                        <span className="text-sm font-semibold tabular-nums">{formatPrice(unitPrice(p))}</span>
                      </Link>
                    </li>
                  ))}
                  {total > results.length && (
                    <li>
                      <button
                        type="button"
                        onClick={submit}
                        className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl p-3 text-sm font-semibold hover:bg-accent"
                      >
                        Shiko të gjitha {total} rezultatet <ArrowUpRight className="size-4" />
                      </button>
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
