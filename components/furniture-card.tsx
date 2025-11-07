"use client"

import { useState } from "react"
import type { Furniture } from "@/lib/types"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Eye } from "lucide-react"

interface FurnitureCardProps {
  furniture: Furniture
  featured?: boolean
}

export function FurnitureCard({ furniture, featured = false }: FurnitureCardProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  const imageUrl = furniture.images?.[0] || "/placeholder.svg"
  const placeholderUrl = "/placeholder.svg"

  if (featured) {
    return (
      <Link href={`/furniture/${furniture.id}`}>
        <div className="group relative h-full overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-card to-secondary/30 shadow-2xl border border-border/50 transition-all duration-500 hover:shadow-3xl hover:scale-[1.02]">
          <div className="relative aspect-[16/9] overflow-hidden">
            {imageLoading && (
              <div className="absolute inset-0 animate-pulse bg-muted" />
            )}
            <img
              src={imageError ? placeholderUrl : imageUrl}
              alt={furniture.title}
              className={cn(
                "h-full w-full object-cover transition-all duration-700",
                imageLoading ? "opacity-0" : "opacity-100",
                "group-hover:scale-110"
              )}
              onError={() => setImageError(true)}
              onLoad={() => setImageLoading(false)}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {furniture.stock === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                <Badge variant="destructive" className="shadow-2xl text-sm sm:text-lg px-4 sm:px-6 py-1.5 sm:py-2">
                  Out of Stock
                </Badge>
              </div>
            )}

            {/* Featured Badge */}
            <div className="absolute top-3 sm:top-4 md:top-6 left-3 sm:left-4 md:left-6">
              <Badge className="bg-primary/90 backdrop-blur-sm text-primary-foreground shadow-lg border-0 px-2 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-bold">
                FEATURED
              </Badge>
            </div>

            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 text-white">
              <div className="mb-2 sm:mb-3">
                <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-white/30 capitalize text-xs sm:text-sm mb-2 sm:mb-3">
                  {furniture.category}
                </Badge>
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black mb-2 sm:mb-3 leading-tight drop-shadow-2xl line-clamp-2">
                {furniture.title}
              </h3>
              <p className="text-sm sm:text-base md:text-lg text-white/90 mb-3 sm:mb-4 line-clamp-2 drop-shadow-lg">
                {furniture.description}
              </p>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-black mb-1 truncate">${furniture.price.toFixed(2)}</div>
                  {furniture.stock > 0 && (
                    <div className="text-xs sm:text-sm text-white/80 font-medium">
                      {furniture.stock} available
                    </div>
                  )}
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-all border border-white/30 shrink-0">
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/furniture/${furniture.id}`}>
      <div className="group h-full overflow-hidden rounded-xl sm:rounded-2xl bg-white shadow-lg border border-border/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-muted/50 to-muted/30">
          {imageLoading && (
            <div className="absolute inset-0 animate-pulse bg-muted" />
          )}
          <img
            src={imageError ? placeholderUrl : imageUrl}
            alt={furniture.title}
            className={cn(
              "h-full w-full object-cover transition-all duration-700",
              imageLoading ? "opacity-0" : "opacity-100",
              "group-hover:scale-110"
            )}
            onError={() => setImageError(true)}
            onLoad={() => setImageLoading(false)}
            loading="lazy"
          />
          
          {furniture.stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <Badge variant="destructive" className="shadow-xl text-xs sm:text-sm">Out of Stock</Badge>
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4">
              <div className="flex items-center gap-2 text-white">
                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm font-semibold">View Details</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 md:p-6">
          <div className="mb-2 sm:mb-3 flex items-start justify-between gap-2 sm:gap-3">
            <h3 className="text-base sm:text-lg md:text-xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2 flex-1 min-w-0">
              {furniture.title}
            </h3>
            <Badge variant="secondary" className="shrink-0 capitalize text-[10px] sm:text-xs">
              {furniture.category}
            </Badge>
          </div>
          
          <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
            {furniture.description}
          </p>

          <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-border/50">
            <div className="min-w-0 flex-1">
              <div className="text-xl sm:text-2xl font-black text-foreground mb-1 truncate">
                ${furniture.price.toFixed(2)}
              </div>
              {furniture.stock > 0 ? (
                <div className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                  {furniture.stock} in stock
                </div>
              ) : (
                <div className="text-[10px] sm:text-xs text-destructive font-medium">
                  Out of stock
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
