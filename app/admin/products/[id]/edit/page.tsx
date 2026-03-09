import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { FurnitureForm } from "@/components/admin/furniture-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) redirect("/admin/login")

  const { data: adminData } = await supabase.from("admin_users").select("*").eq("id", user.id).single()
  if (!adminData) redirect("/admin/login")

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single()

  if (productError || !product) notFound()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kthehu
            </Link>
          </Button>
          <h1 className="text-lg font-bold">Ndrysho Produktin</h1>
          <div />
        </div>
      </header>
      <main className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
        <FurnitureForm furniture={product} />
      </main>
    </div>
  )
}
