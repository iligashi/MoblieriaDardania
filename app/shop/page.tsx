import type { Metadata } from "next"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { ProductCard, ProductGrid } from "@/components/product-card"
import { ShopFilters, ShopToolbar } from "@/components/shop-filters"
import { Pagination } from "@/components/pagination"
import { EmptyState } from "@/components/empty-state"
import { CategoryRail } from "@/components/category-rail"
import { CategoryVisual, catStyle, productCountLabel } from "@/components/category-card"
import { categoryFilter, categoryNameFor, getCategoryOverview } from "@/lib/catalog"
import { cn } from "@/lib/utils"
import { sanitizeSearch } from "@/lib/validation"
import type { Product } from "@/lib/types"

const PAGE_SIZE = 16

type ShopParams = {
  category?: string
  search?: string
  minPrice?: string
  maxPrice?: string
  color?: string
  material?: string
  brand?: string
  sort?: string
  page?: string
  on_sale?: string
  new?: string
  bestseller?: string
  in_stock?: string
}

function titleFor(params: ShopParams, categoryName: string | null) {
  if (params.search) return `Rezultatet për “${sanitizeSearch(params.search)}”`
  if (categoryName) return categoryName
  if (params.on_sale === "true") return "Zbritje"
  if (params.new === "true") return "Të rejat"
  if (params.bestseller === "true") return "Më të shiturat"
  return "Të gjitha produktet"
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<ShopParams> }): Promise<Metadata> {
  const params = await searchParams
  return {
    title: titleFor(params, null) === "Të gjitha produktet" ? "Dyqani" : titleFor(params, null),
    alternates: { canonical: "/shop" },
  }
}

