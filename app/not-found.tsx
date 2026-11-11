import Link from "next/link"
import { ArrowLeft, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <section className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="eyebrow">Gabim 404</p>
      <h1 className="mt-4 font-display text-6xl sm:text-7xl">Faqja nuk u gjet</h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        Faqja që kërkoni mund të jetë zhvendosur ose nuk ekziston më. Le t&apos;ju kthejmë në rrugën e duhur.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg">
          <Link href="/">
            <ArrowLeft /> Kthehu në ballinë
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/shop">
            <Search /> Shfleto produktet
          </Link>
        </Button>
      </div>
    </section>
  )
}
