import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { FurnitureList } from "@/components/admin/furniture-list"
import { DashboardStats } from "@/components/admin/dashboard-stats"
import { DashboardFilters } from "@/components/admin/dashboard-filters"
import { CategoryBreakdown } from "@/components/admin/category-breakdown"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LogOut, Plus, Sofa, Bell, Settings } from "lucide-react"
import { logoutAction } from "./actions"
import { DashboardClient } from "@/components/admin/dashboard-client"

export default async function AdminDashboardPage() {
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

  // Fetch all furniture items
  const { data: furniture, error: furnitureError } = await supabase
    .from("furniture")
    .select("*")
    .order("created_at", { ascending: false })

  if (furnitureError) {
    console.error("[v0] Error fetching furniture:", furnitureError)
  }

  const categories = Array.from(new Set((furniture || []).map((item) => item.category)))

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-gradient-to-br from-primary to-accent p-3 shadow-lg">
              <Sofa className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-foreground">MOBILERIA DARDANIA</h1>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">{user.email}</span>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
            <form action={logoutAction}>
              <Button
                variant="outline"
                size="sm"
                type="submit"
                className="hover:bg-destructive hover:text-destructive-foreground border-destructive/20"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Dashboard
            </h2>
            <p className="text-muted-foreground text-lg">Manage your furniture inventory</p>
          </div>
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all text-white font-bold"
          >
            <Link href="/admin/furniture/new">
              <Plus className="mr-2 h-5 w-5" />
              Add Furniture
            </Link>
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="mb-8">
          <DashboardStats furniture={furniture || []} />
        </div>

        {/* Category Breakdown */}
        <div className="mb-8">
          <CategoryBreakdown furniture={furniture || []} />
        </div>

        {/* Filters and Table */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl border shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Inventory Management</h3>
            <DashboardClient furniture={furniture || []} categories={categories} />
          </div>
        </div>
      </main>
    </div>
  )
}