const num = (v?: string) => {
  const n = Number(v)
  return v && Number.isFinite(n) && n >= 0 ? n : null
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<ShopParams> }) {
  const params = await searchParams
  const supabase = await createClient()
  const page = Math.max(1, Math.floor(Number(params.page)) || 1)

  const [{ categories, roots, productTotal }, settingsResult] = await Promise.all([
    getCategoryOverview(supabase),
    supabase.from("settings").select("key, value"),
  ])

  const settings: Record<string, string[]> = {}
  for (const row of settingsResult.data ?? []) {
    if (Array.isArray(row.value)) settings[row.key] = row.value as string[]
  }

  let query = supabase.from("products").select("*", { count: "exact" }).eq("is_active", true)

  const search = sanitizeSearch(params.search)
  if (search) {
    const term = `*${search}*`
    query = query.or(`title.ilike.${term},description.ilike.${term},brand.ilike.${term},sku.ilike.${term}`)
  }

  const cat = categoryFilter(params.category, categories)
  if (cat) query = query.or(cat.filter)

  const minPrice = num(params.minPrice)
  const maxPrice = num(params.maxPrice)
  if (minPrice != null) query = query.gte("price", minPrice)
  if (maxPrice != null) query = query.lte("price", maxPrice)
  if (params.color) query = query.eq("color", params.color.slice(0, 60))
  if (params.material) query = query.eq("material", params.material.slice(0, 60))
  if (params.brand) query = query.eq("brand", params.brand.slice(0, 60))
  if (params.on_sale === "true") query = query.not("discount_price", "is", null)
  if (params.new === "true") query = query.eq("is_new", true)
  if (params.bestseller === "true") query = query.eq("is_bestseller", true)
  if (params.in_stock === "true") query = query.gt("stock", 0)

  switch (params.sort) {
    case "price_asc":
      query = query.order("price", { ascending: true })
      break
    case "price_desc":
      query = query.order("price", { ascending: false })
      break
    case "name_asc":
      query = query.order("title", { ascending: true })
      break
    default:
      query = query.order("created_at", { ascending: false })
  }

  const from = (page - 1) * PAGE_SIZE
  const { data, count } = await query.range(from, from + PAGE_SIZE - 1)
  const products = (data as Product[]) ?? []
  const total = count ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  const summary = cat?.category
    ? (roots.find((r) => r.id === cat.category!.id) ??
      roots.flatMap((r) => r.children).find((c) => c.id === cat.category!.id) ??
      null)
    : null
  const parent = cat?.category?.parent_id ? categories.find((c) => c.id === cat.category!.parent_id) : null
  const title = titleFor(params, cat?.category?.name ?? null)
  const filterProps = { categories, colors: settings.colors ?? [], materials: settings.materials ?? [] }
  const hasFilters = Object.entries(params).some(([k, v]) => v && k !== "sort" && k !== "page")

  return (
    <div className="container-page pt-8 lg:pt-12">
      <header
        style={summary ? catStyle(summary.color) : undefined}
        className={cn(
          summary &&
            "relative overflow-hidden rounded-[2rem] bg-[color-mix(in_oklab,var(--cat)_10%,var(--card))] ring-1 ring-[color-mix(in_oklab,var(--cat)_20%,transparent)]",
        )}
      >
        <div className={cn("flex items-stretch gap-6", summary && "p-6 sm:p-10")}>
          <div className="min-w-0 flex-1 py-1">
            <nav aria-label="Navigimi" className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Link href="/" className="hover:text-foreground">
                Ballina
              </Link>
              <ChevronRight className="size-3" />
              <Link href="/shop" className="hover:text-foreground">
                Dyqani
              </Link>
              {parent && (
                <>
                  <ChevronRight className="size-3" />
                  <Link href={`/shop?category=${parent.slug}`} className="hover:text-foreground">
                    {parent.name}
                  </Link>
                </>
              )}
            </nav>
            <h1 className="mt-4 font-display text-5xl leading-none text-balance sm:text-6xl">{title}</h1>
            {cat?.category?.description && (
              <p className="mt-3 max-w-2xl text-muted-foreground">{cat.category.description}</p>
            )}
            <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              {summary && <span className="size-2 rounded-full bg-[var(--cat)]" />}
              {productCountLabel(total)}
            </p>
          </div>
          {summary && (summary.photo || summary.covers.length > 0) && (
            <CategoryVisual
              name={summary.name}
              photo={summary.photo}
              covers={summary.covers}
              className="hidden w-80 shrink-0 overflow-hidden rounded-3xl !p-0 md:grid lg:w-96 [&>div]:rounded-xl"
            />
          )}
        </div>
      </header>

      <div className="mt-6 border-b pb-6">
        <CategoryRail roots={roots} activeSlug={cat?.category ? cat.slug : null} params={params} allCount={productTotal} />
      </div>

      <div className="grid gap-10 pt-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-28 max-h-[calc(100dvh-8rem)] overflow-y-auto pr-2 scrollbar-none">
            <ShopFilters {...filterProps} />
          </div>
        </aside>

        <div className="min-w-0">
          <ShopToolbar total={total} {...filterProps} />

          {products.length > 0 ? (
            <>
              <ProductGrid className="mt-8 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((p, i) => (
                  <ProductCard key={p.id} product={p} category={categoryNameFor(p, categories)} priority={i < 4} />
                ))}
              </ProductGrid>
              <div className="mt-14 flex flex-col items-center gap-3">
                <Pagination currentPage={page} totalPages={totalPages} basePath="/shop" searchParams={params} />
                <p className="text-xs text-muted-foreground tabular-nums">
                  {from + 1}–{Math.min(from + PAGE_SIZE, total)} nga {total} produkte
                </p>
              </div>
            </>
          ) : (
            <EmptyState
              className="mt-8"
              {...(summary && summary.productCount === 0
                ? {
                    title: `Së shpejti në ${summary.name}`,
                    description: "Po e plotësojmë këtë kategori. Ndërkohë, shikoni produktet e tjera.",
                    action: { href: "/shop", label: "Shiko të gjitha produktet" },
                  }
                : hasFilters
                  ? {
                      title: "Asnjë produkt nuk përputhet",
                      description: "Provoni të hiqni disa filtra ose kërkoni me një fjalë tjetër.",
                      action: { href: "/shop", label: "Pastro filtrat" },
                    }
                  : {
                      title: "Së shpejti produkte të reja",
                      description: "Po përditësojmë katalogun. Kthehuni së shpejti!",
                      action: { href: "/", label: "Kthehu në ballinë" },
                    })}
            />
          )}
        </div>
      </div>
    </div>
  )
}
