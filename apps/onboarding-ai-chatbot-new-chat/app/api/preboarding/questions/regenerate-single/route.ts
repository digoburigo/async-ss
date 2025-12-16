import { generateText } from "ai";
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();

    const body = await request.json();
    const {
      question_id,
      candidate_id,
      position,
      department,
      question_type,
      current_question,
      is_ai_generated,
    } = body;

    if (
      !(
        question_id &&
        candidate_id &&
        position &&
        question_type &&
        current_question
      )
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate a new question using AI with context from the current question
    const skillTypeLabel =
      question_type === "hard_skills"
        ? "Hard Skills (técnica)"
        : "Soft Skills (comportamental)";

    const prompt = is_ai_generated
      ? `Você é um especialista em recrutamento. Gere UMA nova pergunta de entrevista de ${skillTypeLabel} para um candidato à vaga de "${position}"${department ? ` no departamento de "${department}"` : ""}.

A pergunta atual que precisa ser substituída é:
"${current_question}"

Gere uma pergunta DIFERENTE mas que avalie competências semelhantes. ${question_type === "soft_skills" ? "Use técnicas de gatilhos conversacionais para criar um ambiente confortável." : "Foque em conhecimento técnico prático."}

Responda APENAS com um JSON válido (sem markdown):
{"question": "sua nova pergunta aqui", "expected_answer": "resposta esperada opcional"}`
      : `Você é um especialista em recrutamento. O entrevistador criou uma pergunta personalizada e quer uma sugestão de melhoria ou variação.

Pergunta original do entrevistador:
"${current_question}"

Tipo: ${skillTypeLabel}
Cargo: ${position}${department ? `\nDepartamento: ${department}` : ""}

Gere uma versão melhorada ou uma variação da pergunta que mantenha a intenção original mas seja mais efetiva para avaliar o candidato.

Responda APENAS com um JSON válido (sem markdown):
{"question": "sua pergunta melhorada aqui", "expected_answer": "resposta esperada opcional"}`;

    const result = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
    });

    // Parse the response
    let newQuestion;
    try {
      let jsonText = result.text.trim();
      if (jsonText.startsWith("```")) {
        jsonText = jsonText
          .replace(/^```(?:json)?\n?/, "")
          .replace(/\n?```$/, "");
      }
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }
      newQuestion = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("[v0] Error parsing AI response:", parseError);
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    // Update the question in the database
    const { data, error } = await supabase
      .from("preboarding_candidate_questions")
      .update({
        question: newQuestion.question,
        expected_answer: newQuestion.expected_answer || null,
        answer: null, // Clear the previous answer
        rating: null,
        notes: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", question_id)
      .select()
      .single();

    if (error) {
      console.error("[v0] Database error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, question: data });
  } catch (error) {
    console.error("[v0] Error regenerating single question:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
