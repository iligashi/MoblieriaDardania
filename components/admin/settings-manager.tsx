"use client"

import { useState } from "react"
import { Loader2, Plus, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Panel } from "@/components/admin/admin-ui"

export function SettingsManager({
  type,
  label,
  description,
  placeholder,
  initialItems,
}: {
  type: "materials" | "colors"
  label: string
  description: string
  placeholder: string
  initialItems: string[]
}) {
  const [items, setItems] = useState(initialItems)
  const [saved, setSaved] = useState(initialItems)
  const [value, setValue] = useState("")
  const [saving, setSaving] = useState(false)
  const dirty = items.join("|") !== saved.join("|")

  const add = () => {
    const v = value.trim().toLowerCase()
    if (!v) return
    if (items.includes(v)) {
      toast.error("Ky opsion ekziston tashmë")
      return
    }
    setItems([...items, v])
    setValue("")
  }

  const save = async () => {
    setSaving(true)
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: type, value: items }),
    })
    setSaving(false)
    if (!res.ok) {
      toast.error("Ndryshimet nuk u ruajtën")
      return
    }
    setSaved(items)
    toast.success(`${label} u ruajtën`)
  }

  return (
    <Panel
      title={label}
      description={description}
      action={
        <Button size="sm" onClick={save} disabled={!dirty || saving}>
          {saving && <Loader2 className="animate-spin" />}
          {dirty ? "Ruaj" : "Ruajtur"}
        </Button>
      }
    >
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              add()
            }
          }}
          placeholder={placeholder}
          maxLength={60}
        />
        <Button type="button" variant="outline" size="icon" onClick={add} aria-label="Shto">
          <Plus />
        </Button>
      </div>
      <div className="mt-4 flex min-h-16 flex-wrap content-start gap-2">
        {items.length === 0 ? (
          <p className="w-full py-4 text-center text-sm text-muted-foreground">Ende pa opsione.</p>
        ) : (
          items.map((item) => (
            <span key={item} className="inline-flex items-center gap-1 rounded-full bg-muted py-1 pr-1 pl-3 text-sm capitalize">
              {item}
              <button
                type="button"
                onClick={() => setItems(items.filter((i) => i !== item))}
                className="grid size-6 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                aria-label={`Hiq ${item}`}
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))
        )}
      </div>
    </Panel>
  )
}
