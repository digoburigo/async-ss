import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from("preboarding_candidates")
      .select(`
        *,
        stage:preboarding_stages(id, name, color, order_index)
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("[v0] Error fetching candidate:", error);
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerClient();
    const body = await request.json();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Get current candidate for stage change tracking
    const { data: currentCandidate } = await supabase
      .from("preboarding_candidates")
      .select("*, stage:preboarding_stages(name)")
      .eq("id", id)
      .single();

    const { data, error } = await supabase
      .from("preboarding_candidates")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(`
        *,
        stage:preboarding_stages(id, name, color, order_index)
      `)
      .single();

    if (error) {
      console.error("[v0] Error updating candidate:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log stage change activity
    if (
      body.stage_id &&
      currentCandidate &&
      body.stage_id !== currentCandidate.stage_id
    ) {
      const { data: newStage } = await supabase
        .from("preboarding_stages")
        .select("name")
        .eq("id", body.stage_id)
        .single();

      await supabase.from("preboarding_activities").insert({
        candidate_id: id,
        activity_type: "stage_change",
        title: "Etapa alterada",
        description: `Movido de "${currentCandidate.stage?.name || "Sem etapa"}" para "${newStage?.name || "Nova etapa"}"`,
        created_by: user?.id,
      });
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerClient();

    const { error } = await supabase
      .from("preboarding_candidates")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[v0] Error deleting candidate:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[v0] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
