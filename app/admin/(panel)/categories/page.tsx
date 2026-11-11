import type { Metadata } from "next"
import { requireAdminPage } from "@/lib/auth/admin"
import { PageHeader } from "@/components/admin/admin-ui"
import { CategoryManager, type ProductRef } from "@/components/admin/category-manager"
import type { Category } from "@/lib/types"

export const metadata: Metadata = { title: "Kategoritë" }

export default async function AdminCategoriesPage() {
  const { db } = await requireAdminPage()
  const [cats, products] = await Promise.all([
    db.from("categories").select("*").order("display_order", { ascending: true }),
    db
      .from("products")
      .select("category, category_id, images")
      .order("is_featured", { ascending: false })
      .order("updated_at", { ascending: false }),
  ])

  return (
    <>
      <PageHeader
        title="Kategoritë"
        description="Si e shohin klientët katalogun. Renditja këtu është renditja në ballinë dhe në dyqan."
      />
      <CategoryManager
        initialCategories={(cats.data as Category[]) ?? []}
        products={(products.data as ProductRef[]) ?? []}
      />
    </>
  )
}
