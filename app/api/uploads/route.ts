import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { requireAdminApi } from "@/lib/auth/admin"
import { slugify } from "@/lib/validation"
import { rateLimit } from "@/lib/rate-limit"

// Vercel Functions reject request bodies above 4.5 MB, so enforce that limit explicitly.
const MAX_BYTES = 4.5 * 1024 * 1024
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "image/gif": ".gif",
}

/** Identifies an image by its magic bytes. Returns null for anything else. */
function sniffImageType(b: Uint8Array): string | null {
  const ascii = (from: number, to: number) => String.fromCharCode(...b.slice(from, to))
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg"
  if (b[0] === 0x89 && ascii(1, 4) === "PNG") return "image/png"
  if (ascii(0, 4) === "GIF8") return "image/gif"
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp"
  if (ascii(4, 8) === "ftyp" && ["avif", "avis"].includes(ascii(8, 12))) return "image/avif"
  return null
}

export async function POST(request: Request) {
  const auth = await requireAdminApi()
  if (auth instanceof NextResponse) return auth

  const limited = await rateLimit(request, "upload", auth.user.id)
  if (limited) return limited

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

    // The declared MIME type comes from the browser; check the file's real signature too.
    const head = new Uint8Array(await file.slice(0, 16).arrayBuffer())
    if (sniffImageType(head) !== file.type) {
      return NextResponse.json({ error: "Skedari nuk eshte nje imazh i vlefshem." }, { status: 415 })
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
