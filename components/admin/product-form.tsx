"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, ImagePlus, Link2, Loader2, Star, Trash2, UploadCloud, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { CustomFieldBuilder } from "@/components/admin/custom-field-builder"
import { DynamicFieldRenderer } from "@/components/dynamic-field-renderer"
import { Panel } from "@/components/admin/admin-ui"
import { formatPrice } from "@/lib/shop-config"
import { cn } from "@/lib/utils"
import type { Category, CustomField, Product } from "@/lib/types"

const MAX_UPLOAD_BYTES = 4.5 * 1024 * 1024
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]

type FormState = {
  title: string
  category_id: string
  short_description: string
  description: string
  price: string
  discount_price: string
  sku: string
  brand: string
  stock: string
  length: string
  width: string
  height: string
  unit: "cm" | "m" | "in"
  material: string
  color: string
  weight: string
  weight_unit: "kg" | "lb"
  images: string[]
  is_active: boolean
  is_new: boolean
  is_featured: boolean
  is_bestseller: boolean
}

const str = (v: number | string | null | undefined) => (v === null || v === undefined || v === 0 ? "" : String(v))

function initialState(p?: Product): FormState {
  return {
    title: p?.title ?? "",
    category_id: p?.category_id ?? "",
    short_description: p?.short_description ?? "",
    description: p?.description ?? "",
    price: str(p?.price),
    discount_price: str(p?.discount_price),
    sku: p?.sku ?? "",
    brand: p?.brand ?? "",
    stock: p ? String(p.stock ?? 0) : "",
    length: str(p?.dimensions?.length),
    width: str(p?.dimensions?.width),
    height: str(p?.dimensions?.height),
    unit: (p?.dimensions?.unit as FormState["unit"]) || "cm",
    material: p?.material ?? "",
    color: p?.color ?? "",
    weight: str(p?.weight),
    weight_unit: (p?.weight_unit as FormState["weight_unit"]) || "kg",
    images: p?.images ?? [],
    is_active: p?.is_active ?? true,
    is_new: p?.is_new ?? true,
    is_featured: p?.is_featured ?? false,
    is_bestseller: p?.is_bestseller ?? false,
  }
}

