"use client"

import { useRouter, useSearchParams } from "next/navigation"

export function SortSelectClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get("sort") || "newest"

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "newest") {
      params.delete("sort")
    } else {
      params.set("sort", value)
    }
    params.delete("page")
    router.push(`/shop?${params.toString()}`)
  }

  return (
    <select
      value={currentSort}
      onChange={(e) => handleSort(e.target.value)}
      className="h-9 px-3 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
    >
      <option value="newest">Me te rejat</option>
      <option value="price_asc">Cmimi: ulet - lart</option>
      <option value="price_desc">Cmimi: lart - ulet</option>
      <option value="name_asc">Emri: A-Z</option>
    </select>
  )
}
