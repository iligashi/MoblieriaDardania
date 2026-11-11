"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, MailCheck } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/components/providers/auth-provider"
import { AuthCard, safeNext } from "@/components/account/account-ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

function strength(pw: string) {
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score++
  return score
}

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { register } = useAuth()
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", password: "", confirm: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const next = safeNext(searchParams.get("next"))
  const score = strength(form.password)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (form.password.length < 8) return setError("Fjalëkalimi duhet të ketë të paktën 8 karaktere.")
    if (form.password !== form.confirm) return setError("Fjalëkalimet nuk përputhen.")

    setLoading(true)
    const result = await register(form.email, form.password, form.first_name, form.last_name)
    setLoading(false)
    if (result.error) return setError(result.error)
    if (result.needsConfirmation) return setSentTo(form.email.trim())
    toast.success("Llogaria u krijua me sukses!")
    router.replace(next)
    router.refresh()
  }

  if (sentTo) {
    return (
      <AuthCard
        eyebrow="Edhe një hap"
        title="Kontrolloni email-in"
        description="Ju dërguam një link për të konfirmuar llogarinë."
        footer={
          <Link href="/account/login" className="font-medium text-foreground underline-offset-4 hover:underline">
            Kthehu te kyçja
          </Link>
        }
      >
        <div className="flex flex-col items-center text-center">
          <span className="grid size-14 place-items-center rounded-full bg-success-soft text-success">
            <MailCheck className="size-6" />
          </span>
          <p className="mt-4 text-sm text-muted-foreground">
            Hapni email-in që dërguam te <strong className="text-foreground">{sentTo}</strong> dhe klikoni linkun për të
            aktivizuar llogarinë.
          </p>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      eyebrow="Mirë se vini"
      title="Krijo llogari"
      description="Ruani produktet e preferuara dhe ndiqni porositë tuaja."
      footer={
        <>
          Keni llogari?{" "}
          <Link href="/account/login" className="font-medium text-foreground underline-offset-4 hover:underline">
            Kyçuni
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p role="alert" className="rounded-xl bg-destructive/8 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="first_name">Emri</Label>
            <Input id="first_name" autoComplete="given-name" value={form.first_name} onChange={set("first_name")} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="last_name">Mbiemri</Label>
            <Input id="last_name" autoComplete="family-name" value={form.last_name} onChange={set("last_name")} required />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" value={form.email} onChange={set("email")} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Fjalëkalimi</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={set("password")}
            minLength={8}
            required
          />
          <div className="flex gap-1 pt-1" aria-hidden>
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  i < score ? (score <= 1 ? "bg-destructive" : score === 2 ? "bg-warning" : "bg-success") : "bg-border",
                )}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Të paktën 8 karaktere. Përdorni shkronja të mëdha dhe numra.</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm">Konfirmo fjalëkalimin</Label>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            value={form.confirm}
            onChange={set("confirm")}
            aria-invalid={!!form.confirm && form.confirm !== form.password}
            required
          />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading && <Loader2 className="animate-spin" />}
          {loading ? "Duke krijuar llogarinë…" : "Krijo llogarinë"}
        </Button>
      </form>
    </AuthCard>
  )
}

export default function CustomerRegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}
