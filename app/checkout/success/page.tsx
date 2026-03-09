import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, Package } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Porosia u krye" }

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>
}) {
  const params = await searchParams
  const orderNumber = params.order

  return (
    <div className="container mx-auto px-4 py-16 text-center max-w-lg">
      <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold mb-3">Faleminderit per porosine!</h1>
      <p className="text-muted-foreground mb-2">
        Porosia juaj u pranua me sukses dhe do te processohet se shpejti.
      </p>

      {orderNumber && (
        <p className="text-sm font-medium bg-muted rounded-lg p-3 mb-6 inline-block">
          Numri i porosise: <span className="font-bold text-primary">{orderNumber}</span>
        </p>
      )}

      <p className="text-sm text-muted-foreground mb-8">
        Do te kontaktoheni permes telefonit ose emailit per konfirmimin e porosise.
        Dergesa behet brenda 24-48 oreve ne Kosove.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild>
          <Link href="/shop">
            Vazhdo blerjen
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/account/orders">
            <Package className="h-4 w-4 mr-2" />
            Shiko porosite
          </Link>
        </Button>
      </div>
    </div>
  )
}
