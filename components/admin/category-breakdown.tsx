"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Layers, Sofa, Bed, Table, Armchair, Package } from "lucide-react"
import type { Furniture } from "@/lib/types"

interface CategoryBreakdownProps {
  furniture: Furniture[]
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  sofa: Sofa,
  bed: Bed,
  table: Table,
  chair: Armchair,
  desk: Package,
  cabinet: Package,
  shelf: Package,
  other: Layers,
}

export function CategoryBreakdown({ furniture }: CategoryBreakdownProps) {
  // Count items by category
  const categoryCounts = furniture.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Sort by count (descending)
  const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])

  const totalItems = furniture.length

  if (sortedCategories.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Category Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No categories yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          Category Breakdown
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          {totalItems} {totalItems === 1 ? "item" : "items"} across {sortedCategories.length}{" "}
          {sortedCategories.length === 1 ? "category" : "categories"}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedCategories.map(([category, count]) => {
            const Icon = categoryIcons[category] || Layers
            const percentage = totalItems > 0 ? ((count / totalItems) * 100).toFixed(1) : 0

            return (
              <div
                key={category}
                className="relative p-4 rounded-xl border border-border bg-card hover:shadow-md transition-all duration-200 hover:border-primary/50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <Badge variant="secondary" className="font-bold">
                    {count}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground capitalize mb-1">{category}</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground font-medium min-w-[35px] text-right">
                      {percentage}%
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
