import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

// GET - List all chat sessions for authenticated user
export async function GET(req: Request) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const employeeType = searchParams.get("employeeType");

    console.log(
      "[v0] Loading chat sessions for user:",
      user.id,
      "type:",
      employeeType
    );

    const serviceSupabase = createServiceRoleClient();

    let query = serviceSupabase
      .from("onboarding_chat_sessions")
      .select("*")
      .eq("session_id", user.id) // Query by session_id which contains auth user ID
      .order("updated_at", { ascending: false });

    if (employeeType) {
      query = query.eq("employee_type", employeeType);
    }

    const { data: sessions, error } = await query;

    if (error) {
      console.error("[v0] Error fetching chat sessions:", error);
      return NextResponse.json(
        { error: "Failed to fetch chat sessions" },
        { status: 500 }
      );
    }

    console.log("[v0] Found", sessions?.length || 0, "chat sessions");

    return NextResponse.json({ sessions: sessions || [] });
  } catch (error) {
    console.error("[v0] Error in chat sessions GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new chat session
export async function POST(req: Request) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { employeeType, title } = await req.json();

    if (!employeeType) {
      return NextResponse.json(
        { error: "Missing employee type" },
        { status: 400 }
      );
    }

    if (employeeType !== "vendedor" && employeeType !== "gerente_estoque") {
      return NextResponse.json(
        { error: "Invalid employee type" },
        { status: 400 }
      );
    }

    console.log(
      "[v0] Creating new chat session for user:",
      user.id,
      "type:",
      employeeType
    );

    const serviceSupabase = createServiceRoleClient();

    // First, ensure the user exists in chat_users table (required for foreign key)
    const { data: chatUser, error: chatUserError } = await serviceSupabase
      .from("chat_users")
      .upsert(
        {
          session_id: user.id,
          name: user.email?.split("@")[0] || "User",
          employee_type: employeeType,
        },
        {
          onConflict: "session_id",
          ignoreDuplicates: false,
        }
      )
      .select()
      .single();

    if (chatUserError) {
      console.error(
        "[v0] Error creating/updating chat user:",
        chatUserError.message
      );
      return NextResponse.json(
        {
          error: "Failed to create chat user",
          details: chatUserError.message,
        },
        { status: 500 }
      );
    }

    console.log("[v0] Chat user ensured:", chatUser.id);

    // Now create the chat session with the chat_users.id
    const { data: chatSession, error } = await serviceSupabase
      .from("onboarding_chat_sessions")
      .insert({
        user_id: chatUser.id, // Use chat_users.id to satisfy foreign key
        session_id: user.id, // Keep auth user ID for reference
        employee_type: employeeType,
        title: title || "Nova Conversa",
      })
      .select()
      .single();

    if (error) {
      console.error("[v0] Error creating chat session:", error.message);
      return NextResponse.json(
        {
          error: "Failed to create chat session",
          details: error.message,
        },
        { status: 500 }
      );
    }

    console.log("[v0] Chat session created successfully:", chatSession.id);

    return NextResponse.json({ session: chatSession });
  } catch (error) {
    console.error("[v0] Error in chat session POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a chat session
export async function DELETE(req: Request) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const chatSessionId = searchParams.get("chatSessionId");

    if (!chatSessionId) {
      return NextResponse.json(
        { error: "Missing chatSessionId" },
        { status: 400 }
      );
    }

    console.log("[v0] Deleting chat session:", chatSessionId);

    const { error } = await supabase
      .from("onboarding_chat_sessions")
      .delete()
      .eq("id", chatSessionId);

    if (error) {
      console.error("[v0] Error deleting chat session:", error);
      return NextResponse.json(
        { error: "Failed to delete chat session" },
        { status: 500 }
      );
    }

    console.log("[v0] Chat session deleted successfully:", chatSessionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[v0] Error in chat session DELETE:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update chat session title
export async function PATCH(req: Request) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatSessionId, title } = await req.json();

    if (!(chatSessionId && title)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("[v0] Updating chat session title:", chatSessionId);

    const { data, error } = await supabase
      .from("onboarding_chat_sessions")
      .update({ title })
      .eq("id", chatSessionId)
      .select()
      .single();

    if (error) {
      console.error("[v0] Error updating chat session:", error);
      return NextResponse.json(
        { error: "Failed to update chat session" },
        { status: 500 }
      );
    }

    console.log("[v0] Chat session updated successfully:", chatSessionId);

    return NextResponse.json({ session: data });
  } catch (error) {
    console.error("[v0] Error in chat session PATCH:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
