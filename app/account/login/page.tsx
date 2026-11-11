"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/components/providers/auth-provider"
import { AuthCard, safeNext } from "@/components/account/account-ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const next = safeNext(searchParams.get("next"))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await login(email.trim(), password)
    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }
    toast.success("Mirë se u kthyet!")
    router.replace(result.isAdmin ? "/admin/dashboard" : next)
    router.refresh()
  }

  return (
    <AuthCard
      eyebrow="Mirë se u kthyet"
      title="Kyçu"
      description="Hyni në llogari për të ndjekur porositë dhe produktet e ruajtura."
      footer={
        <>
          Nuk keni llogari?{" "}
          <Link
            href={`/account/register${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Regjistrohuni
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
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="emri@shembull.com"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Fjalëkalimi</Label>
          <div className="relative">
            <Input
              id="password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-11"
              required
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Fshih fjalëkalimin" : "Shfaq fjalëkalimin"}
              className="absolute top-1/2 right-1.5 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:text-foreground"
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading && <Loader2 className="animate-spin" />}
          {loading ? "Duke u kyçur…" : "Kyçu"}
        </Button>
      </form>
    </AuthCard>
  )
}

export default function CustomerLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
