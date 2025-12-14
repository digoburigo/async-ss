import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const supabase = await createClient()

    // Get landing page by slug
    const { data: landingPage, error: lpError } = await supabase
      .from("career_landing_pages")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single()

    if (lpError || !landingPage) {
      return NextResponse.json({ error: "Landing page not found" }, { status: 404 })
    }

    const { data: linkedJobs, error: linkedJobsError } = await supabase
      .from("career_landing_page_jobs")
      .select("job_position_id")
      .eq("landing_page_id", landingPage.id)

    if (linkedJobsError) {
      console.error("Error fetching linked jobs:", linkedJobsError)
      return NextResponse.json({
        landingPage,
        jobs: [],
      })
    }

    const jobIds = linkedJobs?.map((lj) => lj.job_position_id) || []

    // If no jobs are linked, return empty array
    if (jobIds.length === 0) {
      return NextResponse.json({
        landingPage,
        jobs: [],
      })
    }

    // Fetch the actual job details for the linked jobs
    const { data: jobs, error: jobsError } = await supabase
      .from("preboarding_job_positions")
      .select("*")
      .in("id", jobIds)
      .eq("status", "active")
      .order("created_at", { ascending: false })

    if (jobsError) {
      console.error("Error fetching jobs:", jobsError)
    }

    return NextResponse.json({
      landingPage,
      jobs: jobs || [],
    })
  } catch (error) {
    console.error("Error in GET public landing page:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
