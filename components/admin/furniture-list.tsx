"use client"

import type { Furniture } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Eye, MoreVertical } from "lucide-react"
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
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase()
        const matchesSearch =
          item.title.toLowerCase().includes(searchLower) ||
          item.category.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Category filter
      if (categoryFilter !== "all" && item.category !== categoryFilter) {
        return false
      }

      // Stock filter
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
      const response = await fetch(`/api/products/${deleteId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete furniture")
      }

      router.refresh()
      setDeleteId(null)
    } catch (error) {
      console.error("[v0] Error deleting furniture:", error)
      alert("Failed to delete furniture. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  if (furniture.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed bg-card/50 p-12 text-center">
        <p className="text-muted-foreground text-lg">No furniture items yet. Add your first item to get started.</p>
      </div>
    )
  }

  if (filteredFurniture.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed bg-card/50 p-12 text-center">
        <p className="text-muted-foreground text-lg">No items match your filters. Try adjusting your search criteria.</p>
      </div>
    )
  }

  const getStockBadgeVariant = (stock: number) => {
    if (stock === 0) return "destructive"
    if (stock < 5) return "secondary"
    return "default"
  }

  return (
    <>
      <div className="rounded-xl border bg-white dark:bg-gray-900 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[80px] sm:w-[100px]">Image</TableHead>
                  <TableHead className="min-w-[150px] sm:min-w-[200px]">Title</TableHead>
                  <TableHead className="hidden sm:table-cell">Category</TableHead>
                  <TableHead className="hidden md:table-cell">Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right w-[100px] sm:w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {filteredFurniture.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell>
                    <div className="relative h-16 w-16 rounded-lg overflow-hidden border border-border">
                      {item.images[0] ? (
                        <img
                          src={item.images[0] || "/placeholder.svg"}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">No Image</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-semibold text-sm sm:text-base text-foreground">{item.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1 mt-1">{item.description}</div>
                      <div className="sm:hidden mt-1 flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="capitalize text-xs">
                          {item.category}
                        </Badge>
                        <span className="text-xs font-semibold text-foreground">{item.price.toFixed(2)} €</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="outline" className="capitalize">
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="font-semibold text-foreground">{item.price.toFixed(2)} €</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStockBadgeVariant(item.stock)}>
                      {item.stock === 0 ? "Out of Stock" : item.stock < 5 ? `Low (${item.stock})` : item.stock}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-9 w-9 sm:h-8 sm:w-8 p-0 touch-manipulation min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/products/${(item as any).slug || item.id}`} className="flex items-center">
                            <Eye className="mr-2 h-4 w-4" />
                            Shiko
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/products/${item.id}/edit`} className="flex items-center">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteId(item.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </div>
        {filteredFurniture.length > 0 && (
          <div className="border-t bg-muted/30 px-6 py-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredFurniture.length} of {furniture.length} items
            </p>
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the furniture item from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
