"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Plus, Trash2, Edit, Save, X, Palette } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import type { Category } from "@/lib/types"

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308",
  "#84cc16", "#22c55e", "#14b8a6", "#06b6d4",
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7",
  "#d946ef", "#ec4899", "#f43f5e", "#78716c",
  "#1b1f22", "#374151", "#6b7280", "#9ca3af",
]

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newName, setNewName] = useState("")
  const [newSlug, setNewSlug] = useState("")
  const [newParentId, setNewParentId] = useState("")
  const [newColor, setNewColor] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories")
      const data = await res.json()
      setCategories(data)
    } catch {
      toast.error("Failed to load categories")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchCategories() }, [])

  const addCategory = async () => {
    if (!newName.trim()) return
    const slug = newSlug.trim() || newName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          slug,
          parent_id: newParentId || null,
          display_order: categories.length,
          image: newColor || null,
        }),
      })

      if (!res.ok) throw new Error()
      toast.success("Kategoria u shtua")
      setNewName("")
      setNewSlug("")
      setNewParentId("")
      setNewColor("")
      fetchCategories()
    } catch {
      toast.error("Deshtoi shtimi i kategorise")
    }
  }

  const updateCategory = async (id: string) => {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      })
      if (!res.ok) throw new Error()
      toast.success("Kategoria u ndryshua")
      setEditingId(null)
      fetchCategories()
    } catch {
      toast.error("Deshtoi ndryshimi")
    }
  }

  const updateCategoryColor = async (id: string, color: string | null) => {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: color }),
      })
      if (!res.ok) throw new Error()
      toast.success("Ngjyra u ndryshua")
      fetchCategories()
    } catch {
      toast.error("Deshtoi ndryshimi i ngjyres")
    }
  }

  const deleteCategory = async (id: string) => {
    if (!confirm("Jeni te sigurt?")) return
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success("Kategoria u fshi")
      fetchCategories()
    } catch {
      toast.error("Deshtoi fshirja")
    }
  }

  // Flatten for parent dropdown
  const allCats: Category[] = []
  categories.forEach((c) => {
    allCats.push(c)
    c.children?.forEach((sub) => allCats.push(sub))
  })

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kthehu
            </Link>
          </Button>
          <h1 className="text-lg font-bold">Menaxho Kategorite</h1>
          <div />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Add New */}
        <div className="bg-white rounded-xl border p-5 mb-6">
          <h2 className="text-base font-bold mb-4">Shto Kategori te Re</h2>
          <div className="grid gap-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Emri</Label>
                <Input
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value)
                    setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""))
                  }}
                  placeholder="Vegla pune"
                  className="h-9"
                />
              </div>
              <div>
                <Label className="text-xs">Slug (URL)</Label>
                <Input
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  placeholder="vegla-pune"
                  className="h-9"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Kategori prind (opsionale)</Label>
              <select
                value={newParentId}
                onChange={(e) => setNewParentId(e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-border text-sm"
              >
                <option value="">Asnje (kategori kryesore)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs">Ngjyra e kartes (opsionale)</Label>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewColor(newColor === color ? "" : color)}
                    className="h-7 w-7 rounded-md border-2 transition-all hover:scale-110"
                    style={{
                      backgroundColor: color,
                      borderColor: newColor === color ? "#000" : "transparent",
                      boxShadow: newColor === color ? "0 0 0 2px white, 0 0 0 4px black" : "none",
                    }}
                  />
                ))}
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={newColor || "#000000"}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="h-7 w-7 rounded cursor-pointer border-0 p-0"
                  />
                  <span className="text-xs text-muted-foreground">Tjeter</span>
                </div>
              </div>
              {newColor && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-6 w-10 rounded" style={{ backgroundColor: newColor }} />
                  <span className="text-xs text-muted-foreground">{newColor}</span>
                  <button onClick={() => setNewColor("")} className="text-xs text-destructive hover:underline">Hiq</button>
                </div>
              )}
            </div>
            <Button onClick={addCategory} className="w-fit" size="sm">
              <Plus className="h-4 w-4 mr-1" /> Shto
            </Button>
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-muted rounded-lg" />)}
          </div>
        ) : categories.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Nuk ka kategori ende.</p>
        ) : (
          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat.id}>
                <CategoryRow
                  category={cat}
                  isEditing={editingId === cat.id}
                  editName={editName}
                  onStartEdit={() => { setEditingId(cat.id); setEditName(cat.name) }}
                  onCancelEdit={() => setEditingId(null)}
                  onSaveEdit={() => updateCategory(cat.id)}
                  onEditNameChange={setEditName}
                  onDelete={() => deleteCategory(cat.id)}
                  onColorUpdate={(color) => updateCategoryColor(cat.id, color)}
                />
                {cat.children?.map((sub) => (
                  <div key={sub.id} className="ml-6">
                    <CategoryRow
                      category={sub}
                      isEditing={editingId === sub.id}
                      editName={editName}
                      onStartEdit={() => { setEditingId(sub.id); setEditName(sub.name) }}
                      onCancelEdit={() => setEditingId(null)}
                      onSaveEdit={() => updateCategory(sub.id)}
                      onEditNameChange={setEditName}
                      onDelete={() => deleteCategory(sub.id)}
                      onColorUpdate={(color) => updateCategoryColor(sub.id, color)}
                      isChild
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function CategoryRow({
  category,
  isEditing,
  editName,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditNameChange,
  onDelete,
  onColorUpdate,
  isChild,
}: {
  category: Category
  isEditing: boolean
  editName: string
  onStartEdit: () => void
  onCancelEdit: () => void
  onSaveEdit: () => void
  onEditNameChange: (v: string) => void
  onDelete: () => void
  onColorUpdate: (color: string | null) => void
  isChild?: boolean
}) {
  const [showPicker, setShowPicker] = useState(false)

  const isColor = category.image && category.image.startsWith("#")

  return (
    <div className={`p-3 rounded-lg border bg-white ${isChild ? "border-dashed" : ""}`}>
      <div className="flex items-center justify-between gap-3">
        {isEditing ? (
          <div className="flex items-center gap-2 flex-1">
            <Input
              value={editName}
              onChange={(e) => onEditNameChange(e.target.value)}
              className="h-8 text-sm"
              autoFocus
            />
            <Button size="sm" variant="ghost" onClick={onSaveEdit} className="h-8 w-8 p-0">
              <Save className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onCancelEdit} className="h-8 w-8 p-0">
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {isColor ? (
                <div className="h-10 w-14 rounded border shrink-0" style={{ backgroundColor: category.image! }} />
              ) : (
                <div className="h-10 w-14 bg-muted rounded border flex items-center justify-center shrink-0">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{category.name}</p>
                <p className="text-xs text-muted-foreground">/{category.slug}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowPicker(!showPicker)}
                className="h-8 w-8 p-0"
                title="Ndrysho ngjyren"
              >
                <Palette className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="ghost" onClick={onStartEdit} className="h-8 w-8 p-0">
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="ghost" onClick={onDelete} className="h-8 w-8 p-0 text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </>
        )}
      </div>
      {showPicker && (
        <div className="mt-3 pt-3 border-t">
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => { onColorUpdate(color); setShowPicker(false) }}
                className="h-7 w-7 rounded-md border-2 transition-all hover:scale-110"
                style={{
                  backgroundColor: color,
                  borderColor: category.image === color ? "#000" : "transparent",
                  boxShadow: category.image === color ? "0 0 0 2px white, 0 0 0 4px black" : "none",
                }}
              />
            ))}
            <input
              type="color"
              value={(isColor ? category.image : "#000000") || "#000000"}
              onChange={(e) => { onColorUpdate(e.target.value); setShowPicker(false) }}
              className="h-7 w-7 rounded cursor-pointer border-0 p-0"
            />
            {isColor && (
              <button
                onClick={() => { onColorUpdate(null); setShowPicker(false) }}
                className="h-7 px-2 rounded-md border text-xs text-destructive hover:bg-destructive/10"
              >
                Hiq
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
