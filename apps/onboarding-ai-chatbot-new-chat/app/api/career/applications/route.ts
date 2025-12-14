import { createClient } from "@/lib/supabase/server"
import { put } from "@vercel/blob"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const landingPageId = searchParams.get("landing_page_id")

    let query = supabase
      .from("career_applications")
      .select(`
        *,
        career_landing_pages(title, slug),
        preboarding_job_positions(title, department)
      `)
      .order("created_at", { ascending: false })

    if (landingPageId) {
      query = query.eq("landing_page_id", landingPageId)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching applications:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in GET applications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const formData = await request.formData()

    const landingPageId = formData.get("landing_page_id") as string
    const jobPositionId = formData.get("job_position_id") as string | null
    const fullName = formData.get("full_name") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string | null
    const coverLetter = formData.get("cover_letter") as string | null
    const resumeFile = formData.get("resume") as File | null

    if (!landingPageId || !fullName || !email) {
      return NextResponse.json({ error: "Landing page ID, name, and email are required" }, { status: 400 })
    }

    let resumeUrl: string | null = null
    let resumeFilename: string | null = null

    // Upload resume if provided
    if (resumeFile && resumeFile.size > 0) {
      const timestamp = Date.now()
      const sanitizedName = resumeFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")
      const filename = `resumes/${timestamp}_${sanitizedName}`

      const blob = await put(filename, resumeFile, {
        access: "public",
      })

      resumeUrl = blob.url
      resumeFilename = resumeFile.name
    }

    const { data, error } = await supabase
      .from("career_applications")
      .insert({
        landing_page_id: landingPageId,
        job_position_id: jobPositionId || null,
        full_name: fullName,
        email,
        phone: phone || null,
        cover_letter: coverLetter || null,
        resume_url: resumeUrl,
        resume_filename: resumeFilename,
        status: "pending",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating application:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error in POST application:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
