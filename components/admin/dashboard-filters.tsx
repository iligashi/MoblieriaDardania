"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"
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

  const handleSearchChange = (value: string) => {
    setSearch(value)
    onSearchChange(value)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2.5">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Kerko produkte..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
        {search && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2"
            onClick={() => handleSearchChange("")}
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      <Select defaultValue="all" onValueChange={onCategoryChange}>
        <SelectTrigger className="w-full sm:w-[160px] h-9 text-sm">
          <SelectValue placeholder="Kategoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Te gjitha</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select defaultValue="all" onValueChange={onStockFilterChange}>
        <SelectTrigger className="w-full sm:w-[160px] h-9 text-sm">
          <SelectValue placeholder="Stoku" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Te gjitha</SelectItem>
          <SelectItem value="in-stock">Ne stok</SelectItem>
          <SelectItem value="low-stock">Stok i ulet (&lt;5)</SelectItem>
          <SelectItem value="out-of-stock">Pa stok</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
