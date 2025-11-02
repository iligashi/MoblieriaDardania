import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { FurnitureForm } from "@/components/admin/furniture-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function EditFurniturePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/admin/login")
  }

  // Fetch furniture item
  const { data: furniture, error: furnitureError } = await supabase.from("furniture").select("*").eq("id", id).single()

  if (furnitureError || !furniture) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Edit Furniture</h1>
          <p className="text-muted-foreground">Update the furniture item details</p>
        </div>

        <FurnitureForm furniture={furniture} />
      </main>
    </div>
  )
}
