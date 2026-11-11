import type { Metadata } from "next"
import { requireAdminPage } from "@/lib/auth/admin"
import { loadCatalogOptions } from "@/lib/admin-data"
import { PageHeader, Panel } from "@/components/admin/admin-ui"
import { SettingsManager } from "@/components/admin/settings-manager"
import { SHOP, formatPrice } from "@/lib/shop-config"

export const metadata: Metadata = { title: "Cilësimet" }

export default async function SettingsPage() {
  const { db } = await requireAdminPage()
  const { materials, colors } = await loadCatalogOptions(db)

  return (
    <>
      <PageHeader title="Cilësimet" description="Opsionet që përdoren në formularin e produktit dhe filtrat e dyqanit." />
      <div className="grid gap-4 lg:grid-cols-2">
        <SettingsManager
          type="materials"
          label="Materialet"
          description="Shfaqen si sugjerime dhe si filtër në dyqan."
          placeholder="P.sh. dru ahu"
          initialItems={materials}
        />
        <SettingsManager
          type="colors"
          label="Ngjyrat"
          description="Shfaqen si sugjerime dhe si filtër në dyqan."
          placeholder="P.sh. antracit"
          initialItems={colors}
        />
        <Panel title="Rregullat e dyqanit" description="Ndryshohen në lib/shop-config.ts dhe vlejnë për klientin dhe serverin." className="lg:col-span-2">
          <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Transport falas mbi", formatPrice(SHOP.freeShippingThreshold)],
              ["Kosto e transportit", formatPrice(SHOP.shippingCost)],
              ["Paralajmërim stoku", `≤ ${SHOP.lowStockThreshold} copë`],
              ["Kontakti", SHOP.contact.phone],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl bg-muted/60 p-4">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="mt-1 font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      </div>
    </>
  )
}
