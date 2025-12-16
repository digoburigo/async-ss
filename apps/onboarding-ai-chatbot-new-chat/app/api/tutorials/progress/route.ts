import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: progress, error } = await supabase
      .from("tutorial_step_progress")
      .select("*")
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json(progress);
  } catch (error) {
    console.error("Error fetching tutorial progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch tutorial progress" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const body = await request.json();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("tutorial_step_progress")
      .upsert({
        user_id: user.id,
        step_id: body.step_id,
        completed: body.completed,
        completed_at: body.completed ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating tutorial progress:", error);
    return NextResponse.json(
      { error: "Failed to update tutorial progress" },
      { status: 500 }
    );
  }
}
