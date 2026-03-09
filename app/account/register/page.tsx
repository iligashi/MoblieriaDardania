"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function CustomerRegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (form.password.length < 8) {
      toast.error("Fjalekalimi duhet te jete te pakten 8 karaktere")
      return
    }

    if (form.password !== form.confirm_password) {
      toast.error("Fjalekalimet nuk perputhen")
      return
    }

    setIsLoading(true)

    try {
      const result = await register(form.email, form.password, form.first_name, form.last_name)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Regjistrimi u krye me sukses!")
        router.push("/account")
        router.refresh()
      }
    } catch {
      toast.error("Dicka shkoi gabim, provoni perseri")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12">
      <div className="w-full max-w-md px-4">
        <div className="bg-white rounded-xl border border-border/50 p-6 sm:p-8 shadow-sm">
          <h1 className="text-2xl font-bold mb-2">Regjistrohu</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Krijoni llogarine tuaj per te blere me lehte.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Emri</label>
                <Input
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  required
                  className="h-11"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Mbiemri</label>
                <Input
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  required
                  className="h-11"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="h-11"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Fjalekalimi</label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="h-11"
                placeholder="Minimum 8 karaktere"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Konfirmo fjalekalimin</label>
              <Input
                type="password"
                value={form.confirm_password}
                onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                required
                className="h-11"
              />
            </div>
            <Button type="submit" className="w-full h-11 font-bold" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Duke u regjistruar...
                </>
              ) : (
                "Regjistrohu"
              )}
            </Button>
          </form>

          <p className="text-sm text-center mt-6 text-muted-foreground">
            Keni llogari?{" "}
            <Link href="/account/login" className="text-primary font-medium hover:underline">
              Kycu
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
