"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, ChevronUp, FolderTree, Loader2, Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import type { Category } from "@/lib/types"

const SWATCHES = ["#efe7dc", "#e3e8e1", "#ece3e3", "#e4e4ea", "#c2410c", "#b91c1c", "#1d4ed8", "#15803d", "#7c3aed", "#1f2937"]

type Draft = {
  id?: string
  name: string
  slug: string
  parent_id: string
  description: string
  image: string
  is_active: boolean
}

const emptyDraft = (parent_id = ""): Draft => ({ name: "", slug: "", parent_id, description: "", image: "", is_active: true })

const toSlug = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

export function CategoryManager({
  initialCategories,
  productCounts,
}: {
  initialCategories: Category[]
  productCounts: Record<string, number>
}) {
  const router = useRouter()
  const [categories, setCategories] = useState(initialCategories)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [slugTouched, setSlugTouched] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toDelete, setToDelete] = useState<Category | null>(null)

  useEffect(() => setCategories(initialCategories), [initialCategories])

  const roots = categories.filter((c) => !c.parent_id).sort((a, b) => a.display_order - b.display_order)
  const childrenOf = (id: string) =>
    categories.filter((c) => c.parent_id === id).sort((a, b) => a.display_order - b.display_order)

  const request = async (url: string, method: string, body?: unknown) => {
    const res = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) throw new Error(data?.error || "Veprimi dështoi")
    return data
  }

  const openEdit = (c: Category) => {
    setSlugTouched(true)
    setDraft({
      id: c.id,
      name: c.name,
      slug: c.slug,
      parent_id: c.parent_id ?? "",
      description: c.description ?? "",
      image: c.image ?? "",
      is_active: c.is_active,
    })
  }

  const openNew = (parent_id = "") => {
    setSlugTouched(false)
    setDraft(emptyDraft(parent_id))
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft || !draft.name.trim()) return
    setSaving(true)
    const siblings = categories.filter((c) => (c.parent_id ?? "") === draft.parent_id)
    const body = {
      name: draft.name.trim(),
      slug: draft.slug || toSlug(draft.name),
      parent_id: draft.parent_id || null,
      description: draft.description,
      image: draft.image,
      is_active: draft.is_active,
      ...(draft.id ? {} : { display_order: siblings.length }),
    }
    try {
      const saved: Category = draft.id
        ? await request(`/api/categories/${draft.id}`, "PUT", body)
        : await request("/api/categories", "POST", body)
      setCategories((list) => (draft.id ? list.map((c) => (c.id === saved.id ? saved : c)) : [...list, saved]))
      toast.success(draft.id ? "Kategoria u përditësua" : "Kategoria u krijua")
      setDraft(null)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Veprimi dështoi")
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (c: Category, is_active: boolean) => {
    setCategories((list) => list.map((x) => (x.id === c.id ? { ...x, is_active } : x)))
    try {
      await request(`/api/categories/${c.id}`, "PUT", { is_active })
    } catch {
      setCategories((list) => list.map((x) => (x.id === c.id ? c : x)))
      toast.error("Ndryshimi nuk u ruajt")
    }
  }

  const move = async (list: Category[], index: number, dir: -1 | 1) => {
    const target = index + dir
    if (target < 0 || target >= list.length) return
    const reordered = [...list]
    ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]
    const orders = new Map(reordered.map((c, i) => [c.id, i]))
    setCategories((all) => all.map((c) => (orders.has(c.id) ? { ...c, display_order: orders.get(c.id)! } : c)))
    try {
      await Promise.all(
        reordered.map((c, i) => (c.display_order === i ? null : request(`/api/categories/${c.id}`, "PUT", { display_order: i }))),
      )
      router.refresh()
    } catch {
      toast.error("Renditja nuk u ruajt")
    }
  }

  const remove = async (c: Category) => {
    try {
      await request(`/api/categories/${c.id}`, "DELETE")
      setCategories((list) =>
        list.filter((x) => x.id !== c.id).map((x) => (x.parent_id === c.id ? { ...x, parent_id: null } : x)),
      )
      toast.success("Kategoria u fshi")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kategoria nuk u fshi")
    }
  }

  const Row = ({ c, list, index, child }: { c: Category; list: Category[]; index: number; child?: boolean }) => {
    const isColor = c.image?.startsWith("#")
    const count = productCounts[c.id] ?? 0
    return (
      <li className={cn("flex items-center gap-3 px-4 py-3 sm:px-5", child && "pl-10 sm:pl-14", !c.is_active && "opacity-60")}>
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => move(list, index, -1)}
            disabled={index === 0}
            className="text-muted-foreground hover:text-foreground disabled:opacity-25"
            aria-label="Lëviz lart"
          >
            <ChevronUp className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => move(list, index, 1)}
            disabled={index === list.length - 1}
            className="text-muted-foreground hover:text-foreground disabled:opacity-25"
            aria-label="Lëviz poshtë"
          >
            <ChevronDown className="size-4" />
          </button>
        </div>
        <span
          className="size-11 shrink-0 overflow-hidden rounded-xl border bg-muted"
          style={isColor ? { backgroundColor: c.image! } : undefined}
        >
          {c.image && !isColor && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={c.image} alt="" className="size-full object-cover" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{c.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            /{c.slug} · {count} {count === 1 ? "produkt" : "produkte"}
          </p>
        </div>
        <Switch checked={c.is_active} onCheckedChange={(v) => toggleActive(c, v)} aria-label={`${c.name} aktive`} />
        <div className="flex gap-0.5">
          {!child && (
            <Button variant="ghost" size="icon-sm" onClick={() => openNew(c.id)} aria-label="Shto nënkategori">
              <Plus />
            </Button>
          )}
          <Button variant="ghost" size="icon-sm" onClick={() => openEdit(c)} aria-label="Ndrysho">
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setToDelete(c)}
            aria-label="Fshi"
          >
            <Trash2 />
          </Button>
        </div>
      </li>
    )
  }

  const deleteChildren = toDelete ? childrenOf(toDelete.id).length : 0
  const deleteProducts = toDelete ? productCounts[toDelete.id] ?? 0 : 0

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => openNew()}>
          <Plus /> Kategori e re
        </Button>
      </div>

      <div className="overflow-hidden rounded-3xl border bg-card">
        {roots.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <FolderTree className="size-8 text-muted-foreground" />
            <p className="mt-3 font-medium">Ende pa kategori</p>
            <p className="mt-1 text-sm text-muted-foreground">Krijoni kategorinë e parë për të organizuar produktet.</p>
          </div>
        ) : (
          <ul className="divide-y">
            {roots.map((root, i) => (
              <li key={root.id}>
                <ul className="divide-y">
                  <Row c={root} list={roots} index={i} />
                  {childrenOf(root.id).map((sub, j, subs) => (
                    <Row key={sub.id} c={sub} list={subs} index={j} child />
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={!!draft} onOpenChange={(v) => !v && setDraft(null)}>
        <DialogContent className="sm:max-w-lg">
          {draft && (
            <form onSubmit={save} className="space-y-4">
              <DialogHeader>
                <DialogTitle>{draft.id ? "Ndrysho kategorinë" : "Kategori e re"}</DialogTitle>
                <DialogDescription>Kategoritë aktive shfaqen në menunë dhe filtrat e dyqanit.</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="cat-name">Emri</Label>
                  <Input
                    id="cat-name"
                    value={draft.name}
                    autoFocus
                    required
                    maxLength={100}
                    onChange={(e) =>
                      setDraft({ ...draft, name: e.target.value, slug: slugTouched ? draft.slug : toSlug(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cat-slug">Slug (URL)</Label>
                  <Input
                    id="cat-slug"
                    value={draft.slug}
                    maxLength={120}
                    onChange={(e) => {
                      setSlugTouched(true)
                      setDraft({ ...draft, slug: toSlug(e.target.value) })
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Kategoria prind</Label>
                <Select value={draft.parent_id || "none"} onValueChange={(v) => setDraft({ ...draft, parent_id: v === "none" ? "" : v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Asnjë — kategori kryesore</SelectItem>
                    {roots
                      .filter((r) => r.id !== draft.id)
                      .map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cat-desc">Përshkrimi</Label>
                <Textarea
                  id="cat-desc"
                  rows={2}
                  maxLength={500}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cat-image">Foto ose ngjyra e kartës</Label>
                <Input
                  id="cat-image"
                  placeholder="https://… ose #efe7dc"
                  value={draft.image}
                  onChange={(e) => setDraft({ ...draft, image: e.target.value })}
                />
                <div className="flex flex-wrap gap-1.5">
                  {SWATCHES.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setDraft({ ...draft, image: draft.image === color ? "" : color })}
                      className={cn(
                        "size-7 rounded-full border transition-transform hover:scale-110",
                        draft.image === color && "ring-2 ring-foreground ring-offset-2 ring-offset-background",
                      )}
                      style={{ backgroundColor: color }}
                      aria-label={`Ngjyra ${color}`}
                    />
                  ))}
                </div>
              </div>

              <label className="flex items-center justify-between rounded-2xl border p-3.5">
                <span className="text-sm">
                  <span className="block font-medium">Aktive</span>
                  <span className="text-xs text-muted-foreground">E dukshme për klientët</span>
                </span>
                <Switch checked={draft.is_active} onCheckedChange={(v) => setDraft({ ...draft, is_active: v })} />
              </label>

              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setDraft(null)}>
                  Anulo
                </Button>
                <Button type="submit" disabled={saving || !draft.name.trim()}>
                  {saving && <Loader2 className="animate-spin" />}
                  {draft.id ? "Ruaj" : "Krijo"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Të fshihet “{toDelete?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteChildren > 0 && `${deleteChildren} nënkategori do të bëhen kategori kryesore. `}
              {deleteProducts > 0
                ? `${deleteProducts} produkte do të mbeten pa kategori, por nuk fshihen. `
                : "Asnjë produkt nuk është në këtë kategori. "}
              Për ta fshehur përkohësisht, çaktivizojeni në vend që ta fshini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulo</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => toDelete && remove(toDelete)}
            >
              Fshi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
