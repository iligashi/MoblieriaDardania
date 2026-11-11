"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, Lock, ShieldAlert } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wordmark } from "@/components/logo"

function safeAdminNext(next: string | null) {
  return next && next.startsWith("/admin") && !next.startsWith("/admin/login") ? next : "/admin/dashboard"
}

function AdminLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "forbidden" ? "Kjo llogari nuk ka qasje në panelin e administratorit." : null,
  )

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (signInError || !data.user) {
      setError("Email-i ose fjalëkalimi është i pasaktë.")
      setLoading(false)
      return
    }
    const { data: admin } = await supabase.from("admin_users").select("id").eq("id", data.user.id).maybeSingle()
    if (!admin) {
      await supabase.auth.signOut()
      setError("Kjo llogari nuk ka qasje në panelin e administratorit.")
      setLoading(false)
      return
    }
    router.replace(safeAdminNext(searchParams.get("next")))
    router.refresh()
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink p-12 text-ink-foreground lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden className="pointer-events-none absolute -top-32 -right-32 size-96 rounded-full bg-primary/40 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute bottom-0 -left-24 size-80 rounded-full bg-highlight/15 blur-3xl" />
        <div className="relative">
          <Wordmark inverted />
        </div>
        <div className="relative">
          <p className="font-display text-5xl leading-[1.05]">
            Gjithçka për dyqanin,
            <br />
            në një vend.
          </p>
          <p className="mt-4 max-w-sm text-white/60">Porositë, produktet, stoku dhe kategoritë — të menaxhuara shpejt dhe qartë.</p>
        </div>
        <p className="relative text-xs text-white/40">© {new Date().getFullYear()} Flux Dekor</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm">
          <span className="grid size-12 place-items-center rounded-2xl bg-muted">
            <Lock className="size-5" />
          </span>
          <h1 className="mt-6 font-display text-4xl leading-none">Hyrja e administratorit</h1>
          <p className="mt-2 text-sm text-muted-foreground">Përdorni llogarinë e autorizuar të stafit.</p>

          {error && (
            <p role="alert" className="mt-6 flex items-start gap-2 rounded-xl bg-destructive/8 px-4 py-3 text-sm text-destructive">
              <ShieldAlert className="mt-0.5 size-4 shrink-0" /> {error}
            </p>
          )}

          <div className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Fjalëkalimi</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading && <Loader2 className="animate-spin" />}
              {loading ? "Duke hyrë…" : "Hyr"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginForm />
    </Suspense>
  )
}
