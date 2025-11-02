import type { Furniture } from "@/lib/types"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface FurnitureCardProps {
  furniture: Furniture
}

export function FurnitureCard({ furniture }: FurnitureCardProps) {
  return (
    <Link href={`/furniture/${furniture.id}`}>
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
        <CardHeader className="p-0">
          <div className="relative aspect-square overflow-hidden bg-muted">
            <img
              src={furniture.images[0] || "/placeholder.svg?height=400&width=400"}
              alt={furniture.title}
              className="h-full w-full object-cover transition-transform hover:scale-105"
            />
            {furniture.stock === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Badge variant="destructive">Out of Stock</Badge>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 font-semibold leading-tight">{furniture.title}</h3>
            <Badge variant="secondary" className="shrink-0 capitalize">
              {furniture.category}
            </Badge>
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">{furniture.description}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <div className="flex w-full items-center justify-between">
            <span className="text-2xl font-bold">${furniture.price.toFixed(2)}</span>
            <div className="text-sm text-muted-foreground">
              {furniture.stock > 0 ? (
                <span>{furniture.stock} in stock</span>
              ) : (
                <span className="text-destructive">Out of stock</span>
              )}
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
