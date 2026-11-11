import type { Metadata } from "next"
import { requireAdminPage } from "@/lib/auth/admin"
import { loadCatalogOptions } from "@/lib/admin-data"
import { PageHeader } from "@/components/admin/admin-ui"
import { ProductForm } from "@/components/admin/product-form"

export const metadata: Metadata = { title: "Produkt i ri" }

export default async function NewProductPage() {
  const { db } = await requireAdminPage()
  const options = await loadCatalogOptions(db)

  return (
    <>
      <PageHeader title="Produkt i ri" back={{ href: "/admin/products", label: "Produktet" }} />
      <ProductForm {...options} />
    </>
  )
}
