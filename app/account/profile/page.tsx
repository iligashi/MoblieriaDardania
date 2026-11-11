"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/components/providers/auth-provider"
import { AccountShell } from "@/components/account/account-ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

export default function ProfilePage() {
  const { customer, user, refreshCustomer } = useAuth()
  const [form, setForm] = useState({ first_name: "", last_name: "", phone: "" })
  const [saving, setSaving] = useState(false)
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" })
  const [savingPw, setSavingPw] = useState(false)

  useEffect(() => {
    if (customer) {
      setForm({
        first_name: customer.first_name ?? "",
        last_name: customer.last_name ?? "",
        phone: customer.phone ?? "",
      })
    }
  }, [customer])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (form.phone && !/^[+\d\s()-]{6,40}$/.test(form.phone.trim())) {
      toast.error("Numri i telefonit nuk është valid")
      return
    }
    setSaving(true)
    const { error } = await createClient()
      .from("customers")
      .update({
        first_name: form.first_name.trim() || null,
        last_name: form.last_name.trim() || null,
        phone: form.phone.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
    setSaving(false)
    if (error) return toast.error("Ndryshimet nuk u ruajtën. Provoni përsëri.")
    toast.success("Profili u përditësua")
    await refreshCustomer()
  }

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const email = user?.email
    if (!email) return
    if (!pw.current) return toast.error("Shkruani fjalëkalimin aktual")
    if (pw.next.length < 10) return toast.error("Fjalëkalimi i ri duhet të ketë të paktën 10 karaktere")
    if (pw.next === pw.current) return toast.error("Fjalëkalimi i ri duhet të jetë ndryshe nga ai aktual")
    if (pw.next !== pw.confirm) return toast.error("Fjalëkalimet nuk përputhen")
    setSavingPw(true)
    const supabase = createClient()
    // Re-authenticate first, so a hijacked session alone can't take over the account.
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password: pw.current })
    if (authError) {
      setSavingPw(false)
      return toast.error("Fjalëkalimi aktual nuk është i saktë")
    }
    const { error } = await supabase.auth.updateUser({ password: pw.next })
    setSavingPw(false)
    if (error) return toast.error("Fjalëkalimi nuk u ndryshua. Provoni përsëri.")
    setPw({ current: "", next: "", confirm: "" })
    toast.success("Fjalëkalimi u ndryshua")
  }

  return (
    <AccountShell title="Profili im">
      <div className="space-y-5">
        <form onSubmit={handleSave} className="rounded-3xl border bg-card p-6 sm:p-7">
          <h2 className="font-semibold">Të dhënat personale</h2>
          <p className="mt-1 text-sm text-muted-foreground">Përdoren për të plotësuar automatikisht porositë.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="first_name">Emri</Label>
              <Input
                id="first_name"
                autoComplete="given-name"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="last_name">Mbiemri</Label>
              <Input
                id="last_name"
                autoComplete="family-name"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Telefoni</Label>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+383 4X XXX XXX"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={customer?.email ?? user?.email ?? ""} disabled />
            </div>
          </div>
          <Button type="submit" className="mt-6" disabled={saving || !user}>
            {saving && <Loader2 className="animate-spin" />}
            Ruaj ndryshimet
          </Button>
        </form>

        <form onSubmit={handlePassword} className="rounded-3xl border bg-card p-6 sm:p-7">
          <h2 className="font-semibold">Ndrysho fjalëkalimin</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="pw-current">Fjalëkalimi aktual</Label>
              <Input
                id="pw-current"
                type="password"
                autoComplete="current-password"
                value={pw.current}
                onChange={(e) => setPw({ ...pw, current: e.target.value })}
                className="sm:max-w-[calc(50%-0.5rem)]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pw-next">Fjalëkalimi i ri</Label>
              <Input
                id="pw-next"
                type="password"
                autoComplete="new-password"
                minLength={10}
                value={pw.next}
                onChange={(e) => setPw({ ...pw, next: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pw-confirm">Konfirmo</Label>
              <Input
                id="pw-confirm"
                type="password"
                autoComplete="new-password"
                value={pw.confirm}
                onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
              />
            </div>
          </div>
          <Button type="submit" variant="outline" className="mt-6" disabled={savingPw || !pw.next || !pw.current}>
            {savingPw && <Loader2 className="animate-spin" />}
            Përditëso fjalëkalimin
          </Button>
        </form>
      </div>
    </AccountShell>
  )
}
