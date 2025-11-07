"use client"

import type React from "react"

import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import { useState, useEffect } from "react"

export function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("search") || "")

  useEffect(() => {
    setSearch(searchParams.get("search") || "")
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())

    if (search.trim()) {
      params.set("search", search.trim())
    } else {
      params.delete("search")
    }

    router.push(`/?${params.toString()}`)
  }

  const clearSearch = () => {
    setSearch("")
    const params = new URLSearchParams(searchParams.toString())
    params.delete("search")
    router.push(`/?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
      <div className="relative flex-1 group">
        <Search className="absolute left-4 sm:left-6 top-1/2 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
        <Input
          type="text"
          placeholder="Search by name, description, or style..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-11 sm:pl-14 pr-11 sm:pr-14 h-12 sm:h-14 text-base sm:text-lg shadow-xl border-2 border-border/30 focus:border-primary focus:ring-4 focus:ring-primary/10 bg-white/90 backdrop-blur-sm transition-all rounded-xl sm:rounded-2xl"
        />
        {search && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground active:text-foreground transition-colors rounded-full p-2 hover:bg-muted/50 active:bg-muted touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Clear search"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        )}
      </div>
      <Button 
        type="submit" 
        className="h-12 sm:h-14 px-6 sm:px-8 bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary active:from-accent active:to-primary shadow-2xl shadow-primary/30 hover:shadow-primary/40 transition-all rounded-xl sm:rounded-2xl font-bold text-base touch-manipulation min-h-[44px] sm:min-h-[56px] w-full sm:w-auto"
      >
        Search
      </Button>
    </form>
  )
}
