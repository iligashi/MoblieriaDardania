"use client"

import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { User, Package, Heart, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AccountPage() {
  const { customer, isLoggedIn, isLoading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/account/login")
    }
  }, [isLoading, isLoggedIn, router])

  if (isLoading || !customer) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#f8f9fa] min-h-[60vh]">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-2xl font-bold mb-2">Llogaria ime</h1>
        <p className="text-muted-foreground mb-8">
          Pershendetje, {customer.first_name} {customer.last_name}!
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            href="/account/orders"
            className="bg-white rounded-xl border border-border/50 p-5 hover:shadow-md hover:border-primary/30 transition-all group"
          >
            <Package className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-bold mb-1 group-hover:text-primary transition-colors">Porosite e mia</h3>
            <p className="text-sm text-muted-foreground">Shiko statusin e porosive tuaja</p>
          </Link>

          <Link
            href="/wishlist"
            className="bg-white rounded-xl border border-border/50 p-5 hover:shadow-md hover:border-primary/30 transition-all group"
          >
            <Heart className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-bold mb-1 group-hover:text-primary transition-colors">Lista e deshirave</h3>
            <p className="text-sm text-muted-foreground">Produktet qe keni ruajtur</p>
          </Link>

          <Link
            href="/account/profile"
            className="bg-white rounded-xl border border-border/50 p-5 hover:shadow-md hover:border-primary/30 transition-all group"
          >
            <User className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-bold mb-1 group-hover:text-primary transition-colors">Profili im</h3>
            <p className="text-sm text-muted-foreground">Ndrysho te dhenat personale</p>
          </Link>

          <div className="bg-white rounded-xl border border-border/50 p-5">
            <LogOut className="h-8 w-8 text-destructive mb-3" />
            <h3 className="font-bold mb-3">Dil nga llogaria</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { logout(); router.push("/") }}
              className="border-destructive/30 text-destructive hover:bg-destructive hover:text-white"
            >
              Dil
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
