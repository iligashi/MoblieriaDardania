import { createClient } from "@/lib/supabase/server"
import { FurnitureGrid } from "@/components/furniture-grid"
import { FurnitureFilters } from "@/components/furniture-filters"
import { SearchBar } from "@/components/search-bar"
import { HeroSlider } from "@/components/hero-slider"
import { EmptyState } from "@/components/empty-state"
import { Pagination } from "@/components/pagination"
import { ScrollHeader } from "@/components/scroll-header"
import { Suspense } from "react"
import { FurnitureGridSkeleton } from "@/components/furniture-grid-skeleton"

const ITEMS_PER_PAGE = 12

// Hero slider images - you can replace these with your actual brand images
const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=1920&q=80",
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1920&q=80",
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&q=80",
]

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string
    minPrice?: string
    maxPrice?: string
    color?: string
    material?: string
    search?: string
    minLength?: string
    maxLength?: string
    minWidth?: string
    maxWidth?: string
    minHeight?: string
    maxHeight?: string
    page?: string
  }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const currentPage = Number(params.page) || 1

  // Build query with filters
  let query = supabase.from("furniture").select("*", { count: "exact" })

  if (params.search) {
    query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`)
  }

  if (params.category) {
    query = query.eq("category", params.category)
  }

  if (params.minPrice) {
    query = query.gte("price", Number(params.minPrice))
  }

  if (params.maxPrice) {
    query = query.lte("price", Number(params.maxPrice))
  }

  if (params.color) {
    query = query.eq("color", params.color)
  }

  if (params.material) {
    query = query.eq("material", params.material)
  }

  const { data: furniture, error, count } = await query.order("created_at", {
    ascending: false,
  })

  if (error) {
    console.error("[v0] Error fetching furniture:", error)
  }

  let filteredFurniture = furniture || []

  if (params.minLength) {
    filteredFurniture = filteredFurniture.filter((item) => item.dimensions.length >= Number(params.minLength))
  }

  if (params.maxLength) {
    filteredFurniture = filteredFurniture.filter((item) => item.dimensions.length <= Number(params.maxLength))
  }

  if (params.minWidth) {
    filteredFurniture = filteredFurniture.filter((item) => item.dimensions.width >= Number(params.minWidth))
  }

  if (params.maxWidth) {
    filteredFurniture = filteredFurniture.filter((item) => item.dimensions.width <= Number(params.maxWidth))
  }

  if (params.minHeight) {
    filteredFurniture = filteredFurniture.filter((item) => item.dimensions.height >= Number(params.minHeight))
  }

  if (params.maxHeight) {
    filteredFurniture = filteredFurniture.filter((item) => item.dimensions.height <= Number(params.maxHeight))
  }

  // Pagination
  const totalItems = filteredFurniture.length
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedFurniture = filteredFurniture.slice(startIndex, endIndex)

  const hasActiveFilters = !!(
    params.search ||
    params.category ||
    params.minPrice ||
    params.maxPrice ||
    params.color ||
    params.material ||
    params.minLength ||
    params.maxLength ||
    params.minWidth ||
    params.maxWidth ||
    params.minHeight ||
    params.maxHeight
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Slider - Full Immersive */}
      <HeroSlider images={HERO_IMAGES} autoRotateInterval={5000} />

      {/* Scroll-Aware Header */}
      <ScrollHeader />

      {/* Main Content - Editorial Style */}
      <main className="relative -mt-20">
        {/* Floating Search Section */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto -mt-32 relative z-10">
            <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8">
              <div className="mb-6 text-center">
                <h2 className="text-5xl font-black tracking-tight mb-3 text-foreground">
                  Discover Your Style
                </h2>
                <p className="text-lg text-muted-foreground font-light">
                  Explore our curated collection of premium furniture pieces
                </p>
              </div>
              <SearchBar />
            </div>
          </div>
        </section>

        {/* Content Grid - Editorial Layout */}
        <section className="container mx-auto px-6 pb-20">
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Filters Sidebar - Compact */}
            <aside className="lg:col-span-3 lg:sticky lg:top-8 lg:self-start">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                <FurnitureFilters />
              </div>
            </aside>

            {/* Products Grid - Editorial */}
            <div className="lg:col-span-9">
              {filteredFurniture && filteredFurniture.length > 0 ? (
                <>
                  {/* Results Header */}
                  <div className="mb-8 flex items-center justify-between border-b border-border/50 pb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-foreground mb-1">
                        {totalItems} {totalItems === 1 ? "Piece" : "Pieces"} Available
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems}
                      </p>
                    </div>
                  </div>

                  {/* Products Grid */}
                  <Suspense fallback={<FurnitureGridSkeleton />}>
                    <FurnitureGrid furniture={paginatedFurniture} />
                  </Suspense>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-12">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        itemsPerPage={ITEMS_PER_PAGE}
                      />
                    </div>
                  )}
                </>
              ) : (
                <EmptyState
                  type={
                    hasActiveFilters
                      ? "filtered"
                      : furniture && furniture.length === 0
                        ? "no-items"
                        : "no-results"
                  }
                />
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Minimalist Footer */}
      <footer className="border-t border-border/50 bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary to-transparent" />
            <p className="text-sm text-muted-foreground font-light tracking-wide">
              © 2025 MOBILERIA DARDANIA
            </p>
            <p className="text-xs text-muted-foreground/60 uppercase tracking-widest">
              Premium Furniture Collection
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
