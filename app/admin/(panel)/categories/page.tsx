import type { Metadata } from "next"
import { requireAdminPage } from "@/lib/auth/admin"
import { PageHeader } from "@/components/admin/admin-ui"
import { CategoryManager } from "@/components/admin/category-manager"
import type { Category } from "@/lib/types"

export const metadata: Metadata = { title: "Kategoritë" }

export default async function AdminCategoriesPage() {
  const { db } = await requireAdminPage()
  const [cats, products] = await Promise.all([
    db.from("categories").select("*").order("display_order", { ascending: true }),
    db.from("products").select("category_id"),
  ])

  const counts: Record<string, number> = {}
  for (const p of products.data ?? []) if (p.category_id) counts[p.category_id] = (counts[p.category_id] ?? 0) + 1

  return (
    <>
      <PageHeader title="Kategoritë" description="Strukturoni katalogun. Renditja këtu është renditja në dyqan." />
      <CategoryManager initialCategories={(cats.data as Category[]) ?? []} productCounts={counts} />
    </>
  )
}
