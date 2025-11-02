import { createClient } from "@/lib/supabase/server"
import { FurnitureGrid } from "@/components/furniture-grid"
import { FurnitureFilters } from "@/components/furniture-filters"
import { SearchBar } from "@/components/search-bar"
import Link from "next/link"

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
  }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Build query with filters
  let query = supabase.from("furniture").select("*")

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

  const { data: furniture, error } = await query.order("created_at", {
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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-6">
          <div>
            <h1 className="text-3xl font-bold">Furniture Store</h1>
            <p className="text-sm text-muted-foreground">Discover quality furniture for your home</p>
          </div>
          <Link href="/admin/login" className="text-sm text-muted-foreground hover:text-foreground">
            Admin
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="mb-2 text-2xl font-bold">Browse Furniture</h2>
          <p className="mb-4 text-muted-foreground">Filter and find the perfect pieces for your space</p>
          <SearchBar />
        </div>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside>
            <FurnitureFilters />
          </aside>

          <div>
            {filteredFurniture && filteredFurniture.length > 0 ? (
              <>
                <div className="mb-4 text-sm text-muted-foreground">
                  Showing {filteredFurniture.length} item
                  {filteredFurniture.length !== 1 ? "s" : ""}
                </div>
                <FurnitureGrid furniture={filteredFurniture} />
              </>
            ) : (
              <div className="rounded-lg border bg-card p-12 text-center">
                <p className="text-muted-foreground">No furniture items found. Try adjusting your filters.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-16 border-t bg-card">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Furniture Store. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
