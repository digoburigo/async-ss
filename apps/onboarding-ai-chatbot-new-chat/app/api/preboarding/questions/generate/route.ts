import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { generateText } from "ai"

export async function POST(request: Request) {
  try {
    console.log("[v0] Generate questions API called")
    const supabase = await createServerClient()

    let body
    try {
      body = await request.json()
    } catch (e) {
      console.error("[v0] Failed to parse request body:", e)
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    const { candidate_id, position, department } = body

    console.log("[v0] Request body:", { candidate_id, position, department })

    if (!candidate_id || !position) {
      console.log("[v0] Missing required fields")
      return NextResponse.json({ error: "candidate_id and position are required" }, { status: 400 })
    }

    console.log("[v0] Starting AI generation with model: openai/gpt-4o-mini")

    // Generate questions using AI with generateText
    let text
    try {
      const result = await generateText({
        model: "openai/gpt-4o-mini",
        prompt: `Você é um especialista em recrutamento e seleção. Gere 10 perguntas de entrevista para um candidato à vaga de "${position}"${department ? ` no departamento de "${department}"` : ""}.

Divida as perguntas em duas categorias:

## HARD SKILLS (5 perguntas)
Gere 5 perguntas técnicas específicas para a área de ${position}. As perguntas devem avaliar:
- Conhecimento técnico específico da função
- Experiência prática com ferramentas e tecnologias
- Capacidade de resolução de problemas técnicos
- Conhecimento de boas práticas da área

## SOFT SKILLS / FIT CULTURAL (5 perguntas)
Gere 5 perguntas comportamentais usando a técnica de gatilhos conversacionais. Use os seguintes princípios:

1. **Humildade e Aprendizado**: Use uma abertura amigável que normalize situações difíceis. Por exemplo:
   - "Sabe, todo mundo que trabalha com [área] há algum tempo tem aquela história de um dia que as coisas não saíram como planejado..."
   - "Você se lembra de alguma situação recente que foi um grande 'dia de aprendizado'? Um daqueles dias que te pegou de surpresa e te ensinou algo?"

2. **Gestão de Conflito**: Use contexto colaborativo e palavras positivas como "debate" em vez de "discordância":
   - "Aqui na empresa, valorizamos muito o debate técnico saudável. As melhores soluções aparecem quando várias ideias são colocadas na mesa..."
   - "Me conte sobre um debate interessante que você participou recentemente. Quais eram os diferentes pontos de vista e como chegaram a uma decisão?"

3. **Qualidade e Processos**: Foque no "orgulho" e no positivo:
   - "Pensando nos últimos projetos, qual foi aquele que te deu mais orgulho? Aquele que você olhou e pensou 'isso aqui ficou realmente bom'."
   - "O que fez essa entrega ser tão boa para você?"

4. **Proatividade e Comunicação**: Normalize situações do dia a dia:
   - "Uma coisa comum é receber uma tarefa que parece simples, mas quando você vai olhar, a especificação está meio vaga..."
   - "Como você costuma lidar quando percebe que a descrição não bate 100% com a necessidade real?"

As perguntas de soft skills devem ser conversacionais, não parecer um interrogatório. O objetivo é criar um ambiente onde o candidato se sinta confortável para contar histórias reais.

Responda APENAS com um JSON válido no seguinte formato (sem markdown, sem explicações, apenas o JSON puro):
{
  "hard_skills": [
    {"question": "pergunta aqui", "expected_answer": "resposta esperada opcional"},
    ...
  ],
  "soft_skills": [
    {"question": "pergunta aqui", "expected_answer": "resposta esperada opcional"},
    ...
  ]
}`,
      })
      text = result.text
      console.log("[v0] AI response received, length:", text.length)
    } catch (aiError) {
      console.error("[v0] AI generation error:", aiError)
      return NextResponse.json(
        {
          error: "Failed to generate questions with AI",
          details: aiError instanceof Error ? aiError.message : String(aiError),
        },
        { status: 500 },
      )
    }

    console.log("[v0] Parsing AI response...")

    // Parse and validate the JSON response
    let questions
    try {
      // Try to extract JSON from the response (handle markdown code blocks)
      let jsonText = text.trim()

      // Remove markdown code blocks if present
      if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "")
      }

      // Try to find JSON object in the text
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        jsonText = jsonMatch[0]
      }

      questions = JSON.parse(jsonText)
      console.log("[v0] JSON parsed successfully")
    } catch (parseError) {
      console.error("[v0] Error parsing AI response:", parseError)
      console.error("[v0] AI response text:", text.substring(0, 500))
      return NextResponse.json(
        {
          error: "Failed to parse AI response as JSON",
          aiResponse: text.substring(0, 200),
        },
        { status: 500 },
      )
    }

    // Validate the structure
    if (
      !questions.hard_skills ||
      !Array.isArray(questions.hard_skills) ||
      !questions.soft_skills ||
      !Array.isArray(questions.soft_skills)
    ) {
      console.error("[v0] Invalid question structure:", questions)
      return NextResponse.json(
        {
          error: "AI response has invalid structure",
          received: questions,
        },
        { status: 500 },
      )
    }

    console.log("[v0] Questions validated:", {
      hard_skills_count: questions.hard_skills.length,
      soft_skills_count: questions.soft_skills.length,
    })

    // Save questions to database
    const questionsToInsert = [
      ...questions.hard_skills.map((q: any, index: number) => ({
        candidate_id,
        question_type: "hard_skills",
        question: q.question,
        expected_answer: q.expected_answer || null,
        order_index: index,
      })),
      ...questions.soft_skills.map((q: any, index: number) => ({
        candidate_id,
        question_type: "soft_skills",
        question: q.question,
        expected_answer: q.expected_answer || null,
        order_index: index,
      })),
    ]

    console.log("[v0] Inserting", questionsToInsert.length, "questions into database...")
    const { data, error } = await supabase.from("preboarding_candidate_questions").insert(questionsToInsert).select()

    if (error) {
      console.error("[v0] Database error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Questions saved successfully:", data?.length)
    return NextResponse.json({ success: true, questions: data })
  } catch (error) {
    console.error("[v0] Unexpected error in generate questions:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
