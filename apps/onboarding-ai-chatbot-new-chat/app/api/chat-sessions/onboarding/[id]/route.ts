import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

function isValidUUID(str: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// GET - Get a specific chat session by ID
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: "Invalid session ID format" },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const serviceSupabase = createServiceRoleClient();

    // Fetch the specific session directly by ID
    const { data: session, error } = await serviceSupabase
      .from("onboarding_chat_sessions")
      .select("*")
      .eq("id", id)
      .eq("session_id", user.id)
      .single();

    if (error) {
      console.error("[v0] Error fetching chat session:", error);
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Session not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: "Failed to fetch chat session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error("[v0] Error in chat session GET by ID:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
