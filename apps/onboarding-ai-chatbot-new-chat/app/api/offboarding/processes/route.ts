import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");

    let query = supabase
      .from("offboarding_processes")
      .select("*")
      .order("created_at", { ascending: false });

    if (userId) {
      query = query.eq("user_id", userId);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data: processes, error } = await query;

    if (error) {
      console.error("[v0] Error fetching offboarding processes:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ processes });
  } catch (error) {
    console.error("[v0] Exception fetching offboarding processes:", error);
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
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      user_id,
      employee_name,
      employee_email,
      department,
      last_working_day,
      reason,
      notes,
    } = body;

    // Create the offboarding process
    const { data: process, error: processError } = await supabase
      .from("offboarding_processes")
      .insert({
        user_id: user_id || user.id,
        initiated_by: user.id,
        employee_name,
        employee_email,
        department,
        last_working_day,
        reason,
        notes,
        status: "in_progress",
      })
      .select()
      .single();

    if (processError) {
      console.error("[v0] Error creating offboarding process:", processError);
      return NextResponse.json(
        { error: processError.message },
        { status: 500 }
      );
    }

    // Get all checklist steps
    const { data: steps } = await supabase
      .from("offboarding_checklist_steps")
      .select("id");

    // Create progress entries for each step
    if (steps && steps.length > 0) {
      const progressEntries = steps.map((step) => ({
        process_id: process.id,
        step_id: step.id,
        completed: false,
      }));

      const { error: progressError } = await supabase
        .from("offboarding_progress")
        .insert(progressEntries);

      if (progressError) {
        console.error("[v0] Error creating progress entries:", progressError);
      }
    }

    return NextResponse.json({ process });
  } catch (error) {
    console.error("[v0] Exception creating offboarding process:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
