"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface HeroSliderProps {
  images: string[]
  autoRotateInterval?: number
}

export function HeroSlider({ images, autoRotateInterval = 5000 }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    if (images.length <= 1) return

    const interval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length)
        setIsTransitioning(false)
      }, 300)
    }, autoRotateInterval)

    return () => clearInterval(interval)
  }, [images.length, autoRotateInterval])

  const goToSlide = (index: number) => {
    if (index === currentIndex) return
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex(index)
      setIsTransitioning(false)
    }, 300)
  }

  const goToPrevious = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
      setIsTransitioning(false)
    }, 300)
  }

  const goToNext = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
      setIsTransitioning(false)
    }, 300)
  }

  if (images.length === 0) return null

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Slides Container */}
      <div className="relative h-full w-full">
        {images.map((image, index) => (
          <div
            key={index}
            className={cn(
              "absolute inset-0 transition-opacity duration-700 ease-in-out",
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0",
              isTransitioning && index === currentIndex && "opacity-100"
            )}
          >
            <div className="relative h-full w-full">
              <img
                src={image}
                alt={`Hero slide ${index + 1}`}
                className="h-full w-full object-cover"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
              
              {/* Content Overlay */}
              <div className="absolute inset-0 z-20 flex items-center justify-center">
                <div className="text-center text-white px-4 sm:px-6">
                  <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-3 sm:mb-4 drop-shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    Flux Dekor
                  </h2>
                  <p className="text-base sm:text-xl md:text-2xl font-light drop-shadow-lg animate-in fade-in slide-in-from-bottom-6 duration-1200 delay-300 px-2">
                    Premium Furniture for Your Home
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 active:bg-black/60 text-white backdrop-blur-sm rounded-full h-10 w-10 sm:h-12 sm:w-12 transition-all hover:scale-110 touch-manipulation"
            onClick={goToPrevious}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 active:bg-black/60 text-white backdrop-blur-sm rounded-full h-10 w-10 sm:h-12 sm:w-12 transition-all hover:scale-110 touch-manipulation"
            onClick={goToNext}
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === currentIndex
                  ? "w-8 bg-white"
                  : "w-2 bg-white/50 hover:bg-white/75"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Scroll Indicator */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 animate-bounce">
        <div className="flex flex-col items-center gap-2 text-white/80">
          <span className="text-sm font-medium">Scroll to explore</span>
          <ChevronLeft className="h-5 w-5 rotate-90" />
        </div>
      </div>
    </div>
  )
}
