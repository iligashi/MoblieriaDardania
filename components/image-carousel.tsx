"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface ImageCarouselProps {
  images: string[]
  title: string
}

export function ImageCarousel({ images, title }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  const hasImages = images.length > 0
  const displayImages = hasImages ? images : ["/placeholder.svg?height=600&width=600"]

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1))
  }

  const goToImage = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <>
      <div className="space-y-4">
        {/* Main Image */}
        <div className="group relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-secondary/50 to-background p-1 shadow-xl">
          <div className="relative h-full w-full overflow-hidden rounded-xl bg-card">
            <img
              src={displayImages[currentIndex] || "/placeholder.svg"}
              alt={`${title} - Image ${currentIndex + 1}`}
              className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
            />

            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 sm:right-4 top-2 sm:top-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-lg touch-manipulation min-h-[44px] min-w-[44px] z-30 border border-border/50"
              onClick={() => setIsLightboxOpen(true)}
              aria-label="Zoom image"
            >
              <ZoomIn className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>

            {/* Navigation Arrows */}
            {displayImages.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm shadow-lg hover:bg-primary hover:text-primary-foreground active:bg-primary active:text-primary-foreground transition-all touch-manipulation min-h-[44px] min-w-[44px] z-20"
                  onClick={goToPrevious}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm shadow-lg hover:bg-primary hover:text-primary-foreground active:bg-primary active:text-primary-foreground transition-all touch-manipulation min-h-[44px] min-w-[44px] z-20"
                  onClick={goToNext}
                  aria-label="Next image"
                >
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </>
            )}

            {/* Image Counter */}
            {displayImages.length > 1 && (
              <div className="absolute bottom-4 right-4 rounded-full bg-primary/90 px-4 py-2 text-sm font-medium text-primary-foreground backdrop-blur-sm shadow-lg">
                {currentIndex + 1} / {displayImages.length}
              </div>
            )}
          </div>
        </div>

        {/* Thumbnail Navigation */}
        {displayImages.length > 1 && (
          <div className="grid grid-cols-4 gap-2 sm:gap-3 sm:grid-cols-5 lg:grid-cols-4">
            {displayImages.map((image, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-lg sm:rounded-xl border-2 transition-all hover:scale-105 active:scale-105 touch-manipulation min-h-[44px]",
                  currentIndex === index
                    ? "border-primary shadow-lg shadow-primary/20 ring-2 ring-primary/20"
                    : "border-border hover:border-primary/50 active:border-primary/50",
                )}
              >
                <img
                  src={image || "/placeholder.svg"}
                  alt={`${title} - Thumbnail ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-0">
          <div className="relative h-[95vh] w-full">
            <img
              src={displayImages[currentIndex] || "/placeholder.svg"}
              alt={`${title} - Image ${currentIndex + 1}`}
              className="h-full w-full object-contain"
            />

            {/* Close Button */}
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-4 top-4 bg-background/90 backdrop-blur-sm shadow-lg"
              onClick={() => setIsLightboxOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Navigation in Lightbox */}
            {displayImages.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm shadow-lg"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm shadow-lg"
                  onClick={goToNext}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>

                {/* Counter in Lightbox */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-background/90 px-4 py-2 text-sm font-medium backdrop-blur-sm shadow-lg">
                  {currentIndex + 1} / {displayImages.length}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
