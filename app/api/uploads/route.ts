import { NextResponse } from "next/server"
import { put } from "@vercel/blob"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")
    const token = process.env.BLOB_READ_WRITE_TOKEN

    if (!token) {
      console.error("[upload] Missing BLOB_READ_WRITE_TOKEN environment variable.")
      return NextResponse.json({ error: "Upload service is not configured." }, { status: 500 })
    }

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 })
    }

    const fileName = formData.get("fileName")
    const timestamp = Date.now()
    const extension = file instanceof File && file.name.includes(".") ? file.name.substring(file.name.lastIndexOf(".")) : ""
    const safeName = typeof fileName === "string" && fileName.trim().length > 0 ? fileName.trim().replace(/\s+/g, "-").toLowerCase() : "upload"
    const blobName = `furniture/${safeName}-${timestamp}${extension}`

    const result = await put(blobName, file, {
      access: "public",
      token,
    })

    return NextResponse.json({ url: result.url })
  } catch (error) {
    console.error("[upload] Failed to upload image:", error)
    return NextResponse.json({ error: "Failed to upload image." }, { status: 500 })
  }
}

