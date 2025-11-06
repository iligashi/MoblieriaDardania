"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export function ScrollHeader() {
  const [isScrolled, setIsScrolled] = useState(false)

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
        isScrolled
          ? "bg-white/40 backdrop-blur-xl shadow-lg border-b border-border/5"
          : "pointer-events-none"
      )}
    >
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "h-12 w-12 rounded-2xl flex items-center justify-center border transition-all duration-300 shadow-2xl",
                isScrolled
                  ? "bg-primary/10 backdrop-blur-sm border-primary/20"
                  : "bg-white/90 backdrop-blur-xl border-white/20"
              )}
            >
              <svg
                className={cn(
                  "h-6 w-6 transition-colors duration-300",
                  isScrolled ? "text-primary" : "text-primary"
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>
            <div>
              <h1
                className={cn(
                  "text-xl font-black tracking-tight transition-colors duration-300",
                  isScrolled
                    ? "text-foreground drop-shadow-none"
                    : "text-white drop-shadow-2xl"
                )}
              >
                MOBILERIA DARDANIA
              </h1>
              <p
                className={cn(
                  "text-xs font-medium transition-colors duration-300",
                  isScrolled
                    ? "text-muted-foreground"
                    : "text-white/80"
                )}
              >
                CURATED FURNITURE COLLECTION
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
