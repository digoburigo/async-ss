import { streamText } from "ai";
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, parentMessageId } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    console.log("[v0] Group chat AI request from user:", user.id);

    // Generate AI response
    const result = streamText({
      model: "openai/gpt-4o-mini",
      system: `Você é um assistente da Farben, uma empresa de tintas. 
      Você está em um chat em grupo com funcionários da empresa.
      Responda de forma amigável, profissional e útil.
      Mantenha as respostas concisas e relevantes para o contexto de uma empresa de tintas.`,
      prompt: message,
      maxTokens: 500,
      temperature: 0.7,
    });

    // Collect the full response
    let fullResponse = "";
    for await (const chunk of result.textStream) {
      fullResponse += chunk;
    }

    console.log("[v0] AI response generated, length:", fullResponse.length);

    const { data: savedMessage, error: saveError } = await supabase
      .from("group_chat_messages")
      .insert({
        user_id: user.id,
        user_name: "Assistente Farben",
        message: fullResponse,
        message_type: "ai",
        parent_message_id: parentMessageId || null,
        metadata: { model: "gpt-4o-mini", prompt_length: message.length },
      })
      .select()
      .single();

    if (saveError) {
      console.error("Error saving AI message:", saveError);
      return NextResponse.json(
        { error: "Failed to save AI response" },
        { status: 500 }
      );
    }

    console.log("[v0] AI message saved successfully");

    return NextResponse.json({ success: true, message: savedMessage });
  } catch (error) {
    console.error("Error in group chat AI:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