export function ProductForm({
  product,
  categories,
  materials,
  colors,
}: {
  product?: Product
  categories: Category[]
  materials: string[]
  colors: string[]
}) {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(() => initialState(product))
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(0)
  const [imageUrl, setImageUrl] = useState("")
  const [dragOver, setDragOver] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [dirty, setDirty] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // The DB column is `custom_fields` — reading it here is what keeps custom fields intact on edit.
  const existingFields = Array.isArray(product?.custom_fields) ? product!.custom_fields : []
  const [customFields, setCustomFields] = useState<CustomField[]>(existingFields)
  const [customValues, setCustomValues] = useState<Record<string, unknown>>(() =>
    Object.fromEntries(existingFields.filter((f) => f.fieldValue !== undefined).map((f) => [f.fieldKey, f.fieldValue])),
  )

  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [dirty])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    setDirty(true)
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const categoryOptions = useMemo(() => {
    const roots = categories.filter((c) => !c.parent_id)
    return roots.flatMap((root) => [
      { id: root.id, slug: root.slug, label: root.name, depth: 0 },
      ...categories
        .filter((c) => c.parent_id === root.id)
        .map((c) => ({ id: c.id, slug: c.slug, label: c.name, depth: 1 })),
    ])
  }, [categories])

  // ---------------------------------------------------------------- images
  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files)
    for (const file of list) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name}: lloji i skedarit nuk lejohet (JPG, PNG, WebP, AVIF, GIF)`)
        continue
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        toast.error(`${file.name}: maksimumi është 4.5 MB`)
        continue
      }
      setUploading((n) => n + 1)
      try {
        const body = new FormData()
        body.append("file", file)
        body.append("fileName", file.name.replace(/\.[^/.]+$/, ""))
        const res = await fetch("/api/uploads", { method: "POST", body })
        const data = await res.json().catch(() => null)
        if (!res.ok || !data?.url) throw new Error(data?.error || "Ngarkimi dështoi")
        setForm((f) => ({ ...f, images: [...f.images, data.url as string] }))
        setDirty(true)
      } catch (err) {
        toast.error(`${file.name}: ${err instanceof Error ? err.message : "Ngarkimi dështoi"}`)
      } finally {
        setUploading((n) => n - 1)
      }
    }
  }

  const addImageUrl = () => {
    const url = imageUrl.trim()
    if (!url) return
    if (!/^https?:\/\//i.test(url) && !url.startsWith("/")) {
      toast.error("Shkruani një URL të plotë (https://…)")
      return
    }
    set("images", [...form.images, url])
    setImageUrl("")
  }

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= form.images.length) return
    const next = [...form.images]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    set("images", next)
  }

  // ---------------------------------------------------------------- submit
  const validate = () => {
    const e: Partial<Record<keyof FormState, string>> = {}
    if (!form.title.trim()) e.title = "Titulli është i detyrueshëm"
    const price = Number(form.price)
    if (!form.price || !Number.isFinite(price) || price < 0) e.price = "Vendosni një çmim valid"
    if (form.discount_price && Number(form.discount_price) >= price) e.discount_price = "Duhet të jetë më i ulët se çmimi"
    if (form.stock === "" || !Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) e.stock = "Numër i plotë ≥ 0"
    return e
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length) {
      toast.error("Kontrolloni fushat e shënuara")
      document.getElementById(`pf-${Object.keys(found)[0]}`)?.focus()
      return
    }

    const category = categoryOptions.find((c) => c.id === form.category_id)
    const hasDims = Number(form.length) || Number(form.width) || Number(form.height)
    const payload = {
      title: form.title.trim(),
      ...(product ? {} : { slug: form.title }),
      category: category?.slug ?? product?.category ?? "",
      category_id: form.category_id || null,
      short_description: form.short_description,
      description: form.description,
      price: Number(form.price),
      discount_price: form.discount_price ? Number(form.discount_price) : null,
      sku: form.sku,
      brand: form.brand,
      dimensions: hasDims
        ? { length: Number(form.length) || 0, width: Number(form.width) || 0, height: Number(form.height) || 0, unit: form.unit }
        : null,
      material: form.material.toLowerCase(),
      color: form.color.toLowerCase(),
      weight: form.weight ? Number(form.weight) : null,
      weight_unit: form.weight_unit,
      stock: Number(form.stock),
      images: form.images,
      is_active: form.is_active,
      is_new: form.is_new,
      is_featured: form.is_featured,
      is_bestseller: form.is_bestseller,
      tags: product?.tags ?? [],
      custom_fields: customFields.map((f) => ({ ...f, fieldValue: customValues[f.fieldKey] ?? f.fieldValue })),
    }

    setSaving(true)
    try {
      const res = await fetch(product ? `/api/products/${product.id}` : "/api/products", {
        method: product ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error || "Produkti nuk u ruajt")
      setDirty(false)
      toast.success(product ? "Ndryshimet u ruajtën" : "Produkti u krijua")
      router.push("/admin/products")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Produkti nuk u ruajt")
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!product) return
    const res = await fetch(`/api/products/${product.id}`, { method: "DELETE" })
    if (!res.ok) return toast.error("Produkti nuk u fshi")
    setDirty(false)
    toast.success("Produkti u fshi")
    router.push("/admin/products")
    router.refresh()
  }

  const finalPrice = form.discount_price ? Number(form.discount_price) : Number(form.price)

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-4 xl:grid-cols-[1fr_340px]">
      <div className="min-w-0 space-y-4">
        <Panel title="Informacioni bazë">
          <div className="grid gap-4">
            <Field id="title" label="Titulli" error={errors.title} required>
              <Input id="pf-title" value={form.title} onChange={(e) => set("title", e.target.value)} maxLength={200} />
            </Field>
            <Field id="short_description" label="Përshkrim i shkurtër" hint="Shfaqet pranë çmimit. Deri në 300 karaktere.">
              <Textarea
                id="pf-short_description"
                rows={2}
                maxLength={300}
                value={form.short_description}
                onChange={(e) => set("short_description", e.target.value)}
              />
            </Field>
            <Field id="description" label="Përshkrimi">
              <Textarea
                id="pf-description"
                rows={7}
                maxLength={10000}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </Field>
          </div>
        </Panel>

        <Panel title="Fotot" description="Fotoja e parë është kopertina. Maksimumi 4.5 MB për foto.">
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files)
            }}
            className={cn(
              "grid grid-cols-2 gap-3 rounded-2xl sm:grid-cols-3 lg:grid-cols-4",
              dragOver && "ring-2 ring-primary ring-offset-4 ring-offset-card",
            )}
          >
            {form.images.map((src, i) => (
              <div key={src + i} className="group relative aspect-square overflow-hidden rounded-2xl border bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="size-full object-contain p-2 mix-blend-multiply" />
                {i === 0 && (
                  <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-ink px-2 py-0.5 text-[10px] font-medium text-ink-foreground">
                    <Star className="size-2.5 fill-current" /> Kopertina
                  </span>
                )}
                <div className="absolute inset-x-2 bottom-2 flex justify-between opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                  <div className="flex gap-1">
                    <IconBtn label="Lëviz majtas" onClick={() => moveImage(i, i - 1)} disabled={i === 0}>
                      <ArrowLeft className="size-3.5" />
                    </IconBtn>
                    <IconBtn label="Lëviz djathtas" onClick={() => moveImage(i, i + 1)} disabled={i === form.images.length - 1}>
                      <ArrowRight className="size-3.5" />
                    </IconBtn>
                  </div>
                  <IconBtn label="Hiq foton" onClick={() => set("images", form.images.filter((_, j) => j !== i))} danger>
                    <X className="size-3.5" />
                  </IconBtn>
                </div>
              </div>
            ))}
            {Array.from({ length: uploading }).map((_, i) => (
              <div key={`up-${i}`} className="grid aspect-square place-items-center rounded-2xl border border-dashed bg-muted/50">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
            >
              {form.images.length ? <ImagePlus className="size-6" /> : <UploadCloud className="size-6" />}
              <span>Ngarko ose tërhiq</span>
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept={ALLOWED_TYPES.join(",")}
            multiple
            hidden
            onChange={(e) => {
              if (e.target.files) uploadFiles(e.target.files)
              e.target.value = ""
            }}
          />
          <div className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <Link2 className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addImageUrl()
                  }
                }}
                placeholder="Ose ngjitni një URL fotoje"
                className="pl-10"
              />
            </div>
            <Button type="button" variant="outline" onClick={addImageUrl}>
              Shto
            </Button>
          </div>
        </Panel>

        <Panel title="Çmimi dhe stoku">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field id="price" label="Çmimi (€)" error={errors.price} required>
              <Input id="pf-price" type="number" inputMode="decimal" min={0} step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)} />
            </Field>
            <Field id="discount_price" label="Çmimi me zbritje (€)" error={errors.discount_price}>
              <Input
                id="pf-discount_price"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={form.discount_price}
                onChange={(e) => set("discount_price", e.target.value)}
              />
            </Field>
            <Field id="stock" label="Stoku" error={errors.stock} required>
              <Input id="pf-stock" type="number" inputMode="numeric" min={0} step={1} value={form.stock} onChange={(e) => set("stock", e.target.value)} />
            </Field>
            <Field id="sku" label="SKU">
              <Input id="pf-sku" value={form.sku} onChange={(e) => set("sku", e.target.value)} maxLength={80} />
            </Field>
            <Field id="brand" label="Marka">
              <Input id="pf-brand" value={form.brand} onChange={(e) => set("brand", e.target.value)} maxLength={80} />
            </Field>
          </div>
        </Panel>

        <Panel title="Detajet">
          <div className="grid gap-4 sm:grid-cols-4">
            <Field id="length" label="Gjatësia">
              <Input id="pf-length" type="number" min={0} step="0.1" value={form.length} onChange={(e) => set("length", e.target.value)} />
            </Field>
            <Field id="width" label="Gjerësia">
              <Input id="pf-width" type="number" min={0} step="0.1" value={form.width} onChange={(e) => set("width", e.target.value)} />
            </Field>
            <Field id="height" label="Lartësia">
              <Input id="pf-height" type="number" min={0} step="0.1" value={form.height} onChange={(e) => set("height", e.target.value)} />
            </Field>
            <Field id="unit" label="Njësia">
              <Select value={form.unit} onValueChange={(v) => set("unit", v as FormState["unit"])}>
                <SelectTrigger id="pf-unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cm">cm</SelectItem>
                  <SelectItem value="m">m</SelectItem>
                  <SelectItem value="in">in</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field id="material" label="Materiali" className="sm:col-span-2">
              <Input id="pf-material" list="pf-materials" value={form.material} onChange={(e) => set("material", e.target.value)} maxLength={80} />
              <datalist id="pf-materials">
                {materials.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </Field>
            <Field id="color" label="Ngjyra" className="sm:col-span-2">
              <Input id="pf-color" list="pf-colors" value={form.color} onChange={(e) => set("color", e.target.value)} maxLength={80} />
              <datalist id="pf-colors">
                {colors.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Field>
            <Field id="weight" label="Pesha" className="sm:col-span-2">
              <Input id="pf-weight" type="number" min={0} step="0.01" value={form.weight} onChange={(e) => set("weight", e.target.value)} />
            </Field>
            <Field id="weight_unit" label="Njësia e peshës" className="sm:col-span-2">
              <Select value={form.weight_unit} onValueChange={(v) => set("weight_unit", v as FormState["weight_unit"])}>
                <SelectTrigger id="pf-weight_unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="lb">lb</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </Panel>

        <Panel title="Fusha shtesë" description="Specifikime të veçanta që shfaqen te faqja e produktit.">
          <CustomFieldBuilder
            furnitureId={product?.id}
            initialFields={customFields}
            onFieldsChange={(f) => {
              setCustomFields(f)
              setDirty(true)
            }}
          />
          {customFields.length > 0 && (
            <div className="mt-6 border-t pt-6">
              <p className="mb-4 text-sm font-medium">Vlerat</p>
              <DynamicFieldRenderer
                fields={customFields}
                values={customValues}
                onChange={(key, value) => {
                  setCustomValues((v) => ({ ...v, [key]: value }))
                  setDirty(true)
                }}
              />
            </div>
          )}
        </Panel>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
        <Panel title="Publikimi">
          <div className="space-y-4">
            {(
              [
                ["is_active", "Aktiv", "I dukshëm në dyqan"],
                ["is_new", "I ri", "Etiketa “E re”"],
                ["is_featured", "I veçuar", "Shfaqet në ballinë"],
                ["is_bestseller", "Më i shitur", "Në seksionin e të preferuarave"],
              ] as const
            ).map(([key, label, hint]) => (
              <label key={key} className="flex cursor-pointer items-center justify-between gap-4">
                <span>
                  <span className="block text-sm font-medium">{label}</span>
                  <span className="block text-xs text-muted-foreground">{hint}</span>
                </span>
                <Switch checked={form[key]} onCheckedChange={(v) => set(key, v)} />
              </label>
            ))}
          </div>
        </Panel>

        <Panel title="Kategoria">
          <Select value={form.category_id || "none"} onValueChange={(v) => set("category_id", v === "none" ? "" : v)}>
            <SelectTrigger aria-label="Kategoria">
              <SelectValue placeholder="Zgjidhni kategorinë" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Pa kategori</SelectItem>
              {categoryOptions.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  <span className={c.depth ? "pl-4 text-muted-foreground" : ""}>{c.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {categoryOptions.length === 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              Nuk ka kategori.{" "}
              <Link href="/admin/categories" className="underline">
                Krijoni një
              </Link>
            </p>
          )}
        </Panel>

        <div className="rounded-3xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <span className="size-14 shrink-0 overflow-hidden rounded-xl bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.images[0] || "/placeholder.svg"} alt="" className="size-full object-contain p-1 mix-blend-multiply" />
            </span>
            <span className="min-w-0">
              <span className="line-clamp-1 text-sm font-medium">{form.title || "Produkt pa titull"}</span>
              <span className="text-sm tabular-nums">{Number.isFinite(finalPrice) && form.price ? formatPrice(finalPrice) : "—"}</span>
            </span>
          </div>
          <Button type="submit" size="lg" className="mt-5 w-full" disabled={saving || uploading > 0}>
            {saving && <Loader2 className="animate-spin" />}
            {product ? "Ruaj ndryshimet" : "Krijo produktin"}
          </Button>
          {product && (
            <div className="mt-2 flex gap-2">
              <Button asChild type="button" variant="ghost" className="flex-1">
                <Link href={`/products/${product.slug || product.id}`} target="_blank">
                  Shiko në dyqan
                </Link>
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setConfirmDelete(true)}
                aria-label="Fshi produktin"
              >
                <Trash2 />
              </Button>
            </div>
          )}
        </div>
      </aside>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Të fshihet produkti?</AlertDialogTitle>
            <AlertDialogDescription>
              “{product?.title}” do të hiqet nga dyqani përgjithmonë. Porositë ekzistuese nuk preken. Nëse doni vetëm ta
              fshehni, çaktivizoni “Aktiv”.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulo</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={handleDelete}>
              Fshi produktin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  )
}

function Field({
  id,
  label,
  error,
  hint,
  required,
  className,
  children,
}: {
  id: string
  label: string
  error?: string
  hint?: string
  required?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={`pf-${id}`} className="text-[13px]">
        {label}
        {required && <span className="text-primary">*</span>}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

function IconBtn({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  danger?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "grid size-7 place-items-center rounded-full bg-card/95 shadow-sm backdrop-blur transition-colors disabled:opacity-30",
        danger ? "hover:bg-destructive hover:text-white" : "hover:bg-card",
      )}
    >
      {children}
    </button>
  )
}
