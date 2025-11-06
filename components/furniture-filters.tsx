"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useState, useEffect, useMemo } from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const CATEGORIES = [
  { value: "sofa", label: "Sofa" },
  { value: "chair", label: "Chair" },
  { value: "table", label: "Table" },
  { value: "bed", label: "Bed" },
  { value: "desk", label: "Desk" },
  { value: "cabinet", label: "Cabinet" },
  { value: "shelf", label: "Shelf" },
  { value: "other", label: "Other" },
]

const MATERIALS = [
  { value: "wood", label: "Wood" },
  { value: "metal", label: "Metal" },
  { value: "plastic", label: "Plastic" },
  { value: "glass", label: "Glass" },
  { value: "fabric", label: "Fabric" },
  { value: "leather", label: "Leather" },
  { value: "mixed", label: "Mixed" },
]

const COLORS = [
  { value: "white", label: "White" },
  { value: "black", label: "Black" },
  { value: "brown", label: "Brown" },
  { value: "gray", label: "Gray" },
  { value: "beige", label: "Beige" },
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "red", label: "Red" },
  { value: "other", label: "Other" },
]

export function FurnitureFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [category, setCategory] = useState(searchParams.get("category") || "all")
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "")
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "")
  const [color, setColor] = useState(searchParams.get("color") || "all")
  const [material, setMaterial] = useState(searchParams.get("material") || "all")

  const [minLength, setMinLength] = useState(searchParams.get("minLength") || "")
  const [maxLength, setMaxLength] = useState(searchParams.get("maxLength") || "")
  const [minWidth, setMinWidth] = useState(searchParams.get("minWidth") || "")
  const [maxWidth, setMaxWidth] = useState(searchParams.get("maxWidth") || "")
  const [minHeight, setMinHeight] = useState(searchParams.get("minHeight") || "")
  const [maxHeight, setMaxHeight] = useState(searchParams.get("maxHeight") || "")

  useEffect(() => {
    setCategory(searchParams.get("category") || "all")
    setMinPrice(searchParams.get("minPrice") || "")
    setMaxPrice(searchParams.get("maxPrice") || "")
    setColor(searchParams.get("color") || "all")
    setMaterial(searchParams.get("material") || "all")
    setMinLength(searchParams.get("minLength") || "")
    setMaxLength(searchParams.get("maxLength") || "")
    setMinWidth(searchParams.get("minWidth") || "")
    setMaxWidth(searchParams.get("maxWidth") || "")
    setMinHeight(searchParams.get("minHeight") || "")
    setMaxHeight(searchParams.get("maxHeight") || "")
  }, [searchParams])

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())

    // Keep search if it exists
    const currentSearch = searchParams.get("search")
    if (currentSearch) {
      params.set("search", currentSearch)
    }

    if (category !== "all") params.set("category", category)
    else params.delete("category")

    if (minPrice) params.set("minPrice", minPrice)
    else params.delete("minPrice")

    if (maxPrice) params.set("maxPrice", maxPrice)
    else params.delete("maxPrice")

    if (color !== "all") params.set("color", color)
    else params.delete("color")

    if (material !== "all") params.set("material", material)
    else params.delete("material")

    if (minLength) params.set("minLength", minLength)
    else params.delete("minLength")

    if (maxLength) params.set("maxLength", maxLength)
    else params.delete("maxLength")

    if (minWidth) params.set("minWidth", minWidth)
    else params.delete("minWidth")

    if (maxWidth) params.set("maxWidth", maxWidth)
    else params.delete("maxWidth")

    if (minHeight) params.set("minHeight", minHeight)
    else params.delete("minHeight")

    if (maxHeight) params.set("maxHeight", maxHeight)
    else params.delete("maxHeight")

    router.push(`/?${params.toString()}`)
  }

  const clearFilters = () => {
    setCategory("all")
    setMinPrice("")
    setMaxPrice("")
    setColor("all")
    setMaterial("all")
    setMinLength("")
    setMaxLength("")
    setMinWidth("")
    setMaxWidth("")
    setMinHeight("")
    setMaxHeight("")

    // Keep search if it exists
    const currentSearch = searchParams.get("search")
    if (currentSearch) {
      router.push(`/?search=${currentSearch}`)
    } else {
      router.push("/")
    }
  }

  const hasActiveFilters =
    category !== "all" ||
    minPrice !== "" ||
    maxPrice !== "" ||
    color !== "all" ||
    material !== "all" ||
    minLength !== "" ||
    maxLength !== "" ||
    minWidth !== "" ||
    maxWidth !== "" ||
    minHeight !== "" ||
    maxHeight !== ""

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (category !== "all") count++
    if (minPrice !== "") count++
    if (maxPrice !== "") count++
    if (color !== "all") count++
    if (material !== "all") count++
    if (minLength !== "") count++
    if (maxLength !== "") count++
    if (minWidth !== "") count++
    if (maxWidth !== "") count++
    if (minHeight !== "") count++
    if (maxHeight !== "") count++
    return count
  }, [category, minPrice, maxPrice, color, material, minLength, maxLength, minWidth, maxWidth, minHeight, maxHeight])

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader className="pb-4 border-b border-border/30 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-bold tracking-tight">Filters</CardTitle>
            {activeFilterCount > 0 && (
              <Badge className="h-6 min-w-6 flex items-center justify-center px-2 text-xs bg-primary text-primary-foreground shadow-lg font-bold">
                {activeFilterCount}
              </Badge>
            )}
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-auto p-0 text-xs hover:text-destructive font-medium">
              <X className="mr-1 h-3 w-3" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>Price Range ($)</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              min="0"
            />
            <Input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              min="0"
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>Color</Label>
          <Select value={color} onValueChange={setColor}>
            <SelectTrigger>
              <SelectValue placeholder="All colors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All colors</SelectItem>
              {COLORS.map((col) => (
                <SelectItem key={col.value} value={col.value}>
                  {col.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Material</Label>
          <Select value={material} onValueChange={setMaterial}>
            <SelectTrigger>
              <SelectValue placeholder="All materials" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All materials</SelectItem>
              {MATERIALS.map((mat) => (
                <SelectItem key={mat.value} value={mat.value}>
                  {mat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label>Dimensions (cm)</Label>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Length</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={minLength}
                onChange={(e) => setMinLength(e.target.value)}
                min="0"
              />
              <Input
                type="number"
                placeholder="Max"
                value={maxLength}
                onChange={(e) => setMaxLength(e.target.value)}
                min="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Width</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={minWidth}
                onChange={(e) => setMinWidth(e.target.value)}
                min="0"
              />
              <Input
                type="number"
                placeholder="Max"
                value={maxWidth}
                onChange={(e) => setMaxWidth(e.target.value)}
                min="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Height</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={minHeight}
                onChange={(e) => setMinHeight(e.target.value)}
                min="0"
              />
              <Input
                type="number"
                placeholder="Max"
                value={maxHeight}
                onChange={(e) => setMaxHeight(e.target.value)}
                min="0"
              />
            </div>
          </div>
        </div>

        <Button 
          onClick={applyFilters} 
          className="w-full bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
        >
          Apply Filters
        </Button>
      </CardContent>
    </Card>
  )
}
