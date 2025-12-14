import { createClient } from "@/lib/supabase/server"
import { del } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data, error } = await supabase.from("preboarding_candidate_documents").select("*").eq("id", id).single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching document:", error)
    return NextResponse.json({ error: "Failed to fetch document" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get document to delete blob
    const { data: doc, error: fetchError } = await supabase
      .from("preboarding_candidate_documents")
      .select("file_url")
      .eq("id", id)
      .single()

    if (fetchError) throw fetchError

    // Delete from Vercel Blob
    if (doc?.file_url) {
      try {
        await del(doc.file_url)
      } catch (blobError) {
        console.error("Error deleting blob:", blobError)
      }
    }

    // Delete from database
    const { error } = await supabase.from("preboarding_candidate_documents").delete().eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting document:", error)
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 })
  }
}
