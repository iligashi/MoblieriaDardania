import type { Product } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { WhatsAppIcon } from "@/components/icons"
import { SITE_URL } from "@/lib/site"
import { formatPrice, unitPrice, whatsappLink } from "@/lib/shop-config"

export function WhatsAppButton({ product }: { product: Product }) {
  const message = [
    `Përshëndetje, jam i/e interesuar për "${product.title}".`,
    `Çmimi: ${formatPrice(unitPrice(product))}`,
    product.sku ? `SKU: ${product.sku}` : null,
    `${SITE_URL}/products/${product.slug || product.id}`,
  ]
    .filter(Boolean)
    .join("\n")

  return (
    <Button asChild size="lg" variant="outline" className="w-full border-[#25d366]/40 hover:border-[#25d366] hover:bg-[#25d366]/8">
      <a href={whatsappLink(message)} target="_blank" rel="noopener noreferrer">
        <WhatsAppIcon className="size-[18px] text-[#25d366]" />
        Porosit në WhatsApp
      </a>
    </Button>
  )
}
