import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET messages for a conversation
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify user owns this conversation
    const { data: conversation } = await supabase
      .from("knowledge_chat_conversations")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    const { data: messages, error } = await supabase
      .from("knowledge_chat_messages")
      .select("*")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching messages:", error)
      return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
    }

    return NextResponse.json({ messages: messages || [] })
  } catch (error) {
    console.error("Error in get messages:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST save message (user or assistant)
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify user owns this conversation
    const { data: conversation } = await supabase
      .from("knowledge_chat_conversations")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    const { role, content } = await req.json()

    if (!role || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data: message, error } = await supabase
      .from("knowledge_chat_messages")
      .insert({
        conversation_id: id,
        role,
        content,
      })
      .select()
      .single()

    if (error) {
      console.error("Error saving message:", error)
      return NextResponse.json({ error: "Failed to save message" }, { status: 500 })
    }

    // Update conversation updated_at
    await supabase.from("knowledge_chat_conversations").update({ updated_at: new Date().toISOString() }).eq("id", id)

    return NextResponse.json({ message })
  } catch (error) {
    console.error("Error in save message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
