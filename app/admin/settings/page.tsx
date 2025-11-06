import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SettingsManager } from "@/components/admin/settings-manager"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LogOut, ArrowLeft, Layers, Palette, Package } from "lucide-react"
import { logoutAction } from "../dashboard/actions"

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/admin/login")
  }

  // Verify user is an admin
  const { data: adminData } = await supabase.from("admin_users").select("*").eq("id", user.id).single()

  if (!adminData) {
    redirect("/admin/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-black tracking-tight text-foreground">Settings</h1>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Manage Options</p>
            </div>
          </div>
          <form action={logoutAction}>
            <Button variant="outline" size="sm" type="submit" className="hover:bg-destructive hover:text-destructive-foreground border-destructive/20">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </form>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Settings
          </h2>
          <p className="text-muted-foreground text-lg">Manage categories, materials, and colors</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <SettingsManager
            type="categories"
            label="Categories"
            icon={<Layers className="h-5 w-5 text-primary" />}
          />
          <SettingsManager
            type="materials"
            label="Materials"
            icon={<Package className="h-5 w-5 text-primary" />}
          />
          <SettingsManager
            type="colors"
            label="Colors"
            icon={<Palette className="h-5 w-5 text-primary" />}
          />
        </div>
      </main>
    </div>
  )
}
