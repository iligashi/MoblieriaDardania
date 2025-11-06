"use client"

import { useState } from "react"
import { FurnitureList } from "@/components/admin/furniture-list"
import { DashboardFilters } from "@/components/admin/dashboard-filters"
import type { Furniture } from "@/lib/types"

interface DashboardClientProps {
  furniture: Furniture[]
  categories: string[]
}

export function DashboardClient({ furniture, categories }: DashboardClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")

  return (
    <div className="space-y-6">
      <DashboardFilters
        onSearchChange={setSearchQuery}
        onCategoryChange={setCategoryFilter}
        onStockFilterChange={setStockFilter}
        categories={categories}
      />
      <FurnitureList
        furniture={furniture}
        searchQuery={searchQuery}
        categoryFilter={categoryFilter}
        stockFilter={stockFilter}
      />
    </div>
  )
}
