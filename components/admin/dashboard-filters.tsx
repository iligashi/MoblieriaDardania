"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, X, Filter } from "lucide-react"
import { useState } from "react"

interface DashboardFiltersProps {
  onSearchChange: (search: string) => void
  onCategoryChange: (category: string) => void
  onStockFilterChange: (filter: string) => void
  categories: string[]
}

export function DashboardFilters({
  onSearchChange,
  onCategoryChange,
  onStockFilterChange,
  categories,
}: DashboardFiltersProps) {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")

  const handleSearchChange = (value: string) => {
    setSearch(value)
    onSearchChange(value)
  }

  const handleCategoryChange = (value: string) => {
    setCategory(value)
    onCategoryChange(value)
  }

  const handleStockFilterChange = (value: string) => {
    setStockFilter(value)
    onStockFilterChange(value)
  }

  const clearFilters = () => {
    setSearch("")
    setCategory("all")
    setStockFilter("all")
    onSearchChange("")
    onCategoryChange("all")
    onStockFilterChange("all")
  }

  const hasActiveFilters = search !== "" || category !== "all" || stockFilter !== "all"

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <div className="relative flex-1 w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by title, category, or description..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {search && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => handleSearchChange("")}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <Select value={category} onValueChange={handleCategoryChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={stockFilter} onValueChange={handleStockFilterChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Stock Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Stock</SelectItem>
          <SelectItem value="in-stock">In Stock</SelectItem>
          <SelectItem value="low-stock">Low Stock (&lt;5)</SelectItem>
          <SelectItem value="out-of-stock">Out of Stock</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={clearFilters} className="w-full sm:w-auto">
          <X className="mr-2 h-4 w-4" />
          Clear Filters
        </Button>
      )}
    </div>
  )
}
