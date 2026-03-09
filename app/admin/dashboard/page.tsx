import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LogOut, Plus, Package, Bell, Settings, FolderTree, ImageIcon } from "lucide-react"
import { logoutAction } from "./actions"
import { DashboardClient } from "@/components/admin/dashboard-client"
import { DashboardStats } from "@/components/admin/dashboard-stats"
import { CategoryBreakdown } from "@/components/admin/category-breakdown"
import { OrderRequests } from "@/components/admin/order-requests"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) redirect("/admin/login")

  const { data: adminData } = await supabase.from("admin_users").select("*").eq("id", user.id).single()
  if (!adminData) redirect("/admin/login")

  // Fetch products (renamed from furniture)
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })

  if (productsError) console.error("Error fetching products:", productsError)

  const { data: rawOrders, error: ordersError } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false })

  if (ordersError) console.error("Error fetching orders:", ordersError)

  // Map order_items to items for component compatibility
  const orders = (rawOrders || []).map((order) => ({
    ...order,
    items: order.order_items || [],
  }))

  const categories = Array.from(new Set((products || []).map((item) => item.category).filter(Boolean)))

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <div className="rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-accent p-2 sm:p-3 shadow-lg shrink-0">
              <Package className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg md:text-xl font-black tracking-tight text-foreground truncate">FLUX DEKOR</h1>
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:block">Admin Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground hidden md:inline">{user.email}</span>
            </div>
            <Button variant="outline" size="sm" asChild className="h-9">
              <Link href="/admin/categories">
                <FolderTree className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Kategori</span>
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="h-9">
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
                className="h-9 hover:bg-destructive hover:text-destructive-foreground border-destructive/20"
              >
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Dil</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-1 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Dashboard
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">Menaxho produktet dhe porosite</p>
          </div>
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary shadow-xl text-white font-bold w-full sm:w-auto"
          >
            <Link href="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Shto Produkt
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <DashboardStats furniture={products || []} />
        </div>

        {/* Category Breakdown */}
        <div className="mb-8">
          <CategoryBreakdown furniture={products || []} />
        </div>

        {/* Inventory + Orders */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Menaxhimi i produkteve</h3>
            <DashboardClient furniture={products || []} categories={categories} />
          </div>
          <div className="bg-white rounded-xl border shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Porosite</h3>
            <OrderRequests orders={orders} />
          </div>
        </div>
      </main>
    </div>
  )
}
