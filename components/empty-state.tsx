"use client"

import { Search, FilterX, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter, useSearchParams } from "next/navigation"

interface EmptyStateProps {
  type?: "no-results" | "no-items" | "filtered"
}

export function EmptyState({ type = "no-results" }: EmptyStateProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleClearFilters = () => {
    const currentSearch = searchParams.get("search")
    if (currentSearch) {
      router.push(`/?search=${currentSearch}`)
    } else {
      router.push("/")
    }
  }

  if (type === "no-items") {
    return (
      <Card className="border-dashed border-2 shadow-lg bg-gradient-to-br from-card to-secondary/20">
        <CardContent className="flex flex-col items-center justify-center p-16 text-center">
          <div className="rounded-full bg-gradient-to-br from-primary/10 to-accent/10 p-6 mb-6">
            <Package className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            No furniture available
          </h3>
          <p className="text-muted-foreground max-w-md text-base">
            We're currently updating our inventory. Check back soon for new arrivals!
          </p>
        </CardContent>
      </Card>
    )
  }

  if (type === "filtered") {
    return (
      <Card className="border-dashed border-2 shadow-lg bg-gradient-to-br from-card to-secondary/20">
        <CardContent className="flex flex-col items-center justify-center p-16 text-center">
          <div className="rounded-full bg-gradient-to-br from-primary/10 to-accent/10 p-6 mb-6">
            <FilterX className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            No items match your filters
          </h3>
          <p className="text-muted-foreground max-w-md mb-6 text-base">
            Try adjusting your search criteria or clear all filters to see more results.
          </p>
          <Button 
            onClick={handleClearFilters} 
            className="bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
          >
            <FilterX className="mr-2 h-4 w-4" />
            Clear All Filters
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-dashed border-2 shadow-lg bg-gradient-to-br from-card to-secondary/20">
      <CardContent className="flex flex-col items-center justify-center p-16 text-center">
        <div className="rounded-full bg-gradient-to-br from-primary/10 to-accent/10 p-6 mb-6">
          <Search className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
          No furniture found
        </h3>
        <p className="text-muted-foreground max-w-md text-base">
          We couldn't find any furniture matching your search. Try different keywords or browse all items.
        </p>
      </CardContent>
    </Card>
  )
}

