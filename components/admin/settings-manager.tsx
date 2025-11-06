"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Save, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface SettingsManagerProps {
  type: "categories" | "materials" | "colors"
  label: string
  icon?: React.ReactNode
}

export function SettingsManager({ type, label, icon }: SettingsManagerProps) {
  const [items, setItems] = useState<string[]>([])
  const [newItem, setNewItem] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings")
      if (!response.ok) throw new Error("Failed to fetch settings")
      const data = await response.json()
      setItems(data[type] || [])
    } catch (error) {
      console.error("Error fetching settings:", error)
      toast.error("Failed to load settings")
    } finally {
      setIsLoading(false)
    }
  }

  const addItem = () => {
    if (!newItem.trim()) return

    const trimmedItem = newItem.trim().toLowerCase()
    if (items.includes(trimmedItem)) {
      toast.error(`${label} already exists`)
      return
    }

    setItems([...items, trimmedItem])
    setNewItem("")
  }

  const removeItem = (itemToRemove: string) => {
    setItems(items.filter((item) => item !== itemToRemove))
  }

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: type,
          value: items,
        }),
      })

      if (!response.ok) throw new Error("Failed to save settings")

      toast.success(`${label} saved successfully`)
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addItem()
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {icon}
            {label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {icon}
              {label}
            </CardTitle>
            <CardDescription className="mt-1">
              Manage available {label.toLowerCase()} for furniture items
            </CardDescription>
          </div>
          <Button onClick={saveSettings} disabled={isSaving} size="sm">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Item */}
        <div className="flex gap-2">
          <Input
            placeholder={`Add new ${label.toLowerCase().slice(0, -1)}...`}
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={addItem} size="sm" type="button">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Items List */}
        <div className="flex flex-wrap gap-2 min-h-[60px] p-4 rounded-lg border border-dashed bg-muted/30">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground w-full text-center py-2">
              No {label.toLowerCase()} yet. Add your first one above.
            </p>
          ) : (
            items.map((item) => (
              <Badge
                key={item}
                variant="secondary"
                className="text-sm px-3 py-1.5 flex items-center gap-2 capitalize"
              >
                {item}
                <button
                  onClick={() => removeItem(item)}
                  className="ml-1 rounded-full hover:bg-destructive/20 p-0.5 transition-colors"
                  type="button"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

