"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Banknote, ChevronLeft, Landmark, Loader2, Lock, ShoppingBag } from "lucide-react"
import { toast } from "sonner"
import { useCart } from "@/components/providers/cart-provider"
import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { EmptyState } from "@/components/empty-state"
import { FreeShippingProgress, OrderTotals } from "@/components/cart-ui"
import { formatPrice, unitPrice } from "@/lib/shop-config"
import { cn } from "@/lib/utils"

type Form = {
  first_name: string
  last_name: string
  email: string
  phone: string
  street: string
  city: string
  postal_code: string
  notes: string
  payment_method: "cash_on_delivery" | "bank_transfer"
}

const REQUIRED: (keyof Form)[] = ["first_name", "last_name", "phone", "street", "city"]
const PHONE_RE = /^[+\d\s()-]{6,40}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(form: Form) {
  const errors: Partial<Record<keyof Form, string>> = {}
  for (const key of REQUIRED) if (!form[key].trim()) errors[key] = "Kjo fushë është e detyrueshme"
  if (form.phone.trim() && !PHONE_RE.test(form.phone.trim())) errors.phone = "Numri i telefonit nuk është valid"
  if (form.email.trim() && !EMAIL_RE.test(form.email.trim())) errors.email = "Email-i nuk është valid"
  return errors
}

