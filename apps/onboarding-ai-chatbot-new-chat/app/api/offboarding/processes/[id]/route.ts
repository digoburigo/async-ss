import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get process details
    const { data: process, error: processError } = await supabase
      .from("offboarding_processes")
      .select("*")
      .eq("id", id)
      .single();

    if (processError) {
      console.error("[v0] Error fetching process:", processError);
      return NextResponse.json(
        { error: processError.message },
        { status: 500 }
      );
    }

    // Get progress with step details
    const { data: progress, error: progressError } = await supabase
      .from("offboarding_progress")
      .select(`
        *,
        step:offboarding_checklist_steps(*)
      `)
      .eq("process_id", id)
      .order("step(order_index)", { ascending: true });

    if (progressError) {
      console.error("[v0] Error fetching progress:", progressError);
    }

    // Get handover tasks
    const { data: handoverTasks, error: tasksError } = await supabase
      .from("offboarding_handover_tasks")
      .select("*")
      .eq("process_id", id)
      .order("created_at", { ascending: true });

    if (tasksError) {
      console.error("[v0] Error fetching handover tasks:", tasksError);
    }

    return NextResponse.json({
      process,
      progress: progress || [],
      handoverTasks: handoverTasks || [],
    });
  } catch (error) {
    console.error("[v0] Exception fetching process details:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const { data: process, error } = await supabase
      .from("offboarding_processes")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[v0] Error updating process:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ process });
  } catch (error) {
    console.error("[v0] Exception updating process:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { error } = await supabase
      .from("offboarding_processes")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[v0] Error deleting process:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[v0] Exception deleting process:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
