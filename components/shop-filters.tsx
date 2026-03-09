"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"
import type { Category } from "@/lib/types"

interface ShopFiltersProps {
  categories: Category[]
  colors: string[]
  materials: string[]
}

export function ShopFilters({ categories, colors, materials }: ShopFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "")
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "")

  const activeCategory = searchParams.get("category") || ""
  const activeColor = searchParams.get("color") || ""
  const activeMaterial = searchParams.get("material") || ""
  const inStock = searchParams.get("in_stock") === "true"

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete("page")
    router.push(`/shop?${params.toString()}`)
  }

  const applyPriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (minPrice) params.set("minPrice", minPrice)
    else params.delete("minPrice")
    if (maxPrice) params.set("maxPrice", maxPrice)
    else params.delete("maxPrice")
    params.delete("page")
    router.push(`/shop?${params.toString()}`)
  }

  const clearAll = () => {
    setMinPrice("")
    setMaxPrice("")
    router.push("/shop")
  }

  const hasFilters = !!(activeCategory || activeColor || activeMaterial || minPrice || maxPrice || inStock)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Filtro</h3>
        {hasFilters && (
          <button onClick={clearAll} className="text-xs font-medium text-destructive hover:underline flex items-center gap-1">
            <X className="h-3 w-3" /> Pastro
          </button>
        )}
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Kategori</h4>
          <div className="space-y-0.5">
            <button
              onClick={() => updateFilter("category", "")}
              className={`w-full text-left px-2.5 py-2 rounded-lg text-sm transition-colors ${
                !activeCategory ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50 text-foreground"
              }`}
            >
              Te gjitha
            </button>
            {categories.filter(c => !c.parent_id).map((cat) => (
              <div key={cat.id}>
                <button
                  onClick={() => updateFilter("category", cat.slug)}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-sm transition-colors ${
                    activeCategory === cat.slug ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50 text-foreground"
                  }`}
                >
                  {cat.name}
                </button>
                {categories
                  .filter((c) => c.parent_id === cat.id)
                  .map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => updateFilter("category", sub.slug)}
                      className={`w-full text-left pl-6 pr-2.5 py-1.5 rounded-lg text-sm transition-colors ${
                        activeCategory === sub.slug ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50 text-muted-foreground"
                      }`}
                    >
                      {sub.name}
                    </button>
                  ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Cmimi (EUR)</h4>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="h-9 text-sm"
            min="0"
          />
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="h-9 text-sm"
            min="0"
          />
        </div>
        <Button size="sm" variant="outline" onClick={applyPriceFilter} className="w-full mt-2 h-8 text-xs">
          Apliko cmimin
        </Button>
      </div>

      {/* Colors */}
      {colors.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Ngjyra</h4>
          <div className="flex flex-wrap gap-1.5">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => updateFilter("color", activeColor === color ? "" : color)}
                className={`px-2.5 py-1.5 text-xs rounded-lg border transition-colors capitalize ${
                  activeColor === color
                    ? "bg-primary text-white border-primary"
                    : "bg-white border-border hover:border-primary/50"
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Materials */}
      {materials.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Materiali</h4>
          <div className="flex flex-wrap gap-1.5">
            {materials.map((mat) => (
              <button
                key={mat}
                onClick={() => updateFilter("material", activeMaterial === mat ? "" : mat)}
                className={`px-2.5 py-1.5 text-xs rounded-lg border transition-colors capitalize ${
                  activeMaterial === mat
                    ? "bg-primary text-white border-primary"
                    : "bg-white border-border hover:border-primary/50"
                }`}
              >
                {mat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* In Stock */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={inStock}
          onChange={(e) => updateFilter("in_stock", e.target.checked ? "true" : "")}
          className="h-4 w-4 accent-primary rounded"
        />
        <span className="text-sm">Vetem ne stok</span>
      </label>
    </div>
  )
}
