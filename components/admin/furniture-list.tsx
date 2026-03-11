"use client"

import type { Furniture } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Eye, MoreVertical, Package } from "lucide-react"
import Link from "next/link"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface FurnitureListProps {
  furniture: Furniture[]
  searchQuery?: string
  categoryFilter?: string
  stockFilter?: string
}

export function FurnitureList({ furniture, searchQuery = "", categoryFilter = "all", stockFilter = "all" }: FurnitureListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const filteredFurniture = useMemo(() => {
    return furniture.filter((item) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const matches =
          item.title.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
        if (!matches) return false
      }
      if (categoryFilter !== "all" && item.category !== categoryFilter) return false
      if (stockFilter === "low-stock" && item.stock >= 5) return false
      if (stockFilter === "out-of-stock" && item.stock > 0) return false
      if (stockFilter === "in-stock" && item.stock === 0) return false
      return true
    })
  }, [furniture, searchQuery, categoryFilter, stockFilter])

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/products/${deleteId}`, { method: "DELETE" })
      if (!response.ok) throw new Error()
      router.refresh()
      setDeleteId(null)
    } catch {
      alert("Deshtoi fshirja e produktit.")
    } finally {
      setIsDeleting(false)
    }
  }

  if (furniture.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 bg-muted/30 py-12 text-center">
        <Package className="h-10 w-10 text-muted-foreground/50" />
        <p className="text-muted-foreground">Nuk ka produkte ende. Shtoni produktin e pare.</p>
      </div>
    )
  }

  if (filteredFurniture.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 bg-muted/30 py-12 text-center">
        <p className="text-muted-foreground">Nuk u gjet asnje produkt me keto filtra.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-2">
        {filteredFurniture.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-white hover:border-border transition-colors"
          >
            {/* Image */}
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-lg overflow-hidden border border-border/30 shrink-0 bg-[#f8f9fa]">
              {item.images[0] ? (
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <Package className="h-5 w-5 text-muted-foreground/40" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-semibold truncate">{item.title}</h4>
                {item.stock === 0 && (
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Pa stok</Badge>
                )}
                {item.stock > 0 && item.stock < 5 && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Stok i ulet ({item.stock})</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-sm font-bold text-primary">
                  {item.discount_price ? (
                    <>
                      {Number(item.discount_price).toFixed(2)} €
                      <span className="text-xs text-muted-foreground line-through ml-1">{Number(item.price).toFixed(2)} €</span>
                    </>
                  ) : (
                    `${Number(item.price).toFixed(2)} €`
                  )}
                </span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground capitalize">{item.category}</span>
                {item.stock > 4 && (
                  <>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">Stok: {item.stock}</span>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/products/${(item as any).slug || item.id}`} className="flex items-center">
                    <Eye className="mr-2 h-4 w-4" /> Shiko
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/admin/products/${item.id}/edit`} className="flex items-center">
                    <Edit className="mr-2 h-4 w-4" /> Ndrysho
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDeleteId(item.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Fshi
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>

      {/* Count */}
      <p className="text-xs text-muted-foreground mt-3">
        Duke shfaqur {filteredFurniture.length} nga {furniture.length} produkte
      </p>

      {/* Delete dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Jeni te sigurt?</AlertDialogTitle>
            <AlertDialogDescription>
              Ky veprim nuk mund te kthehet. Produkti do te fshihet perfundimisht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Anulo</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Duke fshire..." : "Fshi"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
