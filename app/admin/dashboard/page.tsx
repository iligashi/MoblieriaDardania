import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { FurnitureList } from "@/components/admin/furniture-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LogOut, Plus, Sofa } from "lucide-react"
import { logoutAction } from "./actions"

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary p-2">
              <Sofa className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Mobileria Dardania</h1>
              <p className="text-xs text-muted-foreground">Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <form action={logoutAction}>
              <Button
                variant="outline"
                size="sm"
                type="submit"
                className="hover:bg-destructive hover:text-destructive-foreground bg-transparent"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold text-balance bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Furniture Inventory
            </h2>
            <p className="mt-2 text-muted-foreground">Manage your furniture listings</p>
          </div>
          <Button
            asChild
            size="lg"
            className="shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
          >
            <Link href="/admin/furniture/new">
              <Plus className="mr-2 h-5 w-5" />
              Add Furniture
            </Link>
          </Button>
        </div>

        <FurnitureList furniture={furniture || []} />
      </main>
    </div>
  )
}
