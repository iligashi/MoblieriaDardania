import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { requireAdminApi } from "@/lib/auth/admin"
import { slugify } from "@/lib/validation"

// Vercel Functions reject request bodies above 4.5 MB, so enforce that limit explicitly.
const MAX_BYTES = 4.5 * 1024 * 1024
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "image/gif": ".gif",
}

export async function POST(request: Request) {
  const auth = await requireAdminApi()
  if (auth instanceof NextResponse) return auth

  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) {
    console.error("[upload] Missing BLOB_READ_WRITE_TOKEN environment variable.")
    return NextResponse.json({ error: "Sherbimi i ngarkimit nuk eshte konfiguruar." }, { status: 500 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Nuk u dergua asnje skedar." }, { status: 400 })
    }

    // The extension comes from the verified MIME type, never from the user's file name,
    // so an .html or .svg file cannot be stored as a public "image".
    const extension = ALLOWED_TYPES[file.type]
    if (!extension) {
      return NextResponse.json({ error: "Lejohen vetem imazhe JPG, PNG, WEBP, AVIF ose GIF." }, { status: 415 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Imazhi eshte shume i madh (maksimumi 4.5 MB)." }, { status: 413 })
    }

    const requestedName = formData.get("fileName")
    const baseName = slugify(typeof requestedName === "string" ? requestedName : file.name) || "image"
    const blobName = `products/${baseName.slice(0, 60)}-${Date.now()}${extension}`

    const result = await put(blobName, file, {
      access: "public",
      contentType: file.type,
      token,
    })

    return NextResponse.json({ url: result.url })
  } catch (error) {
    console.error("[upload] Failed to upload image:", error)
    return NextResponse.json({ error: "Ngarkimi i imazhit deshtoi." }, { status: 500 })
  }
}
