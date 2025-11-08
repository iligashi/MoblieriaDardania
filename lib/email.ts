"use client"

import emailjs from "@emailjs/browser"

interface OrderEmailParams {
  furnitureTitle: string
  furniturePrice: number
  customerName: string
  customerEmail?: string
  customerPhone?: string
  customerMessage?: string
}

export async function sendOrderEmail({
  furnitureTitle,
  furniturePrice,
  customerName,
  customerEmail,
  customerPhone,
  customerMessage,
}: OrderEmailParams) {
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

  if (!serviceId || !templateId || !publicKey) {
    throw new Error(
      "EmailJS environment variables are missing. Please set NEXT_PUBLIC_EMAILJS_SERVICE_ID, NEXT_PUBLIC_EMAILJS_TEMPLATE_ID, and NEXT_PUBLIC_EMAILJS_PUBLIC_KEY."
    )
  }

  const templateParams = {
    furniture_title: furnitureTitle,
    furniture_price: furniturePrice.toFixed(2),
    customer_name: customerName,
    customer_email: customerEmail ?? "N/A",
    customer_phone: customerPhone ?? "N/A",
    customer_message: customerMessage ?? "N/A",
  }

  await emailjs.send(serviceId, templateId, templateParams, { publicKey })
}