export function CheckoutClient() {
  const router = useRouter()
  const { items, subtotal, isLoading, clearCart } = useCart()
  const { customer, user } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({})
  const prefilled = useRef(false)

  const [form, setForm] = useState<Form>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    postal_code: "",
    notes: "",
    payment_method: "cash_on_delivery",
  })

  // Prefill once the customer profile has loaded — without overwriting what was typed.
  useEffect(() => {
    if (prefilled.current || (!customer && !user)) return
    prefilled.current = true
    setForm((f) => ({
      ...f,
      first_name: f.first_name || customer?.first_name || "",
      last_name: f.last_name || customer?.last_name || "",
      email: f.email || customer?.email || user?.email || "",
      phone: f.phone || customer?.phone || "",
    }))
  }, [customer, user])

  const update = (field: keyof Form, value: string) => {
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }))
  }

  if (isLoading) {
    return (
      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_420px]">
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-3xl bg-muted" />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-3xl bg-muted" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Shporta është bosh"
          description="Shtoni produkte në shportë para se të bëni porosinë."
          action={{ href: "/shop", label: "Kthehu në dyqan" }}
        />
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Read synchronously: the event's currentTarget is gone after the first await.
    const honeypot = new FormData(e.currentTarget).get("website")
    const found = validate(form)
    setErrors(found)
    if (Object.keys(found).length) {
      toast.error("Ju lutem kontrolloni fushat e shënuara")
      document.querySelector<HTMLElement>(`[name="${Object.keys(found)[0]}"]`)?.focus()
      return
    }

    setSubmitting(true)
    const address = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      street: form.street.trim(),
      city: form.city.trim(),
      postal_code: form.postal_code.trim(),
      country: "Kosovë",
      phone: form.phone.trim(),
    }

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
          customer_name: `${address.first_name} ${address.last_name}`,
          customer_email: form.email.trim() || null,
          customer_phone: address.phone,
          shipping_address: address,
          billing_address: address,
          payment_method: form.payment_method,
          notes: form.notes.trim() || null,
          // Honeypot: real visitors never see or fill this field.
          website: typeof honeypot === "string" ? honeypot : "",
        }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error || "Porosia dështoi. Provoni përsëri.")

      const ref = data?.order?.order_number || ""
      router.replace(`/checkout/success${ref ? `?order=${encodeURIComponent(ref)}` : ""}`)
      // The server already emptied a signed-in customer's cart; this also clears a guest cart.
      void clearCart()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Diçka shkoi gabim")
      setSubmitting(false)
    }
  }

  return (
    <div className="container-page pt-8 lg:pt-12">
      <Link href="/cart" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> Kthehu te shporta
      </Link>
      <h1 className="mt-3 font-display text-5xl leading-none sm:text-6xl">Përfundo porosinë</h1>

      <form onSubmit={handleSubmit} noValidate className="mt-10 grid gap-10 lg:grid-cols-[1fr_420px] lg:gap-14">
        <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor="website">Website</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
        </div>
        <div className="space-y-5">
          <Section step={1} title="Të dhënat e kontaktit">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Emri" name="first_name" value={form.first_name} error={errors.first_name} onChange={update} autoComplete="given-name" required />
              <Field label="Mbiemri" name="last_name" value={form.last_name} error={errors.last_name} onChange={update} autoComplete="family-name" required />
              <Field label="Telefoni" name="phone" type="tel" value={form.phone} error={errors.phone} onChange={update} autoComplete="tel" placeholder="+383 4X XXX XXX" required />
              <Field label="Email" name="email" type="email" value={form.email} error={errors.email} onChange={update} autoComplete="email" hint="Për konfirmimin e porosisë" />
            </div>
          </Section>

          <Section step={2} title="Adresa e dërgesës">
            <div className="grid gap-4 sm:grid-cols-[1fr_1fr_140px]">
              <Field className="sm:col-span-3" label="Rruga dhe numri" name="street" value={form.street} error={errors.street} onChange={update} autoComplete="street-address" required />
              <Field className="sm:col-span-2" label="Qyteti" name="city" value={form.city} error={errors.city} onChange={update} autoComplete="address-level2" required />
              <Field label="Kodi postar" name="postal_code" value={form.postal_code} onChange={update} autoComplete="postal-code" />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Momentalisht dërgojmë vetëm brenda Kosovës.</p>
          </Section>

          <Section step={3} title="Mënyra e pagesës">
            <RadioGroup
              value={form.payment_method}
              onValueChange={(v) => update("payment_method", v)}
              className="gap-2.5"
            >
              {[
                { value: "cash_on_delivery", icon: Banknote, title: "Para në dorë", text: "Paguani kur ta pranoni porosinë" },
                { value: "bank_transfer", icon: Landmark, title: "Transfer bankar", text: "Ju dërgojmë të dhënat pas konfirmimit" },
              ].map((opt) => (
                <Label
                  key={opt.value}
                  htmlFor={`pay-${opt.value}`}
                  className={cn(
                    "flex cursor-pointer items-center gap-4 rounded-2xl border bg-card p-4 font-normal transition-colors",
                    form.payment_method === opt.value ? "border-foreground ring-1 ring-foreground" : "hover:border-foreground/30",
                  )}
                >
                  <RadioGroupItem id={`pay-${opt.value}`} value={opt.value} />
                  <span className="grid size-10 place-items-center rounded-full bg-muted">
                    <opt.icon className="size-[18px]" />
                  </span>
                  <span>
                    <span className="block text-sm font-medium">{opt.title}</span>
                    <span className="block text-xs text-muted-foreground">{opt.text}</span>
                  </span>
                </Label>
              ))}
            </RadioGroup>
          </Section>

          <Section step={4} title="Shënime (opsionale)">
            <Textarea
              name="notes"
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="P.sh. orari i preferuar i dërgesës, kati, hyrja…"
              rows={3}
              maxLength={1000}
            />
          </Section>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-3xl border bg-card p-6 shadow-[var(--shadow-soft)]">
            <h2 className="font-display text-3xl">Porosia juaj</h2>
            <ul className="mt-5 max-h-80 space-y-4 overflow-y-auto pr-1">
              {items.map((item) => {
                const p = item.product
                if (!p) return null
                const price = unitPrice(p)
                return (
                  <li key={item.id} className="flex items-center gap-3.5">
                    <div className="relative size-16 shrink-0 rounded-xl bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.images?.[0] || "/placeholder.svg"} alt="" className="size-full rounded-xl object-contain p-1.5 mix-blend-multiply" />
                      <span className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-ink text-[10px] font-semibold text-ink-foreground tabular-nums">
                        {item.quantity}
                      </span>
                    </div>
                    <p className="line-clamp-2 flex-1 text-sm">{p.title}</p>
                    <span className="text-sm font-medium tabular-nums">{formatPrice(price * item.quantity)}</span>
                  </li>
                )
              })}
            </ul>
            <FreeShippingProgress subtotal={subtotal} className="mt-5" />
            <OrderTotals subtotal={subtotal} className="mt-5 border-t pt-5" />
            <Button type="submit" size="xl" className="mt-6 w-full" disabled={submitting}>
              {submitting ? <Loader2 className="animate-spin" /> : <Lock />}
              {submitting ? "Duke dërguar porosinë…" : "Konfirmo porosinë"}
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Çmimet dhe stoku verifikohen sërish kur dërgoni porosinë.
            </p>
          </div>
        </aside>
      </form>
    </div>
  )
}

function Section({ step, title, children }: { step: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border bg-card p-5 sm:p-7">
      <h2 className="mb-5 flex items-center gap-3 text-base font-semibold">
        <span className="grid size-7 place-items-center rounded-full bg-ink text-xs text-ink-foreground">{step}</span>
        {title}
      </h2>
      {children}
    </section>
  )
}

function Field({
  label,
  name,
  value,
  onChange,
  error,
  hint,
  required,
  className,
  ...rest
}: {
  label: string
  name: keyof Form
  value: string
  onChange: (name: keyof Form, value: string) => void
  error?: string
  hint?: string
  required?: boolean
  className?: string
} & Omit<React.ComponentProps<"input">, "name" | "value" | "onChange">) {
  const id = `f-${name}`
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="text-[13px]">
        {label}
        {required && <span className="text-primary">*</span>}
      </Label>
      <Input
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        required={required}
        {...rest}
      />
      {error ? (
        <p id={`${id}-err`} className="text-xs text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}
