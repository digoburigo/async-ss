import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: landingPages, error } = await supabase
      .from("career_landing_pages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching landing pages:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch job associations for each landing page
    const { data: jobAssociations, error: jobError } = await supabase
      .from("career_landing_page_jobs")
      .select("landing_page_id, job_position_id");

    if (jobError) {
      console.error("Error fetching job associations:", jobError);
    }

    // Map job_ids to each landing page
    const landingPagesWithJobs = landingPages.map((page) => ({
      ...page,
      job_ids:
        jobAssociations
          ?.filter((assoc) => assoc.landing_page_id === page.id)
          .map((assoc) => assoc.job_position_id) || [],
    }));

    return NextResponse.json(landingPagesWithJobs);
  } catch (error) {
    console.error("Error in GET landing pages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const {
      title,
      slug,
      description,
      company_name,
      company_description,
      is_active,
      job_ids,
    } = body;

    if (!(title && slug)) {
      return NextResponse.json(
        { error: "Title and slug are required" },
        { status: 400 }
      );
    }

    const finalSlug =
      slug ||
      title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

    const { data, error } = await supabase
      .from("career_landing_pages")
      .insert({
        title,
        slug: finalSlug,
        description,
        company_name: company_name || "Nossa Empresa",
        company_description,
        is_active: is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating landing page:", error);
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Slug already exists" },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (job_ids && job_ids.length > 0) {
      const jobAssociations = job_ids.map((jobId: string) => ({
        landing_page_id: data.id,
        job_position_id: jobId,
      }));

      const { error: jobError } = await supabase
        .from("career_landing_page_jobs")
        .insert(jobAssociations);

      if (jobError) {
        console.error("Error creating job associations:", jobError);
      }
    }

    return NextResponse.json(
      { ...data, job_ids: job_ids || [] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST landing page:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
