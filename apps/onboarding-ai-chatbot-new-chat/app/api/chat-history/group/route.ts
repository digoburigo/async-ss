import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Number.parseInt(searchParams.get("limit") || "50");

    const supabase = await createServerClient();

    const { data: messages, error } = await supabase
      .from("group_chat_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching group chat history:", error);
      return NextResponse.json(
        { error: "Failed to fetch chat history" },
        { status: 500 }
      );
    }

    return NextResponse.json({ messages: (messages || []).reverse() });
  } catch (error) {
    console.error("Error in group chat history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const userName =
      user.user_metadata?.name || user.email?.split("@")[0] || "Usuário";

    const messageData: any = {
      user_id: user.id,
      user_name: userName,
      message,
      message_type: "user",
    };

    // Try to insert without session_id first
    let { data: savedMessage, error } = await supabase
      .from("group_chat_messages")
      .insert(messageData)
      .select()
      .single();

    // If it fails due to session_id constraint, retry with session_id
    if (error && error.message?.includes("session_id")) {
      console.log("[v0] Retrying with session_id for backward compatibility");
      messageData.session_id = user.id; // Use user_id as session_id for backward compatibility

      const retry = await supabase
        .from("group_chat_messages")
        .insert(messageData)
        .select()
        .single();

      savedMessage = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error("Error saving group message:", error);
      return NextResponse.json(
        {
          error: "Failed to save message",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: savedMessage });
  } catch (error) {
    console.error("Error in group chat save:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
