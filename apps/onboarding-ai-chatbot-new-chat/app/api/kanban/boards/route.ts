import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: boards, error } = await supabase
      .from("kanban_boards")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[v0] Error fetching boards:", error);
      return NextResponse.json(
        { error: "Failed to fetch boards", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ boards });
  } catch (error) {
    console.error("[v0] Error in boards GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Create board
    const { data: board, error: boardError } = await supabase
      .from("kanban_boards")
      .insert({
        user_id: user.id,
        title,
        description,
      })
      .select()
      .single();

    if (boardError) {
      console.error("[v0] Error creating board:", boardError);
      return NextResponse.json(
        { error: "Failed to create board", details: boardError.message },
        { status: 500 }
      );
    }

    const defaultColumns = [
      { title: "A fazer", position: 0 },
      { title: "Fazendo", position: 1 },
      { title: "Finalizado", position: 2 },
    ];

    const { error: columnsError } = await supabase
      .from("kanban_columns")
      .insert(
        defaultColumns.map((col) => ({
          board_id: board.id,
          title: col.title,
          position: col.position,
        }))
      );

    if (columnsError) {
      console.error("[v0] Error creating columns:", columnsError);
      // Don't fail the request, board was created successfully
    }

    return NextResponse.json({ board });
  } catch (error) {
    console.error("[v0] Error in boards POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
