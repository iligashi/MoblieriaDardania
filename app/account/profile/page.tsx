"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

export default function ProfilePage() {
  const { customer, isLoggedIn, isLoading: authLoading, refreshCustomer } = useAuth()
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
  })

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push("/account/login")
    }
    if (customer) {
      setForm({
        first_name: customer.first_name || "",
        last_name: customer.last_name || "",
        phone: customer.phone || "",
      })
    }
  }, [authLoading, isLoggedIn, customer, router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("customers")
        .update({
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", customer!.id)

      if (error) throw error
      toast.success("Profili u ndryshua me sukses")
      await refreshCustomer()
    } catch {
      toast.error("Dicka shkoi gabim")
    } finally {
      setIsSaving(false)
    }
  }

  if (authLoading || !customer) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse h-48 bg-muted rounded-xl" />
      </div>
    )
  }

  return (
    <div className="bg-[#f8f9fa] min-h-[60vh]">
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/account">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kthehu
          </Link>
        </Button>

        <div className="bg-white rounded-xl border border-border/50 p-6">
          <h1 className="text-xl font-bold mb-6">Profili im</h1>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <Input value={customer.email} disabled className="h-11 bg-muted/30" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Emri</label>
                <Input
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  className="h-11"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Mbiemri</label>
                <Input
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  className="h-11"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Telefoni</label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="h-11"
                placeholder="+383 4X XXX XXX"
              />
            </div>
            <Button type="submit" className="w-full h-11 font-bold" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Duke ruajtur...
                </>
              ) : (
                "Ruaj ndryshimet"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
