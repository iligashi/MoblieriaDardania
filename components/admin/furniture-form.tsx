"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { Furniture, CustomField } from "@/lib/types"
import { CustomFieldBuilder } from "@/components/admin/custom-field-builder"
import { DynamicFieldRenderer } from "@/components/dynamic-field-renderer"
import { X, Plus } from "lucide-react"
import { toast } from "sonner"

interface FurnitureFormProps {
  furniture?: Furniture
}

// Default fallbacks
const DEFAULT_CATEGORIES = ["sofa", "chair", "table", "bed", "desk", "cabinet", "shelf", "other"]
const DEFAULT_MATERIALS = ["wood", "metal", "plastic", "glass", "fabric", "leather", "mixed"]
const DEFAULT_COLORS = ["white", "black", "brown", "gray", "beige", "blue", "green", "red", "other"]

export function FurnitureForm({ furniture }: FurnitureFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES)
  const [materials, setMaterials] = useState<string[]>(DEFAULT_MATERIALS)
  const [colors, setColors] = useState<string[]>(DEFAULT_COLORS)
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)
  const [newCategory, setNewCategory] = useState("")
  const [newMaterial, setNewMaterial] = useState("")
  const [newColor, setNewColor] = useState("")

  const [formData, setFormData] = useState({
    title: furniture?.title || "",
    category: furniture?.category || "",
    description: furniture?.description || "",
    price: furniture?.price || 0,
    length: furniture?.dimensions.length || 0,
    width: furniture?.dimensions.width || 0,
    height: furniture?.dimensions.height || 0,
    unit: furniture?.dimensions.unit || "cm",
    material: furniture?.material || "",
    color: furniture?.color || "",
    weight: furniture?.weight || 0,
    weight_unit: furniture?.weight_unit || "kg",
    stock: furniture?.stock || 0,
    images: furniture?.images || [],
  })

  const [imageInput, setImageInput] = useState("")
  const [customFields, setCustomFields] = useState<CustomField[]>(
    (furniture as any)?.customFields || []
  )
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>(() => {
    if (furniture && (furniture as any).customFields) {
      return (furniture as any).customFields.reduce((acc: Record<string, any>, field: CustomField) => {
        if (field.fieldValue !== undefined) {
          acc[field.fieldKey] = field.fieldValue
        }
        return acc
      }, {})
    }
    return {}
  })

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings")
      if (response.ok) {
        const data = await response.json()
        if (data.categories) setCategories(data.categories)
        if (data.materials) setMaterials(data.materials)
        if (data.colors) setColors(data.colors)
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    } finally {
      setIsLoadingSettings(false)
    }
  }

  const addCategory = async () => {
    if (!newCategory.trim()) return
    const trimmed = newCategory.trim().toLowerCase()
    if (categories.includes(trimmed)) {
      toast.error("Category already exists")
      return
    }
    const updated = [...categories, trimmed]
    setCategories(updated)
    await saveSetting("categories", updated)
    setNewCategory("")
    toast.success("Category added")
  }

  const addMaterial = async () => {
    if (!newMaterial.trim()) return
    const trimmed = newMaterial.trim().toLowerCase()
    if (materials.includes(trimmed)) {
      toast.error("Material already exists")
      return
    }
    const updated = [...materials, trimmed]
    setMaterials(updated)
    await saveSetting("materials", updated)
    setNewMaterial("")
    toast.success("Material added")
  }

  const addColor = async () => {
    if (!newColor.trim()) return
    const trimmed = newColor.trim().toLowerCase()
    if (colors.includes(trimmed)) {
      toast.error("Color already exists")
      return
    }
    const updated = [...colors, trimmed]
    setColors(updated)
    await saveSetting("colors", updated)
    setNewColor("")
    toast.success("Color added")
  }

  const saveSetting = async (key: string, value: string[]) => {
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      })
    } catch (error) {
      console.error("Error saving setting:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const payload = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        price: Number(formData.price),
        dimensions: {
          length: Number(formData.length),
          width: Number(formData.width),
          height: Number(formData.height),
          unit: formData.unit,
        },
        material: formData.material,
        color: formData.color,
        weight: Number(formData.weight),
        weight_unit: formData.weight_unit,
        stock: Number(formData.stock),
        images: formData.images,
        customFields: customFields.map((field) => ({
          ...field,
          fieldValue: customFieldValues[field.fieldKey] ?? field.fieldValue,
        })),
      }

      const url = furniture ? `/api/furniture/${furniture.id}` : "/api/furniture"
      const method = furniture ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save furniture")
      }

      router.push("/admin/dashboard")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error saving furniture:", error)
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const addImage = () => {
    if (imageInput.trim()) {
      setFormData({
        ...formData,
        images: [...formData.images, imageInput.trim()],
      })
      setImageInput("")
    }
  }

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    })
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="category">Category *</Label>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button type="button" variant="ghost" size="sm" className="h-7 text-xs">
                      <Plus className="h-3 w-3 mr-1" />
                      Add New
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Category</DialogTitle>
                      <DialogDescription>Add a new category to the list</DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Category name"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addCategory()}
                      />
                      <Button onClick={addCategory} type="button">
                        Add
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                required
                disabled={isLoadingSettings}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="grid gap-2">
                <Label htmlFor="length">Length *</Label>
                <Input
                  id="length"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.length}
                  onChange={(e) => setFormData({ ...formData, length: Number(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="width">Width *</Label>
                <Input
                  id="width"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.width}
                  onChange={(e) => setFormData({ ...formData, width: Number(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="height">Height *</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit">Unit *</Label>
                <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cm">cm</SelectItem>
                    <SelectItem value="in">in</SelectItem>
                    <SelectItem value="m">m</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="material">Material *</Label>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button type="button" variant="ghost" size="sm" className="h-7 text-xs">
                        <Plus className="h-3 w-3 mr-1" />
                        Add New
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Material</DialogTitle>
                        <DialogDescription>Add a new material to the list</DialogDescription>
                      </DialogHeader>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Material name"
                          value={newMaterial}
                          onChange={(e) => setNewMaterial(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && addMaterial()}
                        />
                        <Button onClick={addMaterial} type="button">
                          Add
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <Select
                  value={formData.material}
                  onValueChange={(value) => setFormData({ ...formData, material: value })}
                  required
                  disabled={isLoadingSettings}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent>
                    {materials.map((mat) => (
                      <SelectItem key={mat} value={mat}>
                        {mat.charAt(0).toUpperCase() + mat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="color">Color *</Label>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button type="button" variant="ghost" size="sm" className="h-7 text-xs">
                        <Plus className="h-3 w-3 mr-1" />
                        Add New
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Color</DialogTitle>
                        <DialogDescription>Add a new color to the list</DialogDescription>
                      </DialogHeader>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Color name"
                          value={newColor}
                          onChange={(e) => setNewColor(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && addColor()}
                        />
                        <Button onClick={addColor} type="button">
                          Add
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <Select
                  value={formData.color}
                  onValueChange={(value) => setFormData({ ...formData, color: value })}
                  required
                  disabled={isLoadingSettings}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {colors.map((col) => (
                      <SelectItem key={col} value={col}>
                        {col.charAt(0).toUpperCase() + col.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="weight">Weight *</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="weight_unit">Weight Unit *</Label>
                <Select
                  value={formData.weight_unit}
                  onValueChange={(value) => setFormData({ ...formData, weight_unit: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="lb">lb</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="stock">Stock *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                required
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
              />
            </div>

            <div className="grid gap-2">
              <Label>Images</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter image URL"
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addImage()
                    }
                  }}
                />
                <Button type="button" onClick={addImage}>
                  Add
                </Button>
              </div>
              {formData.images.length > 0 && (
                <div className="mt-2 grid gap-2">
                  {formData.images.map((img, index) => (
                    <div key={index} className="flex items-center gap-2 rounded border bg-muted p-2">
                      <img
                        src={img || "/placeholder.svg"}
                        alt={`Preview ${index + 1}`}
                        className="h-12 w-12 rounded object-cover"
                      />
                      <span className="flex-1 truncate text-sm">{img}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeImage(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Custom Fields Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Custom Fields</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add custom fields to display additional information on the product detail page.
                </p>
              </div>
              <CustomFieldBuilder
                furnitureId={furniture?.id}
                initialFields={customFields}
                onFieldsChange={setCustomFields}
              />
              
              {/* Custom Fields Input Section */}
              {customFields.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h4 className="text-base font-medium">Fill Custom Field Values</h4>
                  <DynamicFieldRenderer
                    fields={customFields}
                    values={customFieldValues}
                    onChange={(key, value) => {
                      setCustomFieldValues((prev) => ({ ...prev, [key]: value }))
                    }}
                    readOnly={false}
                  />
                </div>
              )}
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : furniture ? "Update Furniture" : "Add Furniture"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/admin/dashboard")}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
