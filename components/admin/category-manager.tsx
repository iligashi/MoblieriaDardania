"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  EyeOff,
  ImagePlus,
  Loader2,
  MoreHorizontal,
  Palette,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { CategoryCard, CategoryVisual, catStyle, productCountLabel } from "@/components/category-card"
import { categoryPhoto, summarizeCategories, uncategorizedCount, type CategorySummary } from "@/lib/catalog"
import { cn } from "@/lib/utils"
import type { Category } from "@/lib/types"

/** Mid-tone accents: strong enough for the dot, soft once tinted to 10% behind a card. */
const SWATCHES = ["#b45309", "#c2410c", "#be123c", "#a21caf", "#6d28d9", "#1d4ed8", "#0f766e", "#4d7c0f", "#57534e", "#1f2937"]
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]
const MAX_UPLOAD_BYTES = 4.5 * 1024 * 1024

export type ProductRef = { category: string | null; category_id: string | null; images: string[] | null }

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

async function request(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.error || "Veprimi dështoi")
  return data
}

export function CategoryManager({ initialCategories, products }: { initialCategories: Category[]; products: ProductRef[] }) {
  const router = useRouter()
  const [categories, setCategories] = useState(initialCategories)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [toDelete, setToDelete] = useState<CategorySummary | null>(null)

  useEffect(() => setCategories(initialCategories), [initialCategories])

  const roots = useMemo(() => summarizeCategories(categories, products), [categories, products])
  const stats = useMemo(
    () => ({
      roots: roots.length,
      subs: categories.length - roots.length,
      hidden: categories.filter((c) => !c.is_active).length,
      uncategorized: uncategorizedCount(categories, products),
    }),
    [roots, categories, products],
  )

  const toggleActive = async (c: Category, is_active: boolean) => {
    setCategories((list) => list.map((x) => (x.id === c.id ? { ...x, is_active } : x)))
    try {
      await request(`/api/categories/${c.id}`, "PUT", { is_active })
      toast.success(is_active ? `“${c.name}” është e dukshme në dyqan` : `“${c.name}” u fsheh nga dyqani`)
      router.refresh()
    } catch {
      setCategories((list) => list.map((x) => (x.id === c.id ? { ...x, is_active: !is_active } : x)))
      toast.error("Ndryshimi nuk u ruajt")
    }
  }

  const move = async (siblings: Category[], index: number, dir: -1 | 1) => {
    const target = index + dir
    if (target < 0 || target >= siblings.length) return
    const reordered = [...siblings]
    ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]
    const orders = new Map(reordered.map((c, i) => [c.id, i]))
    const previous = categories
    setCategories((all) => all.map((c) => (orders.has(c.id) ? { ...c, display_order: orders.get(c.id)! } : c)))
    try {
      await Promise.all(
        reordered.map((c, i) => (c.display_order === i ? null : request(`/api/categories/${c.id}`, "PUT", { display_order: i }))),
      )
      router.refresh()
    } catch {
      setCategories(previous)
      toast.error("Renditja nuk u ruajt")
    }
  }

  const remove = async (c: { id: string }) => {
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

  const openEdit = (c: Category) =>
    setDraft({
      id: c.id,
      name: c.name,
      slug: c.slug,
      parent_id: c.parent_id ?? "",
      description: c.description ?? "",
      image: c.image ?? "",
      is_active: c.is_active,
    })

  const onSaved = (saved: Category, isNew: boolean) => {
    setCategories((list) => (isNew ? [...list, saved] : list.map((c) => (c.id === saved.id ? saved : c))))
    setDraft(null)
    router.refresh()
  }

  return (
    <>
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Kategori kryesore" value={stats.roots} />
        <Stat label="Nënkategori" value={stats.subs} />
        <Stat label="Të fshehura" value={stats.hidden} hint="Nuk shfaqen në dyqan" />
        <Stat label="Produkte pa kategori" value={stats.uncategorized} tone={stats.uncategorized > 0 ? "warning" : undefined} />
      </div>

      {stats.uncategorized > 0 && (
        <div className="mb-6 flex flex-col gap-3 rounded-2xl bg-warning-soft px-4 py-3.5 text-sm sm:flex-row sm:items-center sm:px-5">
          <AlertTriangle className="size-5 shrink-0 text-warning-strong" />
          <p className="flex-1 text-warning-strong">
            <span className="font-semibold">{productCountLabel(stats.uncategorized)} pa kategori.</span> Ato shfaqen te “Të
            gjitha”, por jo kur klientët shfletojnë sipas kategorive.
          </p>
          <Button asChild size="sm" variant="outline" className="shrink-0 bg-card">
            <Link href="/admin/products?category=none">Cakto kategoritë</Link>
          </Button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {roots.map((root, i) => {
          const raw = categories.find((c) => c.id === root.id)!
          const rawSubs = root.children.map((s) => categories.find((c) => c.id === s.id)!)
          const siblingRoots = roots.map((r) => categories.find((c) => c.id === r.id)!)
          return (
            <RootCard
              key={root.id}
              root={root}
              isFirst={i === 0}
              isLast={i === roots.length - 1}
              onMove={(dir) => move(siblingRoots, i, dir)}
              onMoveSub={(j, dir) => move(rawSubs, j, dir)}
              onToggle={(c, v) => toggleActive(c, v)}
              onEdit={(id) => openEdit(categories.find((c) => c.id === id)!)}
              onAddSub={() => setDraft(emptyDraft(root.id))}
              onDelete={(c) => setToDelete(c)}
              raw={raw}
              rawSubs={rawSubs}
            />
          )
        })}

        <button
          type="button"
          onClick={() => setDraft(emptyDraft())}
          className="group flex min-h-64 flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-card hover:text-foreground"
        >
          <span className="grid size-12 place-items-center rounded-full bg-muted transition-transform group-hover:scale-110">
            <Plus className="size-5" />
          </span>
          <span className="text-sm font-medium">Kategori e re</span>
          {roots.length === 0 && (
            <span className="max-w-xs px-6 text-center text-xs">Krijoni kategorinë e parë për të organizuar produktet.</span>
          )}
        </button>
      </div>

      <CategoryDialog
        draft={draft}
        onClose={() => setDraft(null)}
        onSaved={onSaved}
        categories={categories}
        roots={roots}
      />

      <AlertDialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Të fshihet “{toDelete?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              {!!toDelete?.children.length && `${toDelete.children.length} nënkategori do të bëhen kategori kryesore. `}
              {toDelete?.productCount
                ? `${productCountLabel(toDelete.productCount)} do të mbeten pa kategori, por nuk fshihen. `
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

function Stat({ label, value, hint, tone }: { label: string; value: number; hint?: string; tone?: "warning" }) {
  return (
    <div className="rounded-2xl border bg-card px-4 py-3.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-1 font-display text-3xl leading-none tabular-nums", tone === "warning" && "text-warning-strong")}>
        {value}
      </p>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Category card                                                       */
/* ------------------------------------------------------------------ */

function RootCard({
  root,
  raw,
  rawSubs,
  isFirst,
  isLast,
  onMove,
  onMoveSub,
  onToggle,
  onEdit,
  onAddSub,
  onDelete,
}: {
  root: CategorySummary
  raw: Category
  rawSubs: Category[]
  isFirst: boolean
  isLast: boolean
  onMove: (dir: -1 | 1) => void
  onMoveSub: (index: number, dir: -1 | 1) => void
  onToggle: (c: Category, v: boolean) => void
  onEdit: (id: string) => void
  onAddSub: () => void
  onDelete: (c: CategorySummary) => void
}) {
  return (
    <article style={catStyle(root.color)} className="flex flex-col overflow-hidden rounded-3xl border bg-card">
      <div className="relative h-40 bg-[color-mix(in_oklab,var(--cat)_11%,var(--card))]">
        <CategoryVisual
          name={root.name}
          photo={root.photo}
          covers={root.covers}
          className={cn("absolute inset-0", !root.is_active && "opacity-50 grayscale")}
        />
        <div className="absolute top-3 left-3 flex rounded-full bg-card/90 p-0.5 shadow-sm backdrop-blur">
          <IconButton label="Më përpara" disabled={isFirst} onClick={() => onMove(-1)}>
            <ArrowLeft />
          </IconButton>
          <IconButton label="Më pas" disabled={isLast} onClick={() => onMove(1)}>
            <ArrowRight />
          </IconButton>
        </div>
        {!root.is_active && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-ink px-2.5 py-1 text-[11px] font-medium text-ink-foreground">
            <EyeOff className="size-3" /> E fshehur
          </span>
        )}
      </div>

      <div className="flex items-start gap-3 p-5 pb-4">
        <div className="min-w-0 flex-1">
          <h3 className="flex items-center gap-2">
            <span className="size-2.5 shrink-0 rounded-full bg-[var(--cat)]" />
            <button type="button" onClick={() => onEdit(root.id)} className="truncate text-lg font-semibold hover:underline">
              {root.name}
            </button>
          </h3>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            /{root.slug} · {productCountLabel(root.productCount)}
          </p>
        </div>
        <Switch checked={root.is_active} onCheckedChange={(v) => onToggle(raw, v)} aria-label={`${root.name} e dukshme`} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label={`Veprime për ${root.name}`}>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onSelect={() => onEdit(root.id)}>
              <Pencil /> Ndrysho
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onAddSub}>
              <Plus /> Shto nënkategori
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={`/shop?category=${root.slug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink /> Shiko në dyqan
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => onDelete(root)}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive [&_svg]:text-destructive"
            >
              <Trash2 /> Fshi
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-auto border-t px-3 pt-2 pb-3">
        <p className="px-2 pt-1 pb-1.5 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          Nënkategoritë
        </p>
        {root.children.length > 0 && (
          <ul>
            {root.children.map((sub, j) => (
              <li
                key={sub.id}
                className={cn(
                  "group/sub flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-muted/70",
                  !sub.is_active && "text-muted-foreground",
                )}
              >
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => onMoveSub(j, -1)}
                    disabled={j === 0}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-25"
                    aria-label={`Lëviz ${sub.name} lart`}
                  >
                    <ChevronUp className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveSub(j, 1)}
                    disabled={j === root.children.length - 1}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-25"
                    aria-label={`Lëviz ${sub.name} poshtë`}
                  >
                    <ChevronDown className="size-3.5" />
                  </button>
                </div>
                <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: sub.color }} />
                <button type="button" onClick={() => onEdit(sub.id)} className="min-w-0 flex-1 truncate text-left text-sm font-medium">
                  {sub.name}
                  {!sub.is_active && <span className="ml-1.5 text-xs font-normal">(e fshehur)</span>}
                </button>
                <span className="rounded-full bg-muted px-2 py-px text-[11px] text-muted-foreground tabular-nums">
                  {sub.productCount}
                </span>
                <Switch
                  checked={sub.is_active}
                  onCheckedChange={(v) => onToggle(rawSubs[j], v)}
                  aria-label={`${sub.name} e dukshme`}
                  className="scale-90"
                />
                <div className="flex opacity-100 transition-opacity sm:opacity-0 sm:group-focus-within/sub:opacity-100 sm:group-hover/sub:opacity-100">
                  <IconButton label={`Ndrysho ${sub.name}`} onClick={() => onEdit(sub.id)}>
                    <Pencil />
                  </IconButton>
                  <IconButton label={`Fshi ${sub.name}`} onClick={() => onDelete(sub)} destructive>
                    <Trash2 />
                  </IconButton>
                </div>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          onClick={onAddSub}
          className="mt-1 flex w-full items-center gap-2 rounded-xl border border-dashed px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
        >
          <Plus className="size-4" /> Shto nënkategori
        </button>
      </div>
    </article>
  )
}

function IconButton({
  label,
  onClick,
  disabled,
  destructive,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  destructive?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "grid size-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30 [&_svg]:size-3.5",
        destructive && "hover:bg-destructive/10 hover:text-destructive",
      )}
    >
      {children}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/* Create / edit dialog with live preview                              */
/* ------------------------------------------------------------------ */

function CategoryDialog({
  draft: initial,
  onClose,
  onSaved,
  categories,
  roots,
}: {
  draft: Draft | null
  onClose: () => void
  onSaved: (c: Category, isNew: boolean) => void
  categories: Category[]
  roots: CategorySummary[]
}) {
  const [draft, setDraft] = useState<Draft | null>(initial)
  const [slugTouched, setSlugTouched] = useState(false)
  const [mode, setMode] = useState<"color" | "photo">("color")
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setDraft(initial)
    setSlugTouched(!!initial?.id)
    setMode(initial && categoryPhoto({ image: initial.image }) ? "photo" : "color")
  }, [initial])

  if (!draft) return <Dialog open={false} />

  const isSub = !!draft.parent_id
  const parent = roots.find((r) => r.id === draft.parent_id)
  const existing = draft.id
    ? (roots.find((r) => r.id === draft.id) ?? roots.flatMap((r) => r.children).find((c) => c.id === draft.id))
    : undefined
  const hex = /^#[0-9a-f]{6}$/i.test(draft.image) ? draft.image : null
  const photo = categoryPhoto({ image: draft.image })
  const previewColor = hex ?? parent?.color ?? existing?.color ?? "#57534e"
  const hasChildren = !!draft.id && categories.some((c) => c.parent_id === draft.id)

  const set = (patch: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...patch } : d))

  const upload = async (file: File) => {
    if (!IMAGE_TYPES.includes(file.type)) return toast.error("Lloji i skedarit nuk lejohet (JPG, PNG, WebP, AVIF, GIF)")
    if (file.size > MAX_UPLOAD_BYTES) return toast.error("Maksimumi është 4.5 MB")
    setUploading(true)
    try {
      const body = new FormData()
      body.append("file", file)
      body.append("fileName", `category-${draft.slug || "image"}`)
      const res = await fetch("/api/uploads", { method: "POST", body })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.url) throw new Error(data?.error || "Ngarkimi dështoi")
      set({ image: data.url })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ngarkimi dështoi")
    } finally {
      setUploading(false)
    }
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.name.trim()) return
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
      toast.success(draft.id ? "Kategoria u përditësua" : "Kategoria u krijua")
      onSaved(saved, !draft.id)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Veprimi dështoi")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-4xl">
        <form onSubmit={save}>
          <DialogHeader>
            <DialogTitle>
              {draft.id ? "Ndrysho kategorinë" : isSub ? `Nënkategori e re në ${parent?.name ?? ""}` : "Kategori e re"}
            </DialogTitle>
            <DialogDescription>Ndryshimet shfaqen në ballinë, në dyqan dhe në menunë kryesore.</DialogDescription>
          </DialogHeader>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_300px]">
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="cat-name">Emri</Label>
                  <Input
                    id="cat-name"
                    value={draft.name}
                    autoFocus
                    required
                    maxLength={100}
                    placeholder="p.sh. Mobileri"
                    onChange={(e) => set({ name: e.target.value, ...(slugTouched ? {} : { slug: toSlug(e.target.value) }) })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cat-slug">Adresa (URL)</Label>
                  <div className="flex h-10 items-center rounded-xl border bg-background pl-3 text-sm focus-within:ring-2 focus-within:ring-ring/40">
                    <span className="text-muted-foreground">?category=</span>
                    <input
                      id="cat-slug"
                      value={draft.slug}
                      maxLength={120}
                      className="h-full min-w-0 flex-1 bg-transparent pr-3 outline-none"
                      onChange={(e) => {
                        setSlugTouched(true)
                        set({ slug: toSlug(e.target.value) })
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Vendndodhja</Label>
                <Select
                  value={draft.parent_id || "none"}
                  onValueChange={(v) => set({ parent_id: v === "none" ? "" : v })}
                  disabled={hasChildren}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Kategori kryesore</SelectItem>
                    {roots
                      .filter((r) => r.id !== draft.id)
                      .map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          Nënkategori e “{r.name}”
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {hasChildren && (
                  <p className="text-xs text-muted-foreground">Ka nënkategori, prandaj mbetet kategori kryesore.</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cat-desc">
                  Përshkrimi <span className="font-normal text-muted-foreground">(opsional)</span>
                </Label>
                <Textarea
                  id="cat-desc"
                  rows={2}
                  maxLength={500}
                  placeholder="Një fjali që shfaqet në kartë dhe në krye të faqes së kategorisë."
                  value={draft.description}
                  onChange={(e) => set({ description: e.target.value })}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <Label>Pamja</Label>
                  <div className="inline-flex rounded-full bg-muted p-0.5 text-sm" role="tablist">
                    {(
                      [
                        ["color", "Ngjyrë", Palette],
                        ["photo", "Foto", ImagePlus],
                      ] as const
                    ).map(([key, label, Icon]) => (
                      <button
                        key={key}
                        type="button"
                        role="tab"
                        aria-selected={mode === key}
                        onClick={() => setMode(key)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-3 py-1 transition-colors",
                          mode === key ? "bg-card font-medium shadow-sm" : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <Icon className="size-3.5" /> {label}
                      </button>
                    ))}
                  </div>
                </div>

                {mode === "color" ? (
                  <div className="rounded-2xl border p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {SWATCHES.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => set({ image: color })}
                          className={cn(
                            "size-8 rounded-full transition-transform hover:scale-110",
                            hex?.toLowerCase() === color && "ring-2 ring-foreground ring-offset-2 ring-offset-card",
                          )}
                          style={{ backgroundColor: color }}
                          aria-label={`Ngjyra ${color}`}
                          aria-pressed={hex?.toLowerCase() === color}
                        />
                      ))}
                      <label
                        className={cn(
                          "relative grid size-8 cursor-pointer place-items-center overflow-hidden rounded-full border-2 border-dashed text-muted-foreground hover:text-foreground",
                          hex && !SWATCHES.includes(hex.toLowerCase()) && "border-solid border-foreground",
                        )}
                        style={hex && !SWATCHES.includes(hex.toLowerCase()) ? { backgroundColor: hex } : undefined}
                        title="Ngjyrë e personalizuar"
                      >
                        {!(hex && !SWATCHES.includes(hex.toLowerCase())) && <Plus className="size-3.5" />}
                        <input
                          type="color"
                          value={hex ?? "#57534e"}
                          onChange={(e) => set({ image: e.target.value })}
                          className="absolute inset-0 size-full cursor-pointer opacity-0"
                          aria-label="Ngjyrë e personalizuar"
                        />
                      </label>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {isSub
                        ? hex
                          ? `Ngjyra ${hex}`
                          : "Pa ngjyrë — përdor ngjyrën e kategorisë prind."
                        : "Ngjyra përdoret si theks dhe si sfond i lehtë i kartës. Fotot e produkteve shfaqen automatikisht."}
                      {hex && (
                        <button type="button" onClick={() => set({ image: "" })} className="ml-2 underline">
                          Hiq
                        </button>
                      )}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 rounded-2xl border p-4">
                    {photo ? (
                      <div className="relative h-36 overflow-hidden rounded-xl bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photo} alt="" className="size-full object-cover" />
                        <button
                          type="button"
                          onClick={() => set({ image: "" })}
                          className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-card/90 shadow-sm"
                          aria-label="Hiq foton"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                        className="flex h-36 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                      >
                        {uploading ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
                        {uploading ? "Duke ngarkuar…" : "Ngarko një foto (deri 4.5 MB)"}
                      </button>
                    )}
                    <input
                      ref={fileRef}
                      type="file"
                      accept={IMAGE_TYPES.join(",")}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) upload(file)
                        e.target.value = ""
                      }}
                    />
                    <Input
                      placeholder="ose ngjitni një URL: https://…"
                      value={photo ?? ""}
                      onChange={(e) => set({ image: e.target.value.trim() })}
                      aria-label="URL e fotos"
                    />
                    <p className="text-xs text-muted-foreground">Foto horizontale, të paktën 1200 px e gjerë, duket më mirë.</p>
                  </div>
                )}
              </div>

              <label className="flex items-center justify-between gap-4 rounded-2xl border p-4">
                <span className="text-sm">
                  <span className="block font-medium">E dukshme në dyqan</span>
                  <span className="text-xs text-muted-foreground">Kur fshihet, produktet mbeten, por kategoria nuk shfaqet.</span>
                </span>
                <Switch checked={draft.is_active} onCheckedChange={(v) => set({ is_active: v })} />
              </label>
            </div>

            <aside className="lg:sticky lg:top-0 lg:self-start">
              <p className="mb-3 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                Pamja në dyqan
              </p>
              {isSub ? (
                <div style={catStyle(previewColor)} className="space-y-3 rounded-2xl border bg-background p-4">
                  <p className="text-xs text-muted-foreground">Shfaqet si filtër te “{parent?.name}”:</p>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="rounded-full px-3.5 py-1.5 text-sm text-muted-foreground">Të gjitha</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[color-mix(in_oklab,var(--cat)_14%,var(--card))] px-3.5 py-1.5 text-sm font-medium ring-1 ring-[color-mix(in_oklab,var(--cat)_45%,transparent)]">
                      {draft.name || "Nënkategoria"}
                      <span className="text-xs text-muted-foreground">{existing?.productCount ?? 0}</span>
                    </span>
                  </div>
                </div>
              ) : (
                <CategoryCard
                  preview
                  category={{
                    name: draft.name,
                    slug: draft.slug,
                    description: draft.description,
                    color: previewColor,
                    photo,
                    covers: existing?.covers ?? [],
                    productCount: existing?.productCount ?? 0,
                    children: existing?.children ?? [],
                  }}
                />
              )}
              {!draft.is_active && (
                <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <EyeOff className="size-3.5" /> E fshehur — klientët nuk e shohin.
                </p>
              )}
            </aside>
          </div>

          <DialogFooter className="mt-8">
            <Button type="button" variant="ghost" onClick={onClose}>
              Anulo
            </Button>
            <Button type="submit" disabled={saving || uploading || !draft.name.trim()}>
              {saving && <Loader2 className="animate-spin" />}
              {draft.id ? "Ruaj ndryshimet" : "Krijo kategorinë"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
