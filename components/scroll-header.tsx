"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search as SearchIcon } from "lucide-react"
import { SearchBar } from "@/components/search-bar"

export function ScrollHeader() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "bg-white/70 backdrop-blur-xl shadow-lg border-b border-border/5" : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <div
              className={cn(
                "h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl flex items-center justify-center border transition-all duration-300 shadow-2xl touch-manipulation overflow-hidden",
                isScrolled
                  ? "bg-primary/10 backdrop-blur-sm border-primary/20"
                  : "bg-white/90 backdrop-blur-xl border-white/20"
              )}
            >
              <Image
                src="/flux-removebg-preview.png"
                alt="Flux Dekor logo"
                width={48}
                height={48}
                priority
                className="h-full w-full object-contain p-1"
              />
            </div>
            <div>
              <h1
                className={cn(
                  "text-base sm:text-lg md:text-xl font-black tracking-tight transition-colors duration-300",
                  isScrolled
                    ? "text-foreground drop-shadow-none"
                    : "text-white drop-shadow-2xl"
                )}
              >
                FLUX
              </h1>
              <p
                className={cn(
                  "text-[10px] sm:text-xs font-medium transition-colors duration-300 hidden sm:block",
                  isScrolled
                    ? "text-muted-foreground"
                    : "text-white/80"
                )}
              >
                CURATED FURNITURE COLLECTION
              </p>
            </div>
          </div>

          <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-10 w-10 sm:h-11 sm:w-11 rounded-full border transition-all duration-300",
                  isScrolled
                    ? "border-border bg-white/80 hover:bg-white"
                    : "border-white/30 bg-white/20 hover:bg-white/30 backdrop-blur"
                )}
                aria-label="Search furniture"
              >
                <SearchIcon
                  className={cn(
                    "h-4 w-4 sm:h-5 sm:w-5 transition-colors",
                    isScrolled ? "text-foreground" : "text-white"
                  )}
                />
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[min(92vw,36rem)] sm:max-w-2xl border border-border/40 bg-background/95 backdrop-blur-xl p-0 overflow-hidden">
              <div className="flex flex-col gap-4 p-5 sm:p-6">
                <DialogHeader className="space-y-1 text-left">
                  <DialogTitle className="text-xl sm:text-2xl font-semibold text-foreground">
                    Search the collection
                  </DialogTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Find furniture by name, description, material, or style.
                  </p>
                </DialogHeader>
                <SearchBar onSubmitSuccess={() => setIsSearchOpen(false)} />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  )
}
