import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { requireAdminPage } from "@/lib/auth/admin"
import { loadCatalogOptions } from "@/lib/admin-data"
import { isUuid } from "@/lib/validation"
import { PageHeader } from "@/components/admin/admin-ui"
import { ProductForm } from "@/components/admin/product-form"
import type { Product } from "@/lib/types"

export const metadata: Metadata = { title: "Ndrysho produktin" }

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!isUuid(id)) notFound()
  const { db } = await requireAdminPage()
  const [{ data }, options] = await Promise.all([
    db.from("products").select("*").eq("id", id).maybeSingle(),
    loadCatalogOptions(db),
  ])
  const product = data as Product | null
  if (!product) notFound()

  return (
    <>
      <PageHeader
        title={product.title}
        description={product.is_active ? "Aktiv në dyqan" : "Joaktiv — i fshehur nga klientët"}
        back={{ href: "/admin/products", label: "Produktet" }}
      />
      <ProductForm product={product} {...options} />
    </>
  )
}
