import { createClient } from "@/lib/supabase/server"
import { ProductCard } from "@/components/product-card"
import { ShopFilters } from "@/components/shop-filters"
import { Pagination } from "@/components/pagination"
import { EmptyState } from "@/components/empty-state"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dyqani",
}

const ITEMS_PER_PAGE = 16

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{
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
  }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const currentPage = Number(params.page) || 1

  let query = supabase
    .from("products")
    .select("*", { count: "exact" })
    .eq("is_active", true)

  // Apply filters
  if (params.search) {
    query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%,brand.ilike.%${params.search}%`)
  }
  if (params.category) {
    // Try matching by slug from categories table or legacy text field
    query = query.or(`category.eq.${params.category},category.ilike.${params.category}`)
  }
  if (params.minPrice) query = query.gte("price", Number(params.minPrice))
  if (params.maxPrice) query = query.lte("price", Number(params.maxPrice))
  if (params.color) query = query.eq("color", params.color)
  if (params.material) query = query.eq("material", params.material)
  if (params.brand) query = query.eq("brand", params.brand)
  if (params.on_sale === "true") query = query.not("discount_price", "is", null)
  if (params.new === "true") query = query.eq("is_new", true)
  if (params.bestseller === "true") query = query.eq("is_bestseller", true)
  if (params.in_stock === "true") query = query.gt("stock", 0)

  // Sorting
  const sort = params.sort || "newest"
  switch (sort) {
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

  // Pagination
  const from = (currentPage - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1
  query = query.range(from, to)

  const { data: products, count } = await query

  const totalItems = count || 0
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)

  // Fetch categories for filter sidebar
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order")

  // Fetch settings for colors/materials
  const { data: settings } = await supabase
    .from("settings")
    .select("*")

  const settingsMap: Record<string, string[]> = {}
  settings?.forEach((s) => {
    settingsMap[s.key] = s.value
  })

  const hasActiveFilters = !!(
    params.search || params.category || params.minPrice || params.maxPrice ||
    params.color || params.material || params.brand || params.on_sale ||
    params.new || params.bestseller || params.in_stock
  )

  return (
    <div className="bg-[#f8f9fa] min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {params.search
              ? `Rezultatet per "${params.search}"`
              : params.on_sale === "true"
                ? "Zbritje"
                : params.new === "true"
                  ? "Produkte te reja"
                  : params.category
                    ? params.category.charAt(0).toUpperCase() + params.category.slice(1)
                    : "Dyqani"}
          </h1>
          {totalItems > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              Po shfaqet {from + 1}-{Math.min(to + 1, totalItems)} nga {totalItems} produkte
            </p>
          )}
        </div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-6">
          {/* Sidebar Filters */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 bg-white rounded-xl border border-border/50 p-5">
              <ShopFilters
                categories={categories || []}
                colors={settingsMap.colors || []}
                materials={settingsMap.materials || []}
              />
            </div>
          </aside>

          {/* Products Grid */}
          <div>
            {/* Sort Bar */}
            <div className="flex items-center justify-between mb-4 bg-white rounded-lg border border-border/50 px-4 py-3">
              <span className="text-sm text-muted-foreground">
                {totalItems} produkte
              </span>
              <ShopSortSelect />
            </div>

            {products && products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={totalItems}
                      itemsPerPage={ITEMS_PER_PAGE}
                      basePath="/shop"
                    />
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                type={hasActiveFilters ? "filtered" : "no-items"}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ShopSortSelect() {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-muted-foreground hidden sm:inline">Rendit:</label>
      <SortSelectClient />
    </div>
  )
}

// Client component for the sort select
import { SortSelectClient } from "@/components/sort-select-client"
