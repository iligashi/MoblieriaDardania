"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { Furniture, CustomField, Category } from "@/lib/types"
import { CustomFieldBuilder } from "@/components/admin/custom-field-builder"
import { DynamicFieldRenderer } from "@/components/dynamic-field-renderer"
import { X, Plus, UploadCloud, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface FurnitureFormProps {
  furniture?: Furniture
}

const DEFAULT_MATERIALS = ["wood", "metal", "plastic", "glass", "fabric", "leather", "mixed"]
const DEFAULT_COLORS = ["white", "black", "brown", "gray", "beige", "blue", "green", "red", "other"]

export function FurnitureForm({ furniture }: FurnitureFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dbCategories, setDbCategories] = useState<Category[]>([])
  const [materials, setMaterials] = useState<string[]>(DEFAULT_MATERIALS)
  const [colors, setColors] = useState<string[]>(DEFAULT_COLORS)
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)
  const [newMaterial, setNewMaterial] = useState("")
  const [newColor, setNewColor] = useState("")

  const [formData, setFormData] = useState({
    title: furniture?.title || "",
    slug: (furniture as any)?.slug || "",
    category_id: (furniture as any)?.category_id || "",
    category: furniture?.category || "",
    short_description: (furniture as any)?.short_description || "",
    description: furniture?.description || "",
    price: furniture?.price || 0,
    discount_price: (furniture as any)?.discount_price || "",
    sku: (furniture as any)?.sku || "",
    brand: (furniture as any)?.brand || "",
    length: furniture?.dimensions?.length || 0,
    width: furniture?.dimensions?.width || 0,
    height: furniture?.dimensions?.height || 0,
    unit: furniture?.dimensions?.unit || "cm",
    material: furniture?.material || "",
    color: furniture?.color || "",
    weight: furniture?.weight || 0,
    weight_unit: furniture?.weight_unit || "kg",
    stock: furniture?.stock || 0,
    images: furniture?.images || [],
    is_featured: (furniture as any)?.is_featured || false,
    is_bestseller: (furniture as any)?.is_bestseller || false,
    is_new: (furniture as any)?.is_new ?? true,
    is_active: (furniture as any)?.is_active ?? true,
    tags: (furniture as any)?.tags || [],
  })

  const [imageInput, setImageInput] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
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

  useEffect(() => {
    fetchSettings()
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories")
      if (res.ok) {
        const data = await res.json()
        setDbCategories(data)
      }
    } catch (err) {
      console.error("Error fetching categories:", err)
    }
  }

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings")
      if (response.ok) {
        const data = await response.json()
        if (data.materials) setMaterials(data.materials)
        if (data.colors) setColors(data.colors)
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    } finally {
      setIsLoadingSettings(false)
    }
  }

  const addMaterial = async () => {
    if (!newMaterial.trim()) return
    const trimmed = newMaterial.trim().toLowerCase()
    if (materials.includes(trimmed)) {
      toast.error("Materiali ekziston")
      return
    }
    const updated = [...materials, trimmed]
    setMaterials(updated)
    await saveSetting("materials", updated)
    setNewMaterial("")
    toast.success("Materiali u shtua")
  }

  const addColor = async () => {
    if (!newColor.trim()) return
    const trimmed = newColor.trim().toLowerCase()
    if (colors.includes(trimmed)) {
      toast.error("Ngjyra ekziston")
      return
    }
    const updated = [...colors, trimmed]
    setColors(updated)
    await saveSetting("colors", updated)
    setNewColor("")
    toast.success("Ngjyra u shtua")
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

  // Flatten categories for select (parent > child)
  const flatCategories: { id: string; name: string; slug: string }[] = []
  dbCategories.forEach((cat) => {
    flatCategories.push({ id: cat.id, name: cat.name, slug: cat.slug })
    if (cat.children) {
      cat.children.forEach((sub) => {
        flatCategories.push({ id: sub.id, name: `${cat.name} > ${sub.name}`, slug: sub.slug })
      })
    }
  })

  const handleCategoryChange = (categoryId: string) => {
    const selected = flatCategories.find((c) => c.id === categoryId)
    setFormData({
      ...formData,
      category_id: categoryId,
      category: selected?.slug || "",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const payload: Record<string, unknown> = {
        title: formData.title,
        slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now().toString(36),
        category: formData.category,
        category_id: formData.category_id || null,
        short_description: formData.short_description || null,
        description: formData.description,
        price: Number(formData.price),
        discount_price: formData.discount_price ? Number(formData.discount_price) : null,
        sku: formData.sku || null,
        brand: formData.brand || null,
        dimensions: (formData.length || formData.width || formData.height) ? {
          length: Number(formData.length),
          width: Number(formData.width),
          height: Number(formData.height),
          unit: formData.unit,
        } : null,
        material: formData.material || null,
        color: formData.color || null,
        weight: formData.weight ? Number(formData.weight) : null,
        weight_unit: formData.weight_unit || "kg",
        stock: Number(formData.stock),
        images: formData.images,
        is_featured: formData.is_featured,
        is_bestseller: formData.is_bestseller,
        is_new: formData.is_new,
        is_active: formData.is_active,
        tags: formData.tags,
        customFields: customFields.map((field) => ({
          ...field,
          fieldValue: customFieldValues[field.fieldKey] ?? field.fieldValue,
        })),
      }

      const url = furniture ? `/api/products/${furniture.id}` : "/api/products"
      const method = furniture ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Deshtoi ruajtja e produktit")
      }

      toast.success(furniture ? "Produkti u ndryshua!" : "Produkti u shtua!")
      router.push("/admin/dashboard")
      router.refresh()
    } catch (error) {
      console.error("Error saving product:", error)
      setError(error instanceof Error ? error.message : "Ndodhi nje gabim")
    } finally {
      setIsLoading(false)
    }
  }

  const addImage = () => {
    if (imageInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, imageInput.trim()],
      }))
      setImageInput("")
    }
  }

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append("file", file)
      uploadFormData.append("fileName", file.name.replace(/\.[^/.]+$/, ""))

      const response = await fetch("/api/uploads", {
        method: "POST",
        body: uploadFormData,
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || "Ngarkimi deshtoi")
      }

      const data = await response.json()
      if (data?.url) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, data.url as string],
        }))
        toast.success("Imazhi u ngarkua!")
      } else {
        throw new Error("Ngarkimi nuk ktheu URL")
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error(error instanceof Error ? error.message : "Nuk mund te ngarkohet imazhi")
    } finally {
      setIsUploading(false)
      if (event.target) event.target.value = ""
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Titulli *</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Kategoria *</Label>
              {flatCategories.length > 0 ? (
                <Select
                  value={formData.category_id}
                  onValueChange={handleCategoryChange}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Zgjidhni kategorine" />
                  </SelectTrigger>
                  <SelectContent>
                    {flatCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
                  Nuk ka kategori. <a href="/admin/categories" className="text-primary hover:underline">Shto kategori</a> me pare.
                </div>
              )}
            </div>

            {/* SKU + Brand */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  placeholder="p.sh. PRD-001"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="brand">Brendi</Label>
                <Input
                  id="brand"
                  placeholder="p.sh. Bosch, Samsung"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="short_description">Pershkrim i shkurter</Label>
              <Input
                id="short_description"
                placeholder="Pershkrim i shkurter per kartelat e produktit"
                value={formData.short_description}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Pershkrimi *</Label>
              <Textarea
                id="description"
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="price">Cmimi (EUR) *</Label>
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
              <div className="grid gap-2">
                <Label htmlFor="discount_price">Cmimi me zbritje (EUR)</Label>
                <Input
                  id="discount_price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Lere bosh nese ska zbritje"
                  value={formData.discount_price}
                  onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                />
              </div>
            </div>

            {/* Product Flags */}
            <div className="flex flex-wrap gap-4 p-4 bg-muted/30 rounded-lg">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 accent-primary rounded"
                />
                <span className="text-sm font-medium">Aktiv</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_new}
                  onChange={(e) => setFormData({ ...formData, is_new: e.target.checked })}
                  className="h-4 w-4 accent-blue-600 rounded"
                />
                <span className="text-sm font-medium">I ri</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="h-4 w-4 accent-yellow-600 rounded"
                />
                <span className="text-sm font-medium">I veqante (Featured)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_bestseller}
                  onChange={(e) => setFormData({ ...formData, is_bestseller: e.target.checked })}
                  className="h-4 w-4 accent-green-600 rounded"
                />
                <span className="text-sm font-medium">Me i shitur (Bestseller)</span>
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="grid gap-2">
                <Label htmlFor="length">Gjatesia</Label>
                <Input
                  id="length"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.length}
                  onChange={(e) => setFormData({ ...formData, length: Number(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="width">Gjeresia</Label>
                <Input
                  id="width"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.width}
                  onChange={(e) => setFormData({ ...formData, width: Number(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="height">Lartesia</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit">Njesia</Label>
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
                  <Label htmlFor="material">Materiali</Label>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button type="button" variant="ghost" size="sm" className="h-7 text-xs">
                        <Plus className="h-3 w-3 mr-1" />
                        Shto
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Shto Material</DialogTitle>
                        <DialogDescription>Shto nje material te ri ne liste</DialogDescription>
                      </DialogHeader>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Emri i materialit"
                          value={newMaterial}
                          onChange={(e) => setNewMaterial(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addMaterial())}
                        />
                        <Button onClick={addMaterial} type="button">Shto</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <Select
                  value={formData.material}
                  onValueChange={(value) => setFormData({ ...formData, material: value })}
                  disabled={isLoadingSettings}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Zgjidhni materialin" />
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
                  <Label htmlFor="color">Ngjyra</Label>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button type="button" variant="ghost" size="sm" className="h-7 text-xs">
                        <Plus className="h-3 w-3 mr-1" />
                        Shto
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Shto Ngjyre</DialogTitle>
                        <DialogDescription>Shto nje ngjyre te re ne liste</DialogDescription>
                      </DialogHeader>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Emri i ngjyres"
                          value={newColor}
                          onChange={(e) => setNewColor(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addColor())}
                        />
                        <Button onClick={addColor} type="button">Shto</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <Select
                  value={formData.color}
                  onValueChange={(value) => setFormData({ ...formData, color: value })}
                  disabled={isLoadingSettings}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Zgjidhni ngjyren" />
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
                <Label htmlFor="weight">Pesha</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="weight_unit">Njesia e peshes</Label>
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
              <Label htmlFor="stock">Stoku *</Label>
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
              <Label>Imazhet</Label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  placeholder="Vendos URL te imazhit"
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addImage()
                    }
                  }}
                />
                <div className="flex flex-col gap-2 sm:flex-row sm:w-auto">
                  <Button type="button" onClick={addImage}>Shto</Button>
                  <Button type="button" variant="outline" onClick={handleUploadClick} disabled={isUploading}>
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Duke ngarkuar...
                      </>
                    ) : (
                      <>
                        <UploadCloud className="mr-2 h-4 w-4" />
                        Ngarko Imazh
                      </>
                    )}
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              {formData.images.length > 0 && (
                <div className="mt-2 grid gap-2">
                  {formData.images.map((img, index) => (
                    <div key={index} className="flex items-center gap-2 rounded border bg-muted/60 p-2">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-white">
                        <img
                          src={img || "/placeholder.svg"}
                          alt={`Preview ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="flex-1 min-w-0 break-all text-sm text-muted-foreground">{img}</span>
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
                <h3 className="text-lg font-semibold mb-2">Fusha te personalizuara</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Shtoni fusha te personalizuara per te shfaqur informata shtese ne faqen e produktit.
                </p>
              </div>
              <CustomFieldBuilder
                furnitureId={furniture?.id}
                initialFields={customFields}
                onFieldsChange={setCustomFields}
              />

              {customFields.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h4 className="text-base font-medium">Ploteso vlerat e fushave</h4>
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
              {isLoading ? "Duke ruajtur..." : furniture ? "Ndrysho Produktin" : "Shto Produktin"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/admin/dashboard")}>
              Anulo
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
