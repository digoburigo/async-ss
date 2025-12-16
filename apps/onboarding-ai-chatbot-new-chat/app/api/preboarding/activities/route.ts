import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient();
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get("candidate_id");

    if (!candidateId) {
      return NextResponse.json(
        { error: "candidate_id is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("preboarding_activities")
      .select("*")
      .eq("candidate_id", candidateId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[v0] Error fetching activities:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[v0] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    const body = await request.json();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("preboarding_activities")
      .insert({
        ...body,
        created_by: user?.id,
      })
      .select()
      .single();

    if (error) {
      console.error("[v0] Error creating activity:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[v0] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
