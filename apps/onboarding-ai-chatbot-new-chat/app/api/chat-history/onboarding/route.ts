import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const chatSessionId = searchParams.get("chatSessionId")

    if (!chatSessionId) {
      return NextResponse.json({ error: "Missing chatSessionId" }, { status: 400 })
    }

    console.log("[v0] Loading chat history for session:", chatSessionId)

    const supabase = await createServerClient()

    const { data: session, error: sessionError } = await supabase
      .from("onboarding_chat_sessions")
      .select("id")
      .eq("id", chatSessionId)
      .single()

    if (sessionError || !session) {
      console.error("[v0] Chat session not found:", chatSessionId)
      return NextResponse.json({ error: "Chat session not found" }, { status: 404 })
    }

    const { data: messages, error } = await supabase
      .from("onboarding_chats")
      .select("*")
      .eq("chat_session_id", chatSessionId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("[v0] Error fetching onboarding chat history:", error)
      return NextResponse.json({ error: "Failed to fetch chat history" }, { status: 500 })
    }

    console.log("[v0] Loaded", messages?.length || 0, "messages for session:", chatSessionId)

    return NextResponse.json({ messages: messages || [] })
  } catch (error) {
    console.error("[v0] Error in onboarding chat history GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { chatSessionId, role, content } = await req.json()

    console.log("[v0] POST request received:", {
      chatSessionId,
      role,
      contentLength: content?.length || 0,
    })

    if (!chatSessionId || !role || !content) {
      console.error("[v0] Missing required fields:", { chatSessionId, role, hasContent: !!content })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (role !== "user" && role !== "assistant") {
      console.error("[v0] Invalid role:", role)
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    console.log("[v0] Saving message for session:", chatSessionId, "role:", role)

    const supabase = await createServerClient()

    const { data: chatSession, error: sessionError } = await supabase
      .from("onboarding_chat_sessions")
      .select("user_id, session_id, employee_type")
      .eq("id", chatSessionId)
      .single()

    if (sessionError || !chatSession) {
      console.error("[v0] Error fetching chat session:", sessionError)
      return NextResponse.json({ error: "Chat session not found" }, { status: 404 })
    }

    console.log("[v0] Chat session found:", {
      userId: chatSession.user_id,
      employeeType: chatSession.employee_type,
    })

    const { data: recentMessages } = await supabase
      .from("onboarding_chats")
      .select("content, role, created_at")
      .eq("chat_session_id", chatSessionId)
      .eq("role", role)
      .order("created_at", { ascending: false })
      .limit(1)

    if (recentMessages && recentMessages.length > 0) {
      const lastMessage = recentMessages[0]
      const timeDiff = Date.now() - new Date(lastMessage.created_at).getTime()

      if (lastMessage.content === content && timeDiff < 2000) {
        console.log("[v0] Duplicate message detected, skipping save")
        return NextResponse.json({ success: true, skipped: true, reason: "duplicate" })
      }
    }

    const { data: insertedMessage, error: insertError } = await supabase
      .from("onboarding_chats")
      .insert({
        user_id: chatSession.user_id,
        session_id: chatSession.session_id,
        employee_type: chatSession.employee_type,
        chat_session_id: chatSessionId,
        role,
        content,
      })
      .select()
      .single()

    if (insertError) {
      console.error("[v0] Error saving onboarding message:", insertError)
      return NextResponse.json({ error: "Failed to save message", details: insertError.message }, { status: 500 })
    }

    console.log("[v0] Message inserted successfully:", insertedMessage?.id)

    const { error: updateError } = await supabase
      .from("onboarding_chat_sessions")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", chatSessionId)

    if (updateError) {
      console.error("[v0] Error updating session timestamp:", updateError)
    }

    console.log("[v0] Message saved successfully for session:", chatSessionId)

    return NextResponse.json({ success: true, messageId: insertedMessage?.id })
  } catch (error) {
    console.error("[v0] Error in onboarding chat save:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
