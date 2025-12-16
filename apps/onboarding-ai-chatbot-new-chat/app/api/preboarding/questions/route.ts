import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient();
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get("candidate_id");
    const questionType = searchParams.get("question_type");

    if (!candidateId) {
      return NextResponse.json(
        { error: "candidate_id is required" },
        { status: 400 }
      );
    }

    let query = supabase
      .from("preboarding_candidate_questions")
      .select("*")
      .eq("candidate_id", candidateId)
      .order("order_index", { ascending: true });

    if (questionType) {
      query = query.eq("question_type", questionType);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[v0] Error fetching questions:", error);
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

    const { data, error } = await supabase
      .from("preboarding_candidate_questions")
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error("[v0] Error creating question:", error);
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
