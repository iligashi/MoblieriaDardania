"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { sendOrderEmail } from "@/lib/email"
import { toast } from "sonner"
import { Loader2, Mail, MessageCircle, ShoppingCart } from "lucide-react"

interface OrderRequestButtonProps {
  furniture: {
    id: string
    title: string
    price: number
    stock: number
    category: string
    images?: string[]
  }
}

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER

export function OrderRequestButton({ furniture }: OrderRequestButtonProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sendViaEmail, setSendViaEmail] = useState(false)
  const [sendViaWhatsApp, setSendViaWhatsApp] = useState(true)
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })

  const primaryImage = useMemo(() => {
    return furniture.images?.[0] || "/placeholder.svg"
  }, [furniture.images])

  const resetForm = () => {
    setFormValues({
      name: "",
      email: "",
      phone: "",
      message: "",
    })
    setSendViaEmail(false)
    setSendViaWhatsApp(true)
  }

  const handleSubmit = async () => {
    if (!formValues.name.trim()) {
      toast.error("Please provide your name so we know who to contact.")
      return
    }

    if (!formValues.email.trim() && !formValues.phone.trim()) {
      toast.error("Share at least one contact method (email or phone).")
      return
    }

    if (!sendViaEmail && !sendViaWhatsApp) {
      toast.error("Choose at least one delivery option (WhatsApp or Email).")
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        furnitureId: furniture.id,
        furnitureTitle: furniture.title,
        furniturePrice: furniture.price,
        customerName: formValues.name.trim(),
        customerEmail: formValues.email.trim() || null,
        customerPhone: formValues.phone.trim() || null,
        customerMessage: formValues.message.trim() || null,
        sendViaEmail,
        sendViaWhatsApp,
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || "Failed to send order request. Please try again.")
      }

      if (sendViaEmail) {
        try {
          await sendOrderEmail({
            furnitureTitle: furniture.title,
            furniturePrice: furniture.price,
            customerName: formValues.name.trim(),
            customerEmail: formValues.email.trim() || undefined,
            customerPhone: formValues.phone.trim() || undefined,
            customerMessage: formValues.message.trim() || undefined,
          })
          toast.success("Email confirmation sent successfully.")
        } catch (error) {
          console.error("EmailJS error:", error)
          toast.error("Your request was saved, but we couldn't send the email. Please verify EmailJS settings.")
        }
      }

      if (sendViaWhatsApp) {
        if (!whatsappNumber) {
          toast.error("WhatsApp number is not configured. Please set NEXT_PUBLIC_WHATSAPP_NUMBER.")
        } else {
          const messageLines = [
            `Hi, I'm interested in "${furniture.title}" (${furniture.category}).`,
            `Price: $${furniture.price.toFixed(2)}`,
            formValues.message.trim() ? `Notes: ${formValues.message.trim()}` : null,
            formValues.name.trim() ? `Name: ${formValues.name.trim()}` : null,
            formValues.email.trim() ? `Email: ${formValues.email.trim()}` : null,
            formValues.phone.trim() ? `Phone: ${formValues.phone.trim()}` : null,
          ].filter(Boolean)

          const encodedMessage = encodeURIComponent(messageLines.join("\n"))
          const cleanNumber = whatsappNumber.replace(/[^+\d]/g, "")
          window.open(`https://wa.me/${cleanNumber}?text=${encodedMessage}`, "_blank")
        }
      }

      toast.success("Order request sent! We'll get back to you soon.")
      setOpen(false)
      resetForm()
    } catch (error) {
      console.error("Order request error:", error)
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) {
          resetForm()
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="w-full h-11 sm:h-12 text-sm sm:text-base font-bold bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary active:from-accent active:to-primary shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all touch-manipulation min-h-[44px]"
          disabled={furniture.stock === 0}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {furniture.stock > 0 ? "Add to Cart" : "Out of Stock"}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[min(95vw,980px)] border-none p-0 overflow-hidden">
        <div className="flex h-[80vh] flex-col overflow-hidden bg-white">
          <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-8">
            <div className="flex flex-col gap-6">
              <DialogHeader className="items-start space-y-3 text-left">
                <DialogTitle className="text-2xl sm:text-3xl font-semibold">Order Details</DialogTitle>
                <DialogDescription className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  Review the product information and tell us how to contact you. Our team will confirm your request shortly.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 lg:grid-cols-[360px,minmax(0,1fr)]">
                <div className="space-y-4">
                  <div className="flex flex-col gap-4 rounded-2xl border border-border/50 bg-muted/20 p-4 sm:p-5">
                    <div className="aspect-[4/3] w-full overflow-hidden rounded-xl border bg-white">
                      <img src={primaryImage} alt={furniture.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="space-y-2">
                      <Badge className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                        {furniture.category}
                      </Badge>
                      <h3 className="text-xl sm:text-2xl font-semibold text-foreground">{furniture.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span className="text-lg font-semibold text-foreground">${furniture.price.toFixed(2)}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className={furniture.stock > 0 ? "text-green-600" : "text-destructive"}>
                          {furniture.stock > 0 ? `${furniture.stock} in stock` : "Out of stock"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-2xl border border-border/40 bg-background/90 p-4 sm:p-5 shadow-sm">
                    <p className="text-base font-semibold text-foreground">Where should we send your request?</p>
                    <div className="space-y-3">
                      <label className="flex items-start gap-3 rounded-xl border border-border/40 bg-white px-4 py-3 text-sm text-muted-foreground shadow-sm">
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 accent-primary"
                          checked={sendViaWhatsApp}
                          onChange={(event) => setSendViaWhatsApp(event.target.checked)}
                        />
                        <span className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                          <span className="flex items-center gap-2 text-foreground font-medium">
                            <MessageCircle className="h-4 w-4 text-green-600" />
                            WhatsApp message
                          </span>
                          {!whatsappNumber && <span className="text-xs text-destructive">Number not configured</span>}
                        </span>
                      </label>
                      <label className="flex items-start gap-3 rounded-xl border border-border/40 bg-white px-4 py-3 text-sm text-muted-foreground shadow-sm">
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 accent-primary"
                          checked={sendViaEmail}
                          onChange={(event) => setSendViaEmail(event.target.checked)}
                        />
                        <span className="flex items-center gap-2 text-foreground font-medium">
                          <Mail className="h-4 w-4 text-primary" />
                          Email confirmation
                        </span>
                      </label>
                    </div>
                    <p className="text-xs leading-snug text-muted-foreground/80">
                      We log every request in your dashboard so our team can follow up even if you skip email or WhatsApp.
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-muted-foreground" htmlFor="order-name">
                      Your Name*
                    </label>
                    <Input
                      id="order-name"
                      placeholder="John Doe"
                      value={formValues.name}
                      onChange={(event) => setFormValues((prev) => ({ ...prev, name: event.target.value }))}
                      className="h-12 rounded-xl border-border/60 bg-background/80"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-muted-foreground" htmlFor="order-email">
                        Email
                      </label>
                      <Input
                        id="order-email"
                        type="email"
                        placeholder="you@example.com"
                        value={formValues.email}
                        onChange={(event) => setFormValues((prev) => ({ ...prev, email: event.target.value }))}
                        className="h-12 rounded-xl border-border/60 bg-background/80"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-muted-foreground" htmlFor="order-phone">
                        Phone / WhatsApp
                      </label>
                      <Input
                        id="order-phone"
                        placeholder="+383 44 123 456"
                        value={formValues.phone}
                        onChange={(event) => setFormValues((prev) => ({ ...prev, phone: event.target.value }))}
                        className="h-12 rounded-xl border-border/60 bg-background/80"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-muted-foreground" htmlFor="order-message">
                      Order Notes
                    </label>
                    <Textarea
                      id="order-message"
                      placeholder="Share dimensions, delivery details or anything else we should know."
                      rows={6}
                      value={formValues.message}
                      onChange={(event) => setFormValues((prev) => ({ ...prev, message: event.target.value }))}
                      className="rounded-xl border-border/60 bg-background/80"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border/40 bg-muted/10 px-6 py-4 sm:px-8 sm:py-4">
            <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground/80">
                By submitting, you agree to be contacted about this furniture piece and our terms of service.
              </p>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="min-w-[180px] rounded-xl text-sm font-semibold">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

