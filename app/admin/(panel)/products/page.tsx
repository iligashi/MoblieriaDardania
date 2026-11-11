import type { Metadata } from "next"
import Link from "next/link"
import { Plus } from "lucide-react"
import { requireAdminPage } from "@/lib/auth/admin"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/admin/admin-ui"
import { ProductsTable } from "@/components/admin/products-table"
import type { Category, Product } from "@/lib/types"

export const metadata: Metadata = { title: "Produktet" }

export default async function AdminProductsPage() {
  const { db } = await requireAdminPage()
  const [products, categories] = await Promise.all([
    db.from("products").select("*").order("created_at", { ascending: false }),
    db.from("categories").select("*").order("display_order", { ascending: true }),
  ])

  return (
    <>
      <PageHeader
        title="Produktet"
        description="Menaxhoni katalogun, çmimet dhe stokun."
        actions={
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus /> Produkt i ri
            </Link>
          </Button>
        }
      />
      <ProductsTable initialProducts={(products.data as Product[]) ?? []} categories={(categories.data as Category[]) ?? []} />
    </>
  )
}
