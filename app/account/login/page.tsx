"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function CustomerLoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const result = await login(email, password)

    if (result.error) {
      toast.error(result.error)
      setIsLoading(false)
    } else {
      toast.success("Kycja u krye me sukses!")
      router.push("/account")
      router.refresh()
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12">
      <div className="w-full max-w-md px-4">
        <div className="bg-white rounded-xl border border-border/50 p-6 sm:p-8 shadow-sm">
          <h1 className="text-2xl font-bold mb-2">Kycu</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Futni te dhenat tuaja per tu kycur ne llogarine tuaj.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
                placeholder="email@shembull.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Fjalekalimi</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full h-11 font-bold" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Duke u kycur...
                </>
              ) : (
                "Kycu"
              )}
            </Button>
          </form>

          <p className="text-sm text-center mt-6 text-muted-foreground">
            Nuk keni llogari?{" "}
            <Link href="/account/register" className="text-primary font-medium hover:underline">
              Regjistrohu
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
