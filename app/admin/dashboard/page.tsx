import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { FurnitureList } from "@/components/admin/furniture-list"
import { DashboardStats } from "@/components/admin/dashboard-stats"
import { DashboardFilters } from "@/components/admin/dashboard-filters"
import { CategoryBreakdown } from "@/components/admin/category-breakdown"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LogOut, Plus, Bell, Settings } from "lucide-react"
import Image from "next/image"
import { logoutAction } from "./actions"
import { DashboardClient } from "@/components/admin/dashboard-client"
import { OrderRequests } from "@/components/admin/order-requests"

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

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })

  if (ordersError) {
    console.error("[v0] Error fetching orders:", ordersError)
  }

  const categories = Array.from(new Set((furniture || []).map((item) => item.category)))

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <div className="rounded-lg sm:rounded-xl bg-white p-1.5 sm:p-2 shadow-lg shrink-0 border border-border/50">
              <Image
                src="/flux-removebg-preview.png"
                alt="Flux logo"
                width={40}
                height={40}
                className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
                priority
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg md:text-xl font-black tracking-tight text-foreground truncate">FLUX</h1>
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:block">Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-muted/50">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs sm:text-sm font-medium text-muted-foreground hidden md:inline">{user.email}</span>
            </div>
            <Button variant="outline" size="sm" asChild className="h-9 sm:h-10 px-2 sm:px-3">
              <Link href="/admin/settings">
                <Settings className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Settings</span>
              </Link>
            </Button>
            <form action={logoutAction}>
              <Button
                variant="outline"
                size="sm"
                type="submit"
                className="h-9 sm:h-10 px-2 sm:px-3 hover:bg-destructive hover:text-destructive-foreground border-destructive/20"
              >
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-1 sm:mb-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Dashboard
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg">Manage your furniture inventory</p>
          </div>
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all text-white font-bold w-full sm:w-auto touch-manipulation min-h-[44px]"
          >
            <Link href="/admin/furniture/new">
              <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Add Furniture</span>
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
          <div className="bg-white dark:bg-gray-900 rounded-xl border shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Order Requests</h3>
            <OrderRequests orders={orders || []} />
          </div>
        </div>
      </main>
    </div>
  )
}
