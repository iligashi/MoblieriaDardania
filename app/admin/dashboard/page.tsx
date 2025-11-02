import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { FurnitureList } from "@/components/admin/furniture-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LogOut, Plus } from "lucide-react"

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
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <form action="/api/auth/logout" method="post">
              <Button variant="outline" size="sm" type="submit">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Furniture Inventory</h2>
            <p className="text-muted-foreground">Manage your furniture listings</p>
          </div>
          <Button asChild>
            <Link href="/admin/furniture/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Furniture
            </Link>
          </Button>
        </div>

        <FurnitureList furniture={furniture || []} />
      </main>
    </div>
  )
}
